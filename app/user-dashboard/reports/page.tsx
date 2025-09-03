"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, Package, Users, Star } from "lucide-react"

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

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

  // Mock data for statistics
  const topProducts = [
    { name: "Grey Goose Vodka Premium", sales: 45, percentage: 18.2 },
    { name: "Johnnie Walker Black Label", sales: 38, percentage: 15.4 },
    { name: "Corona Extra", sales: 32, percentage: 12.9 },
    { name: "Absolut Vodka", sales: 28, percentage: 11.3 },
    { name: "Bacardi Blanco", sales: 25, percentage: 10.1 },
  ]

  const popularCombos = [
    { combo: "Vodka + Jugo de Naranja + Hielo", frequency: 23, percentage: 28.4 },
    { combo: "Whisky + Coca Cola + Limón", frequency: 19, percentage: 23.5 },
    { combo: "Ron + Coca Cola + Limón", frequency: 15, percentage: 18.5 },
    { combo: "Cerveza + Papas + Maní", frequency: 12, percentage: 14.8 },
    { combo: "Tequila + Limón + Sal", frequency: 8, percentage: 9.9 },
  ]

  const productCombinations = [
    { product: "Vodka Premium", combinedWith: ["Jugo de Naranja", "Red Bull", "Agua Tónica"], frequency: 67 },
    { product: "Whisky", combinedWith: ["Coca Cola", "Hielo", "Agua"], frequency: 54 },
    { product: "Ron", combinedWith: ["Coca Cola", "Limón", "Hielo"], frequency: 43 },
    { product: "Cerveza", combinedWith: ["Papas", "Maní", "Aceitunas"], frequency: 38 },
    { product: "Tequila", combinedWith: ["Limón", "Sal", "Sangrita"], frequency: 29 },
  ]

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/user-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Reportes y Estadísticas</h1>
              <p className="text-sm text-muted-foreground">Análisis de tu negocio</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Análisis de Ventas</h2>
          <p className="text-muted-foreground">Descubre qué productos prefieren tus clientes y cómo los combinan</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Pedido</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$28.50</div>
              <p className="text-xs text-muted-foreground">+8% vs mes anterior</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Productos Más Pedidos
              </CardTitle>
              <CardDescription>Los productos favoritos de tus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sales} pedidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{product.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Combos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-500" />
                Combos Más Populares
              </CardTitle>
              <CardDescription>Combinaciones que más piden tus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularCombos.map((combo, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm font-bold text-green-600">{combo.percentage}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{combo.combo}</p>
                    <p className="text-xs text-muted-foreground">{combo.frequency} veces pedido</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Combinations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Análisis de Combinaciones
            </CardTitle>
            <CardDescription>Cómo se combinan tus productos más vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productCombinations.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">{item.product}</h4>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {item.frequency} veces
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Se combina frecuentemente con:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.combinedWith.map((combo, comboIndex) => (
                      <span key={comboIndex} className="text-xs bg-muted px-2 py-1 rounded-md">
                        {combo}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💡 Insights y Recomendaciones</CardTitle>
            <CardDescription>Sugerencias para mejorar tus ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm">
                  <strong>Oportunidad:</strong> El 67% de los pedidos de vodka incluyen mixers. Considera crear paquetes
                  promocionales.
                </p>
              </div>
              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                <p className="text-sm">
                  <strong>Tendencia:</strong> Los combos con bebidas premium están creciendo 23% mensual.
                </p>
              </div>
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm">
                  <strong>Recomendación:</strong> Promociona snacks junto con cervezas para aumentar el ticket promedio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
