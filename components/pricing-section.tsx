"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Zap } from "lucide-react"

const plans = [
  {
    name: "Primera Sucursal",
    price: "$20.000",
    period: "/mes",
    description: "Todo lo que necesitas para empezar",
    features: [
      "Productos ilimitados",
      "Código QR personalizado",
      "Integración WhatsApp",
      "Reportes avanzados",
      "Personalización de marca",
      "Soporte prioritario",
      "Análisis de ventas",
      "Integración POS",
    ],
    popular: true,
    cta: "Iniciar Prueba Gratuita",
  },
  {
    name: "Sucursales Adicionales",
    price: "$10.000",
    period: "/mes c/u",
    description: "Expande tu negocio sin límites",
    features: [
      "Todas las funciones incluidas",
      "Gestión centralizada",
      "Reportes consolidados",
      "Códigos QR independientes",
      "WhatsApp por ubicación",
      "Dashboard unificado",
      "Estadísticas comparativas",
      "Soporte dedicado",
    ],
    popular: false,
    cta: "Agregar Sucursal",
  },
  {
    name: "Empresarial",
    price: "Cotización",
    period: "personalizada",
    description: "Solución a medida para grandes empresas",
    features: [
      "Sucursales ilimitadas",
      "API personalizada",
      "Integración ERP completa",
      "Análisis predictivo avanzado",
      "Soporte 24/7 dedicado",
      "Capacitación especializada",
      "Desarrollo de funcionalidades",
      "SLA garantizado",
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
            Precios simples y transparentes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Prueba gratis durante un mes completo, sin tarjeta de crédito. Solo pagas cuando decidas continuar.
          </p>
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800">
            <p className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              🎉 Promoción de Lanzamiento
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Primer mes completamente GRATIS • Sin tarjeta de crédito • Cancela cuando quieras
            </p>
          </div>
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
          <h3 className="text-2xl font-bold text-foreground mb-4">¿Listo para revolucionar tu negocio?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            <strong>Primer mes completamente GRATIS</strong> - No necesitas tarjeta de crédito para comenzar. 
            Después, solo $20.000 por tu primera sucursal y $10.000 por cada adicional.
          </p>
          <div className="mb-6 p-4 bg-white/50 dark:bg-black/20 rounded-xl">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Cancela cuando quieras</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Soporte incluido</span>
              </div>
            </div>
          </div>
          <Button size="lg" className="text-lg px-8 py-6" onClick={() => openAuthModal("register")}>
            Comenzar Prueba Gratuita - 1 Mes
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Al finalizar tu prueba gratuita, continúas con solo $20.000/mes
          </p>
        </div>
      </div>
    </section>
  )
}
