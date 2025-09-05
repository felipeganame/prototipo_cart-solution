"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, LogOut, Save } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

export default function AddCategoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeId = searchParams.get("storeId")
  
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    imageId: "",
  })

  useEffect(() => {
    fetchUserData()
  }, [])

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
    setSubmitError("") // Clear error when user starts typing
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
      setSubmitError("El nombre de la categoría es requerido")
      return
    }

    setIsLoading(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: parseInt(storeId),
          name: formData.name,
          description: formData.description,
          backgroundImageUrl: formData.imageUrl || null,
          backgroundImageId: formData.imageId || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Category created successfully:", data)
        router.push(`/user-dashboard/categories?storeId=${storeId}`)
      } else {
        setSubmitError(data.error || "Error al crear la categoría")
      }
    } catch (error) {
      console.error("Error creating category:", error)
      setSubmitError("Error de conexión. Intenta nuevamente.")
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
              {/* Error Message */}
              {submitError && (
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{submitError}</p>
                </div>
              )}

              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Categoría *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ej: Cocteles, Aperitivos, Hamburguesas, etc."
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe brevemente esta categoría..."
                  rows={3}
                />
              </div>

              {/* Image Upload */}
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
