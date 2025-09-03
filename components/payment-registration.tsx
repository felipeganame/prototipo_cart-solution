"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle, AlertCircle, DollarSign, Calendar } from "lucide-react"
import { useFormValidation } from "@/components/form-validation"

interface PaymentRegistrationProps {
  onPaymentRegistered?: () => void
}

export function PaymentRegistrationComponent({ onPaymentRegistered }: PaymentRegistrationProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { values, errors, touched, setValue, setFieldTouched, validateForm, validateSingleField, resetForm } = useFormValidation({
    userId: '',
    fechaPago: '',
    monto: ''
  })

  const validationRules = {
    userId: {
      required: true,
      custom: (value: string) => {
        if (!/^\d+$/.test(value)) return "Debe ser un número válido"
        return null
      }
    },
    fechaPago: {
      required: true,
      custom: (value: string) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Formato de fecha inválido (YYYY-MM-DD)"
        const fecha = new Date(value)
        if (isNaN(fecha.getTime())) return "Fecha inválida"
        if (fecha > new Date()) return "La fecha no puede ser futura"
        return null
      }
    },
    monto: {
      required: true,
      custom: (value: string) => {
        const num = parseFloat(value)
        if (isNaN(num) || num <= 0) return "Debe ser un monto válido mayor a 0"
        return null
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm(validationRules)) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(values.userId),
          fechaPago: values.fechaPago,
          monto: parseFloat(values.monto)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Pago registrado exitosamente para usuario ${values.userId}`)
        resetForm()
        onPaymentRegistered?.()
      } else {
        setError(data.error || 'Error registrando el pago')
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.')
      console.error('Error registering payment:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: string) => {
    if (!amount) return ''
    const num = parseFloat(amount)
    if (isNaN(num)) return amount
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(num)
  }

  const getToday = () => {
    return new Date().toISOString().split('T')[0]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Registrar Pago Manual
        </CardTitle>
        <CardDescription>
          Registra un pago realizado por un usuario para actualizar su estado de suscripción
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
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
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userId">ID de Usuario</Label>
              <Input
                id="userId"
                type="text"
                placeholder="123"
                value={values.userId}
                onChange={(e) => setValue("userId", e.target.value)}
                onBlur={() => {
                  setFieldTouched("userId")
                  validateSingleField("userId", validationRules.userId)
                }}
                className={errors.userId && touched.userId ? "border-destructive" : ""}
              />
              {errors.userId && touched.userId && (
                <p className="text-sm text-destructive">{errors.userId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaPago">Fecha de Pago</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="fechaPago"
                  type="date"
                  max={getToday()}
                  value={values.fechaPago}
                  onChange={(e) => setValue("fechaPago", e.target.value)}
                  onBlur={() => {
                    setFieldTouched("fechaPago")
                    validateSingleField("fechaPago", validationRules.fechaPago)
                  }}
                  className={`pl-10 ${errors.fechaPago && touched.fechaPago ? "border-destructive" : ""}`}
                />
              </div>
              {errors.fechaPago && touched.fechaPago && (
                <p className="text-sm text-destructive">{errors.fechaPago}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monto">Monto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="20000.00"
                  value={values.monto}
                  onChange={(e) => setValue("monto", e.target.value)}
                  onBlur={() => {
                    setFieldTouched("monto")
                    validateSingleField("monto", validationRules.monto)
                  }}
                  className={`pl-10 ${errors.monto && touched.monto ? "border-destructive" : ""}`}
                />
              </div>
              {errors.monto && touched.monto && (
                <p className="text-sm text-destructive">{errors.monto}</p>
              )}
              {values.monto && !errors.monto && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">
                    {formatCurrency(values.monto)}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={loading}
            >
              Limpiar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Registrar Pago
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">💡 Información importante:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• El estado del usuario se actualizará automáticamente a "Activo"</li>
            <li>• El próximo vencimiento se calculará desde el día fijo de vencimiento</li>
            <li>• Si es el primer pago, se establecerá el día de vencimiento mensual</li>
            <li>• El historial de pagos quedará registrado para auditoría</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
