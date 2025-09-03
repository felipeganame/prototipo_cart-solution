"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Carlos Mendoza",
    business: "Licorería El Buen Gusto",
    location: "Córdoba, Argentina",
    rating: 5,
    text: "Desde que implementamos Pedi Solutions, nuestras ventas aumentaron un 40%. Los clientes aman la facilidad de hacer pedidos con el código QR.",
    avatar: "/carlos-mendoza-avatar.png",
  },
  {
    name: "María González",
    business: "Minimarket La Esquina",
    location: "Córdoba, Argentina",
    rating: 5,
    text: "La configuración fue súper fácil y el soporte es excelente. Ahora recibo pedidos hasta cuando la tienda está cerrada.",
    avatar: "/maria-gonzalez-avatar.png",
  },
  {
    name: "Roberto Silva",
    business: "Distribuidora Silva",
    location: "Córdoba, Argentina",
    rating: 5,
    text: "Tengo 3 sucursales y Pedi Solutions me permite manejar todas desde una sola plataforma. Los reportes son muy útiles.",
    avatar: "/roberto-silva-avatar.png",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Más de 500 negocios confían en Pedi Solutions para digitalizar sus ventas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center animate-fade-in-up">
          <p className="text-muted-foreground mb-8">Empresas que confían en nosotros</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted rounded-lg p-6 h-16 flex items-center justify-center">
                <span className="text-muted-foreground font-medium">Logo {i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
