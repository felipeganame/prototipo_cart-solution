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
  ],
  cervezas: [
    {
      id: 6,
      name: "Corona",
      description: "Cerveza Premium 355ml",
      price: 3500,
      image: "/corona-beer-bottle.png",
    },
    {
      id: 7,
      name: "Heineken",
      description: "Cerveza Importada 355ml",
      price: 4000,
      image: "/heineken-beer-bottle.png",
    },
  ],
}

const categories = [
  { id: "vodka", name: "VODKA", emoji: "🥃", image: "/vodka-bottles-background.png" },
  { id: "ron", name: "RON", emoji: "🥃", image: "/rum-bottles-background.png" },
  { id: "cervezas", name: "CERVEZAS", emoji: "🍺", image: "/beer-bottles-background.png" },
]

interface CartItem {
  id: number
  name: string
  description: string
  price: number
  quantity: number
  image: string
}

export default function PublicStorePage() {
  const params = useParams()
  const storeId = params.storeId as string
  const [currentView, setCurrentView] = useState<"categories" | "products" | "cart">("categories")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "otro" | null>(null)
  const [cashAmount, setCashAmount] = useState<string>("")

  const allProducts = Object.values(productsByCategory).flat()
  const categoryProducts = selectedCategory ? productsByCategory[selectedCategory] || [] : []

  const filteredProducts = categoryProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)
      if (existingItem) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const generateWhatsAppMessage = () => {
    const storeName = `Tienda ${storeId}`
    let message = `¡Hola! Me gustaría hacer el siguiente pedido en ${storeName}:\n\n`

    cart.forEach((item) => {
      message += `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`
    })

    const subtotal = getTotalPrice()
    message += `\n*Subtotal: ${formatPrice(subtotal)}*\n`
    message += `*Total: ${formatPrice(subtotal)}*\n`

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
    const phoneNumber = "5493513363008"
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
                    <div className="flex gap-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                        <p className="text-sm font-bold text-red-600">{formatPrice(item.price)}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                            onClick={() => updateQuantity(item.id, 0)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
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
                  <span>Subtotal:</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Método de pago:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={paymentMethod === "efectivo" ? "default" : "outline"}
                    size="sm"
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setPaymentMethod("efectivo")}
                  >
                    <Banknote className="w-4 h-4" />
                    <span className="text-xs">Efectivo</span>
                  </Button>
                  <Button
                    variant={paymentMethod === "otro" ? "default" : "outline"}
                    size="sm"
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setPaymentMethod("otro")}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs">Otro método</span>
                  </Button>
                </div>

                {paymentMethod === "efectivo" && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">¿Con cuánto vas a pagar? (opcional)</label>
                    <Input
                      type="number"
                      placeholder={`Mínimo ${formatPrice(getTotalPrice())}`}
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="text-sm"
                    />
                    {cashAmount && Number.parseInt(cashAmount) < getTotalPrice() && (
                      <p className="text-xs text-red-500">
                        El monto debe ser igual o superior al total (${formatPrice(getTotalPrice())})
                      </p>
                    )}
                    {cashAmount && Number.parseInt(cashAmount) > getTotalPrice() && (
                      <p className="text-xs text-green-600">
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
                  (paymentMethod === "efectivo" && cashAmount && Number.parseInt(cashAmount) < getTotalPrice())
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

  if (currentView === "categories") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-xl">Tienda {storeId}</h1>
                <p className="text-sm text-gray-600">Selecciona una categoría</p>
              </div>
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setShowCart(true)} className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5">{getTotalItems()}</Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Categories Grid */}
        <main className="container mx-auto px-4 py-6">
          <div className="grid gap-4 max-w-md mx-auto">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedCategory(category.id)
                  setCurrentView("products")
                }}
              >
                <div className="relative h-32 bg-gradient-to-r from-gray-900 to-gray-700">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-xl font-bold">{category.name}</h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.emoji}</span>
                      <span className="font-bold">{category.name}</span>
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("categories")}>
                ←
              </Button>
              <h1 className="font-bold text-xl">{selectedCategory.toUpperCase()}</h1>
            </div>
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowCart(true)} className="relative">
                <ShoppingCart className="w-4 h-4" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5">{getTotalItems()}</Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
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
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-4 max-w-md mx-auto">
          {filteredProducts.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id)

            return (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                      <p className="text-red-600 font-bold text-xl mb-4">{formatPrice(product.price)}</p>

                      {cartItem ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-white"
                              onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-white"
                              onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => updateQuantity(product.id, 0)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-black hover:bg-gray-800 text-white rounded-full"
                          onClick={() => addToCart(product)}
                        >
                          Agregar al Carrito
                        </Button>
                      )}
                    </div>
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img
                        src={product.image || "/placeholder.svg"}
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

        {/* Fixed Cart Button */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full shadow-lg"
              onClick={() => setShowCart(true)}
            >
              Ver Carrito ({getTotalItems()}) - {formatPrice(getTotalPrice())}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
