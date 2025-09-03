"use client"

import { useState, useEffect } from "react"
import { PaymentRegistrationComponent } from "@/components/payment-registration"
import { SubscriptionStatusComponent } from "@/components/subscription-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Users, 
  RefreshCw, 
  Search, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban
} from "lucide-react"

interface UserSummary {
  id: number
  email: string
  company_name: string
  estado_suscripcion: string
  fecha_proximo_vencimiento?: string
  dias_gracia_restantes: number
  ultimo_pago?: string
}

export default function SubscriptionManagementPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [users, setUsers] = useState<UserSummary[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserSummary[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Filtrar usuarios basado en el término de búsqueda
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm)
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        throw new Error('Error cargando usuarios')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAllStates = async () => {
    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/subscription/status', {
        method: 'PUT'
      })

      if (response.ok) {
        setSuccess('Estados de suscripción actualizados exitosamente')
        await fetchUsers() // Recargar la lista
      } else {
        throw new Error('Error actualizando estados')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando estados')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'En deuda':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'En gracia':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'Bloqueado Parcial':
        return <Ban className="h-4 w-4 text-red-600" />
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handlePaymentRegistered = () => {
    setSuccess('¡Pago registrado exitosamente!')
    fetchUsers() // Recargar usuarios después del pago
    setTimeout(() => setSuccess(null), 5000)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Suscripciones</h1>
          <p className="text-muted-foreground mt-1">
            Administra pagos y estados de suscripción de usuarios
          </p>
        </div>
        
        <Button 
          onClick={handleUpdateAllStates}
          disabled={updating}
          variant="outline"
        >
          {updating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar Estados
            </>
          )}
        </Button>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuarios y Estados
            </CardTitle>
            <CardDescription>
              Busca y selecciona un usuario para gestionar su suscripción
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por email, empresa o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse p-3 bg-gray-100 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No se encontraron usuarios
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedUserId === user.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.estado_suscripcion)}
                          <span className="font-medium text-sm">#{user.id}</span>
                          <Badge className={getStatusColor(user.estado_suscripcion)}>
                            {user.estado_suscripcion}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.company_name || 'Sin empresa'}
                        </p>
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground">
                        {user.fecha_proximo_vencimiento && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.fecha_proximo_vencimiento)}
                          </div>
                        )}
                        {user.dias_gracia_restantes > 0 && (
                          <div className="text-orange-600 font-medium mt-1">
                            {user.dias_gracia_restantes}d restantes
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detalles del usuario seleccionado */}
        <div className="space-y-4">
          {selectedUserId ? (
            <>
              <SubscriptionStatusComponent userId={selectedUserId} />
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecciona un usuario para ver sus detalles</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Registro de pagos */}
      <PaymentRegistrationComponent onPaymentRegistered={handlePaymentRegistered} />
    </div>
  )
}
