"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditStoreModal } from "@/components/edit-store-modal"
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
  Settings,
  Eye,
  Edit3,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
  MessageSquare
} from "lucide-react"

interface StoreType {
  id: number
  name: string
  description: string
  address: string
  whatsapp_number?: string
  created_at: string
  updated_at?: string
  last_product_update?: string
  street_name?: string
  street_number?: string
  city?: string
  state_province?: string
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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

  const handleStoreUpdated = (updatedStore: any) => {
    setStore(updatedStore)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFullAddress = () => {
    if (!store) return "Sin dirección"
    
    const parts = []
    if (store.street_name && store.street_number) {
      parts.push(`${store.street_name} ${store.street_number}`)
    }
    if (store.city) parts.push(store.city)
    if (store.state_province) parts.push(store.state_province)
    if (store.country) parts.push(store.country)
    if (store.postal_code) parts.push(`(${store.postal_code})`)
    
    return parts.length > 0 ? parts.join(", ") : "Sin dirección"
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
            <Link href="/user-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Gestión de Tienda</h1>
              <p className="text-sm text-muted-foreground">{store.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Store Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Información de la Tienda
                </CardTitle>
                <div className="flex gap-2">
                  <Link href={`/store/${store.id}`} target="_blank">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Tienda Pública
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información Básica */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{store.name}</h3>
                    <p className="text-muted-foreground">
                      {store.description || "Sin descripción"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="secondary" className="mb-2">
                      Tienda
                    </Badge>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Creada el {formatDate(store.created_at)}
                      </span>
                    </div>
                    
                    {store.updated_at && store.updated_at !== store.created_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Actualizada el {formatDate(store.updated_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de Contacto y Ubicación */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Contacto</h4>
                    {store.whatsapp_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span>WhatsApp: {store.whatsapp_number}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Ubicación</h4>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{getFullAddress()}</p>
                        {store.country && store.city && (
                          <p className="text-muted-foreground mt-1">
                            {store.city}, {store.state_province || ''} {store.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <p className="text-2xl font-bold">Activa</p>
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

          {/* Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <Tags className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No hay categorías</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea tu primera categoría para organizar tus productos
                  </p>
                  <Link href={`/user-dashboard/add-category?storeId=${storeId}`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primera Categoría
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Link 
                      key={category.id} 
                      href={`/user-dashboard/products/${category.id}?storeId=${storeId}`}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div>
                                <h4 className="font-semibold">{category.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {category.productCount || 0} productos
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Store Modal */}
      {store && (
        <EditStoreModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          store={store}
          onStoreUpdated={handleStoreUpdated}
        />
      )}
    </div>
  )
}
