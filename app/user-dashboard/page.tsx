"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SubscriptionStatusComponent } from "@/components/subscription-status"
import { QrCode, Package, BarChart3, Settings, LogOut, Plus, Store, Users, Activity } from "lucide-react"

interface UserData {
  id: number
  email: string
  role: string
  company_name: string
  first_name: string
  last_name: string
  plan: {
    name: string
    max_stores: number
  }
}

interface StoreData {
  id: number
  name: string
  qr_code: string
}

export default function UserDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [stores, setStores] = useState<StoreData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      console.log("Fetching user data...")
      const response = await fetch("/api/user/profile")
      console.log("Profile response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Profile data received:", data)
        setUser(data.user)
        setStores(data.stores)
      } else {
        const errorData = await response.json()
        console.error("Profile fetch error:", errorData)
        router.push("/login")
      }
    } catch (error) {
      console.error("Network error:", error)
      setIsLoading(false)
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

  if (!user) {
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
              <p className="text-sm text-muted-foreground">{user.company_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {user.first_name} {user.last_name}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {user.plan.name}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {stores.length}/{user.plan.max_stores} tiendas
                </span>
              </div>
            </div>
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
          <h2 className="text-3xl font-bold mb-2">Mi Dashboard</h2>
          <p className="text-muted-foreground">Gestiona tu negocio y pedidos desde aquí</p>
        </div>

        {/* Estado de Suscripción */}
        <div className="mb-8">
          <SubscriptionStatusComponent />
        </div>

        {/* Dashboard Mosaicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/user-dashboard/stores">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Store className="w-5 h-5" />
                  Mis Tiendas
                </CardTitle>
                <CardDescription>Gestiona todas tus sucursales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{stores.length}</div>
                <p className="text-sm text-muted-foreground">de {user.plan.max_stores} permitidas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/user-dashboard/qr-code">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <QrCode className="w-5 h-5" />
                  Enlace/QR para Clientes
                </CardTitle>
                <CardDescription>Genera y comparte tu enlace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">Activo</div>
                <p className="text-sm text-muted-foreground">Para clientes</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/user-dashboard/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <BarChart3 className="w-5 h-5" />
                  Mis Estadísticas
                </CardTitle>
                <CardDescription>Analiza el rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">0</div>
                <p className="text-sm text-muted-foreground">Visitas hoy</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Settings className="w-5 h-5" />
                Configuración
              </CardTitle>
              <CardDescription>Personaliza tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">Activo</div>
              <p className="text-sm text-muted-foreground">Plan {user.plan.name}</p>
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
