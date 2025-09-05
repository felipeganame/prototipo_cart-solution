"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"
import { Loader2, DollarSign } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
}

interface EditPriceModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  onPriceUpdated: (updatedProduct: Product) => void
}

export function EditPriceModal({ isOpen, onClose, product, onPriceUpdated }: EditPriceModalProps) {
  const [newPrice, setNewPrice] = useState(product.price.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")

    const priceValue = parseInt(newPrice)
    if (isNaN(priceValue) || priceValue <= 0) {
      setError("Por favor ingresa un precio válido")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price: priceValue }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar el precio")
      }

      const data = await response.json()
      onPriceUpdated({ ...product, price: priceValue })
      handleClose()
    } catch (error) {
      console.error("Error updating price:", error)
      setError(error instanceof Error ? error.message : "Error al actualizar el precio")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNewPrice(product.price.toString())
    setError("")
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Editar Precio
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Producto</Label>
            <p className="text-lg font-semibold">{product.name}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Precio Actual</Label>
            <p className="text-xl font-bold text-red-600">{formatPrice(product.price)}</p>
          </div>

          <div>
            <Label htmlFor="newPrice" className="text-sm font-medium text-gray-700">
              Nuevo Precio
            </Label>
            <Input
              id="newPrice"
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Ingresa el nuevo precio"
              min="1"
              step="1"
              className="mt-1"
              disabled={isLoading}
            />
            {newPrice && !isNaN(parseInt(newPrice)) && parseInt(newPrice) > 0 && (
              <p className="text-sm text-green-600 mt-1">
                Nuevo precio: {formatPrice(parseInt(newPrice))}
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isLoading || !newPrice || isNaN(parseInt(newPrice)) || parseInt(newPrice) <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Actualizar Precio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
