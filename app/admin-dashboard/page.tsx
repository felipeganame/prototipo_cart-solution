"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3, Package, LogOut, Store, DollarSign, AlertTriangle, TrendingUp, Calendar } from "lucide-react"

interface AdminStats {
  users: {
    total_users: number
    active_users: number
    debt_users: number
    inactive_users: number
    up_to_date_users: number
    new_users_month: number
  }
  stores: {
    total_stores: number
    active_stores: number
  }
  products: {
    total_products: number
  }
  revenue: {
    total_revenue: number
    monthly_revenue: number
    weekly_revenue: number
    total_payments: number
  }
  projected: {
    projected_monthly_revenue: number
    average_monthly_payment: number
  }
  topUsers: Array<{
    name: string
    company_name: string
    monthly_payment: number
    max_stores: number
    payment_status: string
  }>
  recentPayments: Array<{
    amount: number
    payment_date: string
    payment_method: string
    user_name: string
    company_name: string
  }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== "admin") {
          router.push("/login")
          return
        }
        setUser(data.user)
        fetchStats()
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      router.push("/login")
    }
  }

  const fetchStats = async () => {
    try {
      console.log("Fetching admin stats...")
      const response = await fetch("/api/admin/stats")
      console.log("Stats response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Stats data received:", data)
        setStats(data)
      } else {
        const errorData = await response.text()
        console.error("Stats API error:", response.status, errorData)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log("Logging out admin user")
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login?logout=1"
    } catch (error) {
      console.error("Logout error:", error)
      window.location.href = "/login?logout=1"
    }
  }

  const formatCurrency = (amount: number | null | undefined | string) => {
    if (amount === null || amount === undefined) {
      return "$0.00"
    }
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    
    if (isNaN(numAmount)) {
      return "$0.00"
    }
    
    return `$${numAmount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Cargando dashboard...</h2>
            <p className="text-muted-foreground">Obteniendo estadísticas del sistema</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido, {user.first_name}. Aquí tienes el resumen de tu plataforma.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      {stats ? (
        <div className="space-y-8">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.revenue.total_revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.revenue.total_payments} pagos registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Este Mes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.revenue.monthly_revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Semana actual: {formatCurrency(stats.revenue.weekly_revenue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyección Mensual</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.projected.projected_monthly_revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Promedio: {formatCurrency(stats.projected.average_monthly_payment)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Al Día</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.users.up_to_date_users}
                </div>
                <p className="text-xs text-muted-foreground">
                  De {stats.users.total_users} usuarios totales
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios en Deuda</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.users.debt_users}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requieren seguimiento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cuentas Inactivas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.users.inactive_users}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cuentas desactivadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuevos Este Mes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.users.new_users_month}
                </div>
                <p className="text-xs text-muted-foreground">
                  Usuarios registrados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiendas Activas</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.stores.active_stores}</div>
                <p className="text-xs text-muted-foreground">
                  De {stats.stores.total_stores} tiendas totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products.total_products}</div>
                <p className="text-xs text-muted-foreground">
                  En todas las tiendas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Users and Recent Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mejores Clientes</CardTitle>
                <CardDescription>Usuarios con mayor pago mensual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.company_name || 'Sin empresa'} • {user.max_stores} tiendas
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(user.monthly_payment)}</div>
                        <div className={`text-xs ${
                          user.payment_status === 'al_dia' ? 'text-green-600' :
                          user.payment_status === 'en_deuda' ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {user.payment_status === 'al_dia' ? 'Al día' :
                           user.payment_status === 'en_deuda' ? 'En deuda' : 'Estado desconocido'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pagos Recientes</CardTitle>
                <CardDescription>Últimas transacciones registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentPayments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{payment.user_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.company_name || 'Sin empresa'} • {payment.payment_method}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(payment.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(payment.payment_date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Herramientas de administración</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin-dashboard/users">
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Gestionar Usuarios
                  </Button>
                </Link>
                <Link href="/admin-dashboard/reports">
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Reportes
                  </Button>
                </Link>
                <Link href="/admin-dashboard/settings">
                  <Button className="w-full" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Configuración
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error al cargar estadísticas</h3>
              <p className="text-muted-foreground mb-4">
                No se pudieron obtener las estadísticas del sistema
              </p>
              <Button onClick={fetchStats}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
