"use client"

import { Card, CardContent } from "@/components/ui/card"
import { QrCode, MessageCircle, Smartphone, BarChart3, Clock, Shield } from "lucide-react"

const features = [
  {
    icon: QrCode,
    title: "Códigos QR Personalizados",
    description: "Genera códigos QR únicos para cada punto de venta con tu marca y productos.",
    color: "text-primary",
  },
  {
    icon: MessageCircle,
    title: "Integración WhatsApp",
    description: "Los pedidos se envían automáticamente por WhatsApp con formato profesional.",
    color: "text-accent",
  },
  {
    icon: Smartphone,
    title: "Sin App Necesaria",
    description: "Tus clientes solo necesitan la cámara de su teléfono para hacer pedidos.",
    color: "text-primary",
  },
  {
    icon: BarChart3,
    title: "Reportes en Tiempo Real",
    description: "Visualiza estadísticas de ventas y productos más pedidos al instante.",
    color: "text-accent",
  },
  {
    icon: Clock,
    title: "Configuración en Minutos",
    description: "Carga tus productos y genera tu código QR en menos de 5 minutos.",
    color: "text-primary",
  },
  {
    icon: Shield,
    title: "Seguro y Confiable",
    description: "Tus datos están protegidos con encriptación de nivel bancario.",
    color: "text-accent",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Todo lo que necesitas para digitalizar tu negocio
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Pedi Solutions te ofrece todas las herramientas necesarias para modernizar tu punto de venta y aumentar tus
            ventas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-muted group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video/Image Placeholder Section */}
        <div className="mt-20 animate-fade-in-up">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Ve Pedi Solutions en acción</h3>
            <p className="text-muted-foreground">Descubre lo fácil que es configurar y usar nuestra plataforma</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Video Placeholder */}
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">Video Tutorial</p>
                  <p className="text-sm text-muted-foreground">Cómo configurar tu primera tienda</p>
                </div>
              </div>
            </div>

            {/* Screenshots Placeholder */}
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-muted-foreground">Capturas de Pantalla</p>
                  <p className="text-sm text-muted-foreground">Interfaz de usuario intuitiva</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
