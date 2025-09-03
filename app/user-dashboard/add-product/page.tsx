"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, LogOut, Save } from "lucide-react"
import { validateForm } from "@/components/form-validation"
import { ImageUpload } from "@/components/image-upload"

const categories = [
  { id: "vodka", name: "VODKA" },
  { id: "ron", name: "RON" },
  { id: "cervezas", name: "CERVEZAS" },
  { id: "whisky", name: "WHISKY" },
  { id: "vinos", name: "VINOS" },
  { id: "licores", name: "LICORES" },
]

export default function AddProductPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    imageId: "",
  })

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(currentUser)
    if (userData.role !== "user") {
      router.push("/login")
      return
    }

    setUser(userData)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }))
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
    setIsLoading(true)

    // Validate form
    const validationErrors: any = {}

    if (!validateForm.productName(formData.name)) {
      validationErrors.name = "El nombre del producto es requerido (mínimo 2 caracteres)"
    }

    if (!formData.description.trim()) {
      validationErrors.description = "La descripción es requerida"
    }

    if (!validateForm.price(formData.price)) {
      validationErrors.price = "Ingresa un precio válido (solo números y punto decimal)"
    }

    if (!formData.category) {
      validationErrors.category = "Selecciona una categoría"
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Save product to localStorage (simulate database)
      const existingProducts = JSON.parse(localStorage.getItem("userProducts") || "[]")
      const newProduct = {
        id: Date.now().toString(),
        ...formData,
        price: Number.parseFloat(formData.price),
        createdAt: new Date().toISOString(),
        userId: user.email,
      }

      existingProducts.push(newProduct)
      localStorage.setItem("userProducts", JSON.stringify(existingProducts))

      // Redirect to categories
      router.push("/user-dashboard/categories")
    } catch (error) {
      console.error("Error adding product:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
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
              <h1 className="font-bold text-xl">Agregar Producto</h1>
              <p className="text-sm text-muted-foreground">Añade un nuevo producto a tu catálogo</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ej: Grey Goose Vodka Premium"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe las características del producto..."
                    rows={3}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="text"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0.00"
                      className={`pl-8 ${errors.price ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Imagen del Producto</Label>
                  <ImageUpload
                    onImageUploaded={handleImageUploaded}
                    onImageRemoved={handleImageRemoved}
                    currentImageUrl={formData.imageUrl}
                    imageType="product"
                    entityId={formData.name}
                    maxSizeMB={5}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>Guardando...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Producto
                      </>
                    )}
                  </Button>
                  <Link href="/user-dashboard">
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
