"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3, Package, LogOut, Store, DollarSign, AlertTriangle } from "lucide-react"

interface AdminStats {
  users: {
    total_users: number
    active_users: number
    overdue_users: number
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
    monthly_revenue: number
    paying_users: number
  }
  planBreakdown: Array<{
    plan_name: string
    user_count: number
    plan_revenue: number
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
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || !stats) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">P</span>
            </div>
            <div>
              <h1 className="font-bold text-xl">Pedi Solutions</h1>
              <p className="text-sm text-muted-foreground">Panel de Administrador</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Bienvenido, {user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard de Administrador</h2>
          <p className="text-muted-foreground">Gestiona todos los aspectos de Pedi Solutions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.active_users}</div>
              <p className="text-xs text-muted-foreground">{stats.users.new_users_month} nuevos este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiendas Activas</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stores.active_stores}</div>
              <p className="text-xs text-muted-foreground">de {stats.stores.total_stores} registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.monthly_revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.revenue.paying_users} usuarios pagando</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios en Deuda</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.users.overdue_users}</div>
              <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Planes</CardTitle>
              <CardDescription>Usuarios activos por tipo de plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.planBreakdown.map((plan) => (
                  <div key={plan.plan_name} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{plan.plan_name}</div>
                      <div className="text-sm text-muted-foreground">{plan.user_count} usuarios</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${plan.plan_revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">ingresos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen General</CardTitle>
              <CardDescription>Métricas clave de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total de Usuarios</span>
                  <span className="font-medium">{stats.users.total_users}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total de Productos</span>
                  <span className="font-medium">{stats.products.total_products}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tasa de Actividad</span>
                  <span className="font-medium">
                    {Math.round((stats.users.active_users / stats.users.total_users) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin-dashboard/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="w-5 h-5" />
                  Gestionar Usuarios
                </CardTitle>
                <CardDescription>Administra cuentas de usuarios y permisos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Acceder</Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Monitorear Pedidos
              </CardTitle>
              <CardDescription>Supervisa todos los pedidos en tiempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Reportes y Analytics
              </CardTitle>
              <CardDescription>Visualiza métricas y genera reportes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Back to Landing */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-primary hover:underline">
            ← Volver a la página principal
          </Link>
        </div>
      </main>
    </div>
  )
}
