"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, Ban, Calendar, CreditCard } from "lucide-react"
import { SubscriptionStatus, PaymentHistory } from "@/lib/types"

interface SubscriptionStatusProps {
  userId?: number
}

export function SubscriptionStatusComponent({ userId }: SubscriptionStatusProps) {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscriptionStatus()
    fetchPaymentHistory()
  }, [userId])

  const fetchSubscriptionStatus = async () => {
    try {
      const params = userId ? `?userId=${userId}` : ''
      const response = await fetch(`/api/subscription/status${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data.data)
      } else {
        throw new Error('Error cargando estado de suscripción')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching subscription status:', err)
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      const params = userId ? `?userId=${userId}` : ''
      const response = await fetch(`/api/admin/payments${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setPaymentHistory(data.data || [])
      }
      // No mostrar error si no se pueden cargar los pagos (puede ser por permisos)
    } catch (err) {
      console.error('Error fetching payment history:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'En deuda':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'En gracia':
        return <Clock className="h-5 w-5 text-orange-600" />
      case 'Bloqueado Parcial':
        return <Ban className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800'
      case 'En deuda':
        return 'bg-yellow-100 text-yellow-800'
      case 'En gracia':
        return 'bg-orange-100 text-orange-800'
      case 'Bloqueado Parcial':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !status) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || 'No se pudo cargar el estado de suscripción'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(status.estado)}
            Estado de Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Estado actual:</span>
            <Badge className={getStatusColor(status.estado)}>
              {status.estado}
            </Badge>
          </div>

          {status.fecha_proximo_vencimiento && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Próximo vencimiento:</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(status.fecha_proximo_vencimiento)}
              </span>
            </div>
          )}

          {status.dias_restantes !== undefined && status.dias_restantes > 0 && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Días restantes:</span>
              <Badge variant="outline" className="text-orange-600">
                {status.dias_restantes} días
              </Badge>
            </div>
          )}

          {status.mensaje && (
            <Alert className={status.estado === 'Activo' ? '' : 'border-orange-200 bg-orange-50'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {status.mensaje}
              </AlertDescription>
            </Alert>
          )}

          {!status.puede_acceder_qr && (
            <Alert variant="destructive">
              <Ban className="h-4 w-4" />
              <AlertTitle>QR Deshabilitado</AlertTitle>
              <AlertDescription>
                Tus clientes no pueden acceder a tus tiendas hasta que regularices el pago.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Historial de pagos */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Historial de Pagos
            </CardTitle>
            <CardDescription>
              Últimos pagos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.slice(0, 5).map((pago) => (
                <div key={pago.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{formatDate(pago.fecha_pago)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Período: {pago.periodo_pagado} • ${pago.monto.toFixed(2)}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {pago.metodo_pago === 'manual' ? 'Manual' : 'Automático'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
