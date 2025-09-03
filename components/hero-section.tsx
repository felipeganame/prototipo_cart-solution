"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, QrCode, MessageCircle, Store } from "lucide-react"

export function HeroSection() {
  const scrollToPricing = () => {
    const element = document.getElementById("pricing")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const openAuthModal = (type: "register") => {
    const event = new CustomEvent("openAuthModal", { detail: { type } })
    window.dispatchEvent(event)
  }

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="animate-slide-in-left">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Store className="w-4 h-4" />
              Solución para Puntos de Venta
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Digitaliza tu negocio con <span className="text-primary">códigos QR</span> y{" "}
              <span className="text-accent">WhatsApp</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              Permite que tus clientes armen sus pedidos escaneando un código QR y generen automáticamente mensajes de
              WhatsApp con su orden. Perfecto para licorerías, tiendas y cualquier punto de venta.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="text-lg px-8 py-6 group" onClick={() => openAuthModal("register")}>
                Pruébalo Gratis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 group bg-transparent"
                onClick={scrollToPricing}
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Negocios activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">98%</div>
                <div className="text-sm text-muted-foreground">Satisfacción</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Soporte</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="animate-slide-in-right">
            <div className="relative">
              {/* Main Phone Mockup */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl animate-float">
                <div className="bg-background rounded-2xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-full"></div>
                      <span className="font-semibold">Mi Licorería</span>
                    </div>
                    <QrCode className="w-6 h-6 text-muted-foreground" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Cerveza Corona x6</span>
                      <span className="font-semibold">$15.000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Whisky Johnnie Walker</span>
                      <span className="font-semibold">$85.000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Vino Tinto Reserva</span>
                      <span className="font-semibold">$25.000</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Enviar por WhatsApp
                  </Button>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium animate-bounce">
                ¡Fácil y rápido!
              </div>

              <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                Sin instalación
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
