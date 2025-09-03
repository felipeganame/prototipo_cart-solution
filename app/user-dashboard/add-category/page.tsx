"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, LogOut, Save } from "lucide-react"
import { validateForm } from "@/components/form-validation"
import { ImageUpload } from "@/components/image-upload"

const availableIcons = ["🥃", "🍺", "🍷", "🍸", "🥂", "🍻", "🧊", "🍾", "🥤", "☕"]

export default function AddCategoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
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

    if (!validateForm.categoryName(formData.name)) {
      validationErrors.name = "El nombre de la categoría es requerido (mínimo 2 caracteres)"
    }

    if (!formData.icon) {
      validationErrors.icon = "Selecciona un icono para la categoría"
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Save category to localStorage (simulate database)
      const existingCategories = JSON.parse(localStorage.getItem("userCategories") || "[]")
      const newCategory = {
        id: formData.name.toLowerCase().replace(/\s+/g, "-"),
        name: formData.name.toUpperCase(),
        icon: formData.icon,
        image: formData.imageUrl || "/abstract-categories.png",
        imageId: formData.imageId,
        createdAt: new Date().toISOString(),
        userId: user.email,
      }

      existingCategories.push(newCategory)
      localStorage.setItem("userCategories", JSON.stringify(existingCategories))

      // Redirect to categories
      router.push("/user-dashboard/categories")
    } catch (error) {
      console.error("Error adding category:", error)
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
            <Link href="/user-dashboard/categories">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Nueva Categoría</h1>
              <p className="text-sm text-muted-foreground">Crea una nueva categoría de productos</p>
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
              <CardTitle>Información de la Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Categoría *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ej: Cocteles, Aperitivos, etc."
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Icon Selection */}
                <div className="space-y-2">
                  <Label>Icono de la Categoría *</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {availableIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleInputChange("icon", icon)}
                        className={`p-3 text-2xl border-2 rounded-lg hover:bg-gray-50 transition-colors ${
                          formData.icon === icon ? "border-primary bg-primary/10" : "border-gray-200"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Imagen de Fondo (Opcional)</Label>
                  <ImageUpload
                    onImageUploaded={handleImageUploaded}
                    onImageRemoved={handleImageRemoved}
                    currentImageUrl={formData.imageUrl}
                    imageType="category"
                    entityId={formData.name}
                    maxSizeMB={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta imagen se mostrará como fondo de la categoría. Recomendamos imágenes de alta calidad.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>Creando...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Crear Categoría
                      </>
                    )}
                  </Button>
                  <Link href="/user-dashboard/categories">
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
