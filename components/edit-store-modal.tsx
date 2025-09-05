"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface StoreType {
  id: number
  name: string
  description: string
  address?: string
  whatsapp_number?: string
  created_at?: string
  updated_at?: string
  country?: string
  state_province?: string
  city?: string
  postal_code?: string
  street_name?: string
  street_number?: string
}

interface EditStoreModalProps {
  isOpen: boolean
  onClose: () => void
  store: StoreType
  onStoreUpdated: (updatedStore: StoreType) => void
}

export function EditStoreModal({ isOpen, onClose, store, onStoreUpdated }: EditStoreModalProps) {
  const [formData, setFormData] = useState({
    name: store.name || "",
    description: store.description || "",
    whatsapp_number: store.whatsapp_number || "",
    country: store.country || "",
    state_province: store.state_province || "",
    city: store.city || "",
    postal_code: store.postal_code || "",
    street_name: store.street_name || "",
    street_number: store.street_number || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar la tienda")
      }

      const data = await response.json()
      onStoreUpdated(data.store)
      onClose()
    } catch (error) {
      console.error("Error updating store:", error)
      setError(error instanceof Error ? error.message : "Error al actualizar la tienda")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Editar Información de la Tienda</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Actualiza la información de tu tienda. Todos los campos son opcionales.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Básica</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Tienda *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nombre de la tienda"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="whatsapp_number">WhatsApp</Label>
                  <Input
                    id="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                    placeholder="+54 9 3513 363008"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe tu tienda..."
                  rows={3}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ubicación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Argentina"
                  />
                </div>
                
                <div>
                  <Label htmlFor="state_province">Estado/Provincia</Label>
                  <Input
                    id="state_province"
                    value={formData.state_province}
                    onChange={(e) => handleInputChange("state_province", e.target.value)}
                    placeholder="Córdoba"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Córdoba"
                  />
                </div>
                
                <div>
                  <Label htmlFor="postal_code">Código Postal</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange("postal_code", e.target.value)}
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street_name">Nombre de la Calle</Label>
                  <Input
                    id="street_name"
                    value={formData.street_name}
                    onChange={(e) => handleInputChange("street_name", e.target.value)}
                    placeholder="Av. Colón"
                  />
                </div>
                
                <div>
                  <Label htmlFor="street_number">Número</Label>
                  <Input
                    id="street_number"
                    value={formData.street_number}
                    onChange={(e) => handleInputChange("street_number", e.target.value)}
                    placeholder="1234"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
