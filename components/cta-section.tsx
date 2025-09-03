"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function CTASection() {
  const openAuthModal = (type: "register") => {
    const event = new CustomEvent("openAuthModal", { detail: { type } })
    window.dispatchEvent(event)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            ¡Oferta por tiempo limitado!
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Digitaliza tu negocio <span className="text-primary">hoy mismo</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Únete a más de 500 negocios que ya están aumentando sus ventas con Pedi Solutions. Configuración gratuita y
            soporte incluido.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="text-lg px-8 py-6 group bg-accent hover:bg-accent/90"
              onClick={() => {
              const phoneNumber = "5493513363008"; // Replace with actual WhatsApp number
              const message = "Hola! Me interesa tu servicio y me gustaría conocer más para implementarlo.";
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
              }}
            >
              <Zap className="w-5 h-5 mr-2" />
              Hablar con ventas
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">✓</span>
              </div>
              <span className="text-sm text-muted-foreground">Sin tarjeta de crédito</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-accent font-bold">✓</span>
              </div>
              <span className="text-sm text-muted-foreground">Configuración gratuita</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">✓</span>
              </div>
              <span className="text-sm text-muted-foreground">Soporte incluido</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
