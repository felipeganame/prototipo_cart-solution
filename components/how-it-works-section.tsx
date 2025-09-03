"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Upload, QrCode, Smartphone, MessageCircle } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Carga tus productos",
    description: "Sube tu catálogo de productos con precios y descripciones en minutos.",
    color: "bg-primary/10 text-primary",
  },
  {
    step: "02",
    icon: QrCode,
    title: "Genera tu código QR",
    description: "Obtén un código QR personalizado para tu negocio listo para imprimir.",
    color: "bg-accent/10 text-accent",
  },
  {
    step: "03",
    icon: Smartphone,
    title: "Cliente escanea",
    description: "Tus clientes escanean el código y arman su pedido desde su teléfono.",
    color: "bg-primary/10 text-primary",
  },
  {
    step: "04",
    icon: MessageCircle,
    title: "Recibe por WhatsApp",
    description: "El pedido llega automáticamente a tu WhatsApp con todos los detalles.",
    color: "bg-accent/10 text-accent",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Cómo funciona Pedi Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            En solo 4 pasos simples, tu negocio estará listo para recibir pedidos digitales
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-6 text-center">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{step.step}</span>
                  </div>
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 mt-4 group-hover:scale-110 transition-transform`}
                >
                  <step.icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </CardContent>

              {/* Connector Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border transform -translate-y-1/2"></div>
              )}
            </Card>
          ))}
        </div>

        {/* Demo Section Placeholder */}
        <div className="mt-20 bg-muted/30 rounded-2xl p-8 lg:p-12 animate-fade-in-up">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Ve el proceso completo en acción</h3>
            <p className="text-muted-foreground">Desde la configuración hasta el primer pedido</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Demo Interactiva</h4>
                <p className="text-muted-foreground">Prueba el flujo completo sin necesidad de registro</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
