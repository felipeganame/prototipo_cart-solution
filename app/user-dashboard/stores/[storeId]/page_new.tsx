"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  ArrowRight,
  LogOut, 
  Store, 
  MapPin, 
  Phone, 
  Calendar,
  Plus,
  Package,
  Tags,
  BarChart3,
  Edit3,
  Eye,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
  MessageSquare,
  Save
} from "lucide-react"

interface StoreType {
  id: number
  name: string
  description: string
  address: string
  phone: string
  whatsapp?: string
  business_type: string
  created_at: string
  updated_at?: string
  last_product_update?: string
  street?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

interface CategoryType {
  id: number
  name: string
  productCount?: number
}

interface StoreStats {
  totalVisits: number
  completedOrders: number
  abandonedCarts: number
  topProducts: Array<{
    name: string
    orders: number
  }>
  recentActivity: Array<{
    action: string
    timestamp: string
  }>
}

export default function StoreManagementPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.storeId as string
  
  const [user, setUser] = useState<any>(null)
  const [store, setStore] = useState<StoreType | null>(null)
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [stats, setStats] = useState<StoreStats>({
    totalVisits: 0,
    completedOrders: 0,
    abandonedCarts: 0,
    topProducts: [],
    recentActivity: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStoreData()
  }, [storeId])

  const fetchStoreData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user data
      const userResponse = await fetch("/api/user/profile")
      if (!userResponse.ok) {
        router.push("/login")
        return
      }
      const userData = await userResponse.json()
      setUser(userData.user)

      // Find the specific store
      const targetStore = userData.stores.find((s: StoreType) => s.id === parseInt(storeId))
      if (!targetStore) {
        setError("Tienda no encontrada")
        return
      }
      setStore(targetStore)
      setEditForm(targetStore)

      // Fetch categories for this store
      const categoriesResponse = await fetch(`/api/categories?storeId=${storeId}`)
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        
        // For each category, fetch product count
        const categoriesWithCount = await Promise.all(
          categoriesData.categories.map(async (category: CategoryType) => {
            try {
              const productsResponse = await fetch(`/api/products?categoryId=${category.id}&storeId=${storeId}`)
              if (productsResponse.ok) {
                const productsData = await productsResponse.json()
                return { ...category, productCount: productsData.products.length }
              }
              return { ...category, productCount: 0 }
            } catch {
              return { ...category, productCount: 0 }
            }
          })
        )
        
