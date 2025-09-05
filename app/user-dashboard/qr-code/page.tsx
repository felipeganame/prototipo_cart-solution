"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Copy, QrCode, ExternalLink, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function QRCodePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [storeUrl, setStoreUrl] = useState("")

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

    // Generate user stores URL (where customers select which store)
    const baseUrl = window.location.origin
    setStoreUrl(`${baseUrl}/user/${userData.id}/stores`)
  }, [router])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl)
      toast({
        title: "¡Copiado!",
        description: "El enlace se ha copiado al portapapeles",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      })
    }
  }

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: "Mi Tienda - Pedi Solutions",
        text: "Visita mi tienda y haz tu pedido fácilmente",
        url: storeUrl,
      })
    } else {
      copyToClipboard()
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/user-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Mi Código QR</h1>
              <p className="text-sm text-muted-foreground">Comparte tus tiendas con tus clientes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* QR Code Display */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5" />
                Tu Código QR
              </CardTitle>
              <CardDescription>Los clientes pueden escanear este código para ver tus sucursales</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 mb-6">
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Código QR</p>
                    <p className="text-xs text-gray-400">Se generará aquí</p>
                  </div>
                </div>
              </div>
              <Button className="w-full mb-4">Descargar QR</Button>
            </CardContent>
          </Card>

          {/* Store URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Enlace de tus Tiendas
              </CardTitle>
              <CardDescription>Comparte este enlace directamente con tus clientes para que seleccionen una sucursal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={storeUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={shareUrl} className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
                <Link href={storeUrl} target="_blank">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Vista Previa
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>¿Cómo usar tu código QR?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <p>Descarga e imprime tu código QR</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <p>Colócalo en un lugar visible de tu negocio</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <p>Los clientes escanean y acceden a tu catálogo</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <p>Reciben el pedido por WhatsApp automáticamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
