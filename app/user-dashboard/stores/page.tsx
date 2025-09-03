"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, MapPin, Phone, QrCode, Edit, Trash2 } from "lucide-react"
import { PlanRestrictions, usePlanRestrictions } from "@/components/plan-restrictions"

interface StoreType {
  id: number
  name: string
  description?: string
  address?: string
  phone?: string
  whatsapp_number?: string
  qr_code: string
  created_at: string
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { userPlan, canAddItem } = usePlanRestrictions()
  const router = useRouter()

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores")
      if (response.ok) {
        const data = await response.json()
        setStores(data.stores)
      }
    } catch (error) {
      console.error("Error fetching stores:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStore = async (storeId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta tienda?")) return

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setStores(stores.filter((store) => store.id !== storeId))
      }
    } catch (error) {
      console.error("Error deleting store:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando tiendas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/user-dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mis Tiendas</h1>
              <p className="text-muted-foreground">Gestiona todas tus sucursales desde aquí</p>
            </div>

            {userPlan && canAddItem(stores.length, "stores") && (
              <Link href="/user-dashboard/stores/add">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Tienda
                </Button>
              </Link>
            )}
          </div>
        </div>

        {userPlan && (
          <div className="mb-6">
            <PlanRestrictions
              currentCount={stores.length}
              maxAllowed={userPlan.max_stores}
              itemType="tiendas"
              planName={userPlan.name}
            />
          </div>
        )}

        {stores.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No tienes tiendas aún</h3>
              <p className="text-muted-foreground mb-6">Crea tu primera tienda para comenzar a vender</p>
              {userPlan && canAddItem(stores.length, "stores") && (
                <Link href="/user-dashboard/stores/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Mi Primera Tienda
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card key={store.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {store.name}
                      </CardTitle>
                      {store.description && <CardDescription>{store.description}</CardDescription>}
                    </div>
                    <Badge variant="outline">Activa</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {store.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {store.address}
                    </div>
                  )}

                  {store.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {store.phone}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <QrCode className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{store.qr_code}</span>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Link href={`/user-dashboard/stores/${store.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Edit className="w-4 h-4 mr-2" />
                        Gestionar
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteStore(store.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
