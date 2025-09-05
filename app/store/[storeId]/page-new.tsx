"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, ArrowLeft, Home } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  category_id: number
  category_name: string
}

interface Category {
  id: number
  name: string
  description?: string
  icon?: string
}

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

interface CartItem extends Product {
  quantity: number
}

export default function PublicStorePage() {
  const params = useParams()
  const storeId = params.storeId as string

  // Estado principal
  const [store, setStore] = useState<Store | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({})
  
  // Estados de UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"categories" | "products">("categories")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCart, setShowCart] = useState(false)
  
  // Estado del carrito y pago
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "otro" | "">("")
  const [cashAmount, setCashAmount] = useState("")

  // Cargar datos de la tienda
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/public/store/${storeId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar la tienda")
        }

        if (data.success) {
          setStore(data.data.store)
          setCategories(data.data.categories)
          setProducts(data.data.products)
          setProductsByCategory(data.data.productsByCategory)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (storeId) {
      fetchStoreData()
    }
  }, [storeId])

  // Funciones del carrito
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Función para generar mensaje de WhatsApp
  const generateWhatsAppMessage = () => {
    if (!store?.whatsapp_number) {
      alert("Esta tienda no tiene WhatsApp configurado")
      return
    }

    let message = `¡Hola! Me gustaría hacer el siguiente pedido en *${store.name}*:\n\n`

    cart.forEach((item) => {
      message += `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`
    })

    const subtotal = getTotalPrice()
    message += `\n*Subtotal: ${formatPrice(subtotal)}*\n`

    if (paymentMethod) {
      const paymentText = {
        efectivo: "Efectivo",
        otro: "Otro método de pago",
      }
      message += `*Método de pago: ${paymentText[paymentMethod]}*\n`

      if (paymentMethod === "efectivo" && cashAmount) {
        message += `*Pago con: ${formatPrice(Number.parseInt(cashAmount))}*\n`
        const change = Number.parseInt(cashAmount) - subtotal
        if (change > 0) {
          message += `*Cambio: ${formatPrice(change)}*\n`
        }
      }
    }

    message += `\n¡Gracias!`

    const encodedMessage = encodeURIComponent(message)
    // Remover caracteres no numéricos del número de WhatsApp
    const phoneNumber = store.whatsapp_number.replace(/[^\d]/g, '')
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando tienda...</p>
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

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Tienda no encontrada</h1>
          <p className="text-gray-500">La tienda que buscas no existe o no está disponible.</p>
        </div>
      </div>
    )
  }

  // Función para obtener productos filtrados
  const getFilteredProducts = () => {
    const categoryProducts = selectedCategoryId 
      ? productsByCategory[selectedCategoryId] || []
      : products

    if (!searchTerm) return categoryProducts

    return categoryProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Vista del carrito
  if (showCart) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Cart Header */}
        <header className="bg-white border-b p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
              ← Volver
            </Button>
            <h1 className="font-bold text-lg">Mi Carrito</h1>
            <div className="w-8"></div>
          </div>
        </header>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tu carrito está vacío</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setShowCart(false)}>
                Continuar comprando
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-w-md mx-auto">
              {cart.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-600">{formatPrice(item.price)}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="min-w-[2rem] text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-transparent text-red-600 hover:text-red-700"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="bg-white border-t p-4 flex-shrink-0">
            <div className="max-w-md mx-auto space-y-4">
              {/* Order Summary */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Resumen del pedido:</h3>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Método de pago:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={paymentMethod === "efectivo" ? "default" : "outline"}
                    size="sm"
                    className={paymentMethod === "efectivo" ? "" : "bg-transparent"}
                    onClick={() => {
                      setPaymentMethod("efectivo")
                      setCashAmount("")
                    }}
                  >
                    <Banknote className="w-4 h-4 mr-2" />
                    Efectivo
                  </Button>
                  <Button
                    variant={paymentMethod === "otro" ? "default" : "outline"}
                    size="sm"
                    className={paymentMethod === "otro" ? "" : "bg-transparent"}
                    onClick={() => {
                      setPaymentMethod("otro")
                      setCashAmount("")
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Otro
                  </Button>
                </div>

                {paymentMethod === "efectivo" && (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="¿Con cuánto vas a pagar?"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="text-center"
                    />
                    {cashAmount && Number.parseInt(cashAmount) >= getTotalPrice() && (
                      <p className="text-center text-sm text-green-600">
                        Cambio: {formatPrice(Number.parseInt(cashAmount) - getTotalPrice())}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Finalize Order Button */}
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full"
                onClick={generateWhatsAppMessage}
                disabled={
                  !paymentMethod ||
                  (paymentMethod === "efectivo" && !!cashAmount && Number.parseInt(cashAmount) < getTotalPrice())
                }
              >
                {!paymentMethod
                  ? "Selecciona método de pago"
                  : paymentMethod === "efectivo" && cashAmount && Number.parseInt(cashAmount) < getTotalPrice()
                    ? "Monto insuficiente"
                    : "Enviar Pedido por WhatsApp"}
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Vista de categorías
  if (currentView === "categories") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b p-4 sticky top-0 z-40">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-4">
              {store.logo_url && (
                <img src={store.logo_url} alt={store.name} className="w-16 h-16 mx-auto mb-2 rounded-lg" />
              )}
              <h1 className="font-bold text-xl">{store.name}</h1>
              {store.description && (
                <p className="text-sm text-gray-600">{store.description}</p>
              )}
            </div>
          </div>
        </header>

        {/* Categories Grid */}
        <main className="p-4">
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="font-bold text-lg">Selecciona una categoría</h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => {
                const categoryProducts = productsByCategory[category.id] || []
                return (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedCategoryId(category.id)
                      setCurrentView("products")
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">{category.icon || "📦"}</span>
                      </div>
                      <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                      <p className="text-xs text-gray-500">
                        {categoryProducts.length} producto{categoryProducts.length !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </main>

        {/* Fixed Cart Button */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full shadow-lg"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ver Carrito ({getCartItemsCount()}) - {formatPrice(getTotalPrice())}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Vista de productos
  const filteredProducts = getFilteredProducts()
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("categories")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center">
              <h1 className="font-bold text-lg">{selectedCategory?.name}</h1>
              <p className="text-xs text-gray-500">{store.name}</p>
            </div>
            <div className="w-8"></div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Products List */}
      <main className="p-4 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          {filteredProducts.map((product) => {
            const cartItem = cart.find(item => item.id === product.id)
            return (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600 text-lg">
                          {formatPrice(product.price)}
                        </span>
                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-transparent"
                              onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="min-w-[2rem] text-center font-medium">
                              {cartItem.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-transparent"
                              onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => addToCart(product)}
                          >
                            Agregar
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full shadow-lg"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Ver Carrito ({getCartItemsCount()}) - {formatPrice(getTotalPrice())}
          </Button>
        </div>
      )}
    </div>
  )
}
