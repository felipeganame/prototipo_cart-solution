"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Zap } from "lucide-react"

const plans = [
  {
    name: "Básico",
    price: "$29.900",
    period: "/mes",
    description: "Perfecto para empezar",
    features: [
      "Hasta 100 productos",
      "Código QR personalizado",
      "Integración WhatsApp",
      "Reportes básicos",
      "Soporte por email",
    ],
    popular: false,
    cta: "Comenzar Gratis",
  },
  {
    name: "Profesional",
    price: "$59.900",
    period: "/mes",
    description: "Para negocios en crecimiento",
    features: [
      "Productos ilimitados",
      "Múltiples códigos QR",
      "WhatsApp Business API",
      "Reportes avanzados",
      "Soporte prioritario",
      "Personalización de marca",
      "Integración con POS",
    ],
    popular: true,
    cta: "Prueba 30 días gratis",
  },
  {
    name: "Empresarial",
    price: "$99.900",
    period: "/mes",
    description: "Para múltiples ubicaciones",
    features: [
      "Todo lo del plan Profesional",
      "Múltiples sucursales",
      "API personalizada",
      "Análisis predictivo",
      "Soporte 24/7",
      "Capacitación personalizada",
      "Integración ERP",
    ],
    popular: false,
    cta: "Contactar Ventas",
  },
]

export function PricingSection() {
  const openAuthModal = (type: "register") => {
    const event = new CustomEvent("openAuthModal", { detail: { type } })
    window.dispatchEvent(event)
  }

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Planes que se adaptan a tu negocio
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Comienza gratis y escala según crezca tu negocio. Sin compromisos, cancela cuando quieras.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up ${
                plan.popular ? "border-primary shadow-lg scale-105" : "border-border hover:border-primary/50"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Más Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-foreground mb-2">{plan.name}</CardTitle>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular ? "bg-primary hover:bg-primary/90" : "bg-accent hover:bg-accent/90"
                  }`}
                  onClick={() => openAuthModal("register")}
                >
                  {plan.popular && <Zap className="w-4 h-4 mr-2" />}
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Free Trial Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 text-center animate-fade-in-up">
          <h3 className="text-2xl font-bold text-foreground mb-4">¿No estás seguro? ¡Pruébalo gratis!</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Todos nuestros planes incluyen 30 días de prueba gratuita. No necesitas tarjeta de crédito para comenzar.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" onClick={() => openAuthModal("register")}>
            Comenzar Prueba Gratuita
          </Button>
        </div>
      </div>
    </section>
  )
}
