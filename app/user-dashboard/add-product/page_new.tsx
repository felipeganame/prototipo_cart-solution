"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, LogOut, Save } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

interface CategoryType {
  id: number
  name: string
  icon: string
}

export default function AddProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeId = searchParams.get("storeId")
  const categoryId = searchParams.get("categoryId")
  
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: categoryId || "",
    imageUrl: "",
    imageId: "",
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (storeId) {
      fetchCategories()
    }
  }, [storeId])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      router.push("/login")
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?storeId=${storeId}`)
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (submitError) {
      setSubmitError("")
    }
  }

  const handleImageUploaded = (imageUrl: string, imageId: string) => {
    setFormData((prev) => ({ ...prev, imageUrl, imageId }))
  }

  const handleImageRemoved = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "", imageId: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!storeId) {
      setSubmitError("ID de tienda no válido")
      return
    }

    if (!formData.name.trim()) {
      setSubmitError("El nombre del producto es requerido")
      return
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setSubmitError("El precio debe ser un número válido mayor a 0")
      return
    }

    if (!formData.categoryId) {
      setSubmitError("Selecciona una categoría")
      return
    }

    setIsLoading(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: parseInt(storeId),
          categoryId: parseInt(formData.categoryId),
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          imageUrl: formData.imageUrl || null,
          imageId: formData.imageId || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Product created successfully:", data)
        router.push(`/user-dashboard/products/${formData.categoryId}?storeId=${storeId}`)
      } else {
        setSubmitError(data.error || "Error al crear el producto")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      setSubmitError("Error al crear el producto")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
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
            <Link href={`/user-dashboard/categories?storeId=${storeId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Agregar Producto</h1>
              <p className="text-sm text-muted-foreground">Nuevo producto para tu tienda</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{submitError}</p>
                  </div>
                )}

                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ej: Hamburguesa Clásica, Vodka Premium, etc."
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe tu producto..."
                    rows={3}
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categories.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No hay categorías disponibles. <Link href={`/user-dashboard/add-category?storeId=${storeId}`} className="text-primary hover:underline">Crear una categoría</Link>
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Imagen del Producto (Opcional)</Label>
                  <ImageUpload
                    currentImageUrl={formData.imageUrl}
                    onImageUploaded={handleImageUploaded}
                    onImageRemoved={handleImageRemoved}
                    className="aspect-square max-w-xs"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading || categories.length === 0}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Guardar Producto
                      </div>
                    )}
                  </Button>
                  <Link href={`/user-dashboard/categories?storeId=${storeId}`}>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