        setCategories(categoriesWithCount)
      }

      // Mock stats data - in real implementation, fetch from analytics API
      setStats({
        totalVisits: Math.floor(Math.random() * 1000),
        completedOrders: Math.floor(Math.random() * 50),
        abandonedCarts: Math.floor(Math.random() * 20),
        topProducts: [
          { name: "Producto Estrella 1", orders: 25 },
          { name: "Producto Estrella 2", orders: 18 },
          { name: "Producto Estrella 3", orders: 12 }
        ],
        recentActivity: [
          { action: "Nuevo producto agregado", timestamp: "2024-01-15T10:30:00Z" },
          { action: "Categoría actualizada", timestamp: "2024-01-14T16:45:00Z" }
        ]
      })

    } catch (error) {
      console.error("Error fetching store data:", error)
      setError("Error al cargar los datos de la tienda")
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

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        setStore(editForm)
        setIsEditing(false)
        // Refresh data
        fetchStoreData()
      } else {
        setError("Error al actualizar la tienda")
      }
    } catch (error) {
      console.error("Error updating store:", error)
      setError("Error al actualizar la tienda")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalProducts = () => {
    return categories.reduce((total, category) => total + (category.productCount || 0), 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando tienda...</p>
        </div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Tienda no encontrada</h3>
          <p className="text-muted-foreground mb-6">{error || "No se pudo cargar la información de la tienda"}</p>
          <Link href="/user-dashboard">
            <Button>Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/user-dashboard/stores">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Gestión de Tienda</h1>
              <p className="text-sm text-muted-foreground">{store.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancelar' : 'Editar Tienda'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Store Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Información de la Tienda
                {isEditing && (
                  <Button size="sm" onClick={handleSaveChanges} className="ml-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre de la Tienda</Label>
                      <Input
                        id="name"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={editForm.whatsapp || ''}
                        onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})}
                        placeholder="Número de WhatsApp"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="street">Calle y Número</Label>
                      <Input
                        id="street"
                        value={editForm.street || ''}
                        onChange={(e) => setEditForm({...editForm, street: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={editForm.city || ''}
                        onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado/Provincia</Label>
                      <Input
                        id="state"
                        value={editForm.state || ''}
                        onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Código Postal</Label>
                      <Input
                        id="postal_code"
                        value={editForm.postal_code || ''}
                        onChange={(e) => setEditForm({...editForm, postal_code: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{store.name}</h3>
                      <p className="text-muted-foreground">{store.description}</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="mb-2">
                        {store.business_type === 'restaurant' ? 'Restaurante' : 'Licorería'}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {store.phone}
                      </div>
                      {store.whatsapp && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          WhatsApp: {store.whatsapp}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Dirección Completa</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {store.street || store.address}
                        </div>
                        {store.city && <div>Ciudad: {store.city}</div>}
                        {store.state && <div>Estado: {store.state}</div>}
                        {store.postal_code && <div>CP: {store.postal_code}</div>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Creada: {formatDate(store.created_at)}
                      </div>
                      {store.updated_at && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Última actualización: {formatDate(store.updated_at)}
                        </div>
                      )}
                      {store.last_product_update && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="w-4 h-4" />
                          Últimos productos: {formatDate(store.last_product_update)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                    <Tags className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Categorías</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Productos</p>
                    <p className="text-2xl font-bold">{getTotalProducts()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Visitas Totales</p>
                    <p className="text-2xl font-bold">{stats.totalVisits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pedidos Finalizados</p>
                    <p className="text-2xl font-bold">{stats.completedOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href={`/user-dashboard/categories?storeId=${storeId}`}>
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Tags className="w-6 h-6" />
                    Ver Categorías
                  </Button>
                </Link>

                <Link href={`/user-dashboard/add-category?storeId=${storeId}`}>
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Plus className="w-6 h-6" />
                    Agregar Categoría
                  </Button>
                </Link>

                <Link href={`/user-dashboard/add-product?storeId=${storeId}`}>
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Package className="w-6 h-6" />
                    Agregar Producto
                  </Button>
                </Link>

                <Link href={`/store/${storeId}`}>
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Eye className="w-6 h-6" />
                    Ver Tienda Pública
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Analytics and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Popular Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Productos Más Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">Rank #{index + 1}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{product.orders}</div>
                          <div className="text-xs text-muted-foreground">pedidos</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No hay datos de productos aún</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversion Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estadísticas de Conversión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-green-800">Pedidos Completados</h4>
                      <p className="text-sm text-green-600">Clientes que finalizaron</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-800">{stats.completedOrders}</div>
                      <div className="text-xs text-green-600">
                        {stats.totalVisits > 0 ? ((stats.completedOrders / stats.totalVisits) * 100).toFixed(1) : 0}% tasa
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-orange-800">Carritos Abandonados</h4>
                      <p className="text-sm text-orange-600">Clientes que no finalizaron</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-orange-800">{stats.abandonedCarts}</div>
                      <div className="text-xs text-orange-600">
                        {stats.totalVisits > 0 ? ((stats.abandonedCarts / stats.totalVisits) * 100).toFixed(1) : 0}% tasa
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-blue-800">Solo Navegaron</h4>
                      <p className="text-sm text-blue-600">Visitantes sin interacción</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-blue-800">
                        {stats.totalVisits - stats.completedOrders - stats.abandonedCarts}
                      </div>
                      <div className="text-xs text-blue-600">visitantes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
