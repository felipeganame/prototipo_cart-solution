"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, Package, BarChart3, Settings, LogOut, Plus, Store } from "lucide-react"

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

        {stores.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Mis Tiendas</h3>
              <Link href="/user-dashboard/stores">
                <Button variant="outline" size="sm">
                  Ver Todas
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.slice(0, 3).map((store) => (
                <Card key={store.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="w-4 h-4 text-primary" />
                      <h4 className="font-medium">{store.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{store.qr_code}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiendas Activas</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stores.length}</div>
              <p className="text-xs text-muted-foreground">de {user.plan.max_stores} permitidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Próximamente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">En todas las tiendas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Actual</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.plan.name}</div>
              <p className="text-xs text-muted-foreground">Activo</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
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
                <Button className="w-full">{stores.length === 0 ? "Crear Primera Tienda" : "Ver Tiendas"}</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/user-dashboard/categories">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Package className="w-5 h-5" />
                  Ver Mi Tienda
                </CardTitle>
                <CardDescription>Explora tus productos por categorías</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver Productos</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/user-dashboard/add-product">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Plus className="w-5 h-5" />
                  Agregar Productos
                </CardTitle>
                <CardDescription>Añade nuevos productos a tu catálogo</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Agregar Producto</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/user-dashboard/qr-code">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Mi Código QR
                </CardTitle>
                <CardDescription>Genera enlace para tus clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  Ver QR
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/user-dashboard/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Mis Estadísticas
                </CardTitle>
                <CardDescription>Analiza el rendimiento de tu negocio</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  Ver Reportes
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración
              </CardTitle>
              <CardDescription>Personaliza tu tienda y preferencias</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                Configurar
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
