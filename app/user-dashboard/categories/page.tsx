"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, LogOut, Plus, Store } from "lucide-react"
import { OptimizedImage } from "@/components/optimized-image"

interface StoreType {
  id: number
  name: string
}

interface CategoryType {
  id: number
  name: string
  icon: string
  background_image_url?: string
  description?: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stores, setStores] = useState<StoreType[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string>("")
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (selectedStoreId) {
      fetchCategories()
    }
  }, [selectedStoreId])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setStores(data.stores)

        // Seleccionar la primera tienda por defecto
        if (data.stores.length > 0) {
          setSelectedStoreId(data.stores[0].id.toString())
        }
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!selectedStoreId) return

    try {
      const response = await fetch(`/api/categories?storeId=${selectedStoreId}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
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
              <h1 className="font-bold text-xl">Mi Tienda</h1>
              <p className="text-sm text-muted-foreground">Categorías de Productos</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Store Selector */}
      {stores.length > 1 && (
        <div className="bg-white border-b px-4 py-3">
          <div className="container mx-auto max-w-md">
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecciona una tienda" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <main className="container mx-auto px-4 py-6">
        {!selectedStoreId ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No tienes tiendas</h3>
            <p className="text-muted-foreground mb-6">Crea tu primera tienda para comenzar a agregar productos</p>
            <Link href="/user-dashboard/stores/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear Mi Primera Tienda
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
            <Link href={`/user-dashboard/add-category?storeId=${selectedStoreId}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-medium text-primary">Agregar Nueva Categoría</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {categories.map((category) => (
              <Link key={category.id} href={`/user-dashboard/products/${category.id}?storeId=${selectedStoreId}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-48 bg-black flex items-center justify-center">
                    {category.background_image_url ? (
                      <OptimizedImage
                        imageId={category.background_image_url.split("/").pop()?.split(".")[0]}
                        alt={`Imagen de ${category.name}`}
                        variant="large"
                        className="w-full h-full opacity-50"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                        <span className="text-white text-lg font-medium">Imagen de {category.name}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-bold text-lg">{category.name}</span>
                      </div>
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No hay categorías en esta tienda</p>
                <Link href={`/user-dashboard/add-category?storeId=${selectedStoreId}`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Categoría
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
