"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Store {
  id: number
  name: string
  description?: string
  whatsapp_number?: string
  country?: string
  state_province?: string
  city?: string
  postal_code?: string
  street_name?: string
  street_number?: string
  street_address?: string
  logo_url?: string
}

export default function UserStoresPage() {
  const params = useParams()
  const userId = params.userId as string

  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserStores = async () => {
      try {
        setLoading(true)
        // Necesitamos crear un endpoint público para obtener las tiendas de un usuario
        const response = await fetch(`/api/public/user/${userId}/stores`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar las tiendas")
        }

        if (data.success) {
          setStores(data.stores)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserStores()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando tiendas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">No hay tiendas disponibles</h1>
          <p className="text-gray-500">Este usuario no tiene tiendas activas en este momento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="font-bold text-xl mb-2">Selecciona una Sucursal</h1>
          <p className="text-sm text-gray-600">Elige la tienda de la que quieres hacer tu pedido</p>
        </div>
      </header>

      {/* Stores List */}
      <main className="p-4">
        <div className="max-w-md mx-auto space-y-4">
          {stores.map((store) => (
            <Link key={store.id} href={`/store/${store.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {store.logo_url ? (
                        <img 
                          src={store.logo_url} 
                          alt={store.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🏪</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg mb-1 truncate">{store.name}</h3>
                      
                      {store.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{store.description}</p>
                      )}
                      
                      {/* Address */}
                      {(store.street_name || store.city) && (
                        <div className="flex items-start gap-1 mb-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-500">
                            {[
                              store.street_name && store.street_number ? 
                                `${store.street_name} ${store.street_number}` : 
                                store.street_address,
                              store.city,
                              store.state_province,
                              store.country
                            ].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      
                      {/* WhatsApp */}
                      {store.whatsapp_number && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-xs text-green-600">{store.whatsapp_number}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
