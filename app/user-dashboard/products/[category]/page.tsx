"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { OptimizedImage } from "@/components/optimized-image"

interface ProductType {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
}

export default function ProductsPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const categoryId = params.category as string
  const storeId = searchParams.get("storeId")

  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<ProductType[]>([])
  const [categoryName, setCategoryName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          fetchProducts()
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/login")
      }
    }

    if (categoryId && storeId) {
      checkAuth()
    } else {
      router.push("/user-dashboard/categories")
    }
  }, [categoryId, storeId, router])

  const fetchProducts = async () => {
    if (!categoryId || !storeId) return

    try {
      const response = await fetch(`/api/products?categoryId=${categoryId}&storeId=${storeId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)

        // Obtener nombre de categoría (podrías hacer una API call separada si necesitas más info)
        setCategoryName(`CATEGORÍA ${categoryId}`)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProducts(products.filter((product) => product.id !== productId))
      } else {
        const data = await response.json()
        alert(data.error || "Error al eliminar producto")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error de conexión al eliminar producto")
    }
  }

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "price-asc") return a.price - b.price
      if (sortBy === "price-desc") return b.price - a.price
      return 0
    })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando productos...</p>
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/user-dashboard/categories">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="font-bold text-xl">{categoryName}</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("name")}
              className="rounded-full"
            >
              Ordenar A-Z
            </Button>
            <Button
              variant={sortBy === "price-asc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("price-asc")}
              className="rounded-full"
            >
              Precio: Menor a Mayor
            </Button>
          </div>
        </div>
      </header>

      {/* Products List */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-4 max-w-md mx-auto">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <p className="text-red-600 font-bold text-xl mb-4">{formatPrice(product.price)}</p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full rounded-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar Producto
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente el producto "{product.name}" de tu catálogo. Esta
                            acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteProduct(product.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    {product.image_url ? (
                      <OptimizedImage
                        imageId={product.image_url.split("/").pop()?.split(".")[0]}
                        alt={product.name}
                        variant="thumbnail"
                        className="w-full h-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Sin imagen</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {searchTerm ? "No se encontraron productos" : "No hay productos en esta categoría"}
              </p>
              <Link href={`/user-dashboard/add-product?categoryId=${categoryId}&storeId=${storeId}`}>
                <Button>Agregar Primer Producto</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
