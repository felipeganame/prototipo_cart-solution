"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react"
import { CountryPhoneInput } from "@/components/country-phone-input"
import { useFormValidation, validationPatterns } from "@/components/form-validation"
import { cn } from "@/lib/utils"

export function Footer() {
  const { values, errors, touched, setValue, setFieldTouched, validateForm, validateSingleField } = useFormValidation({
    name: "",
    phone: "",
    email: "",
    businessName: "",
    message: "",
  })

  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      pattern: validationPatterns.fullName,
    },
    phone: {
      required: true,
      pattern: validationPatterns.phone,
    },
    email: {
      required: true,
      pattern: validationPatterns.email,
    },
    businessName: {
      required: false,
      pattern: validationPatterns.businessName,
    },
    message: {
      required: false,
      maxLength: 500,
    },
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm(validationRules)) {
      return
    }

    // TODO: Implement contact form submission
    console.log("Contact form submitted:", values)
  }

  return (
    <footer className="bg-muted/30 pt-20 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contact Section */}
        <section id="contact" className="mb-16">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">¿Listo para comenzar?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Contáctanos y te ayudamos a configurar tu negocio en menos de 24 horas
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="animate-slide-in-left">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Envíanos un mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Nombre *</label>
                      <Input
                        placeholder="Tu nombre completo"
                        value={values.name}
                        onChange={(e) => setValue("name", e.target.value)}
                        onBlur={() => {
                          setFieldTouched("name")
                          validateSingleField("name", validationRules.name)
                        }}
                        required
                        className={cn(errors.name && touched.name && "border-destructive")}
                      />
                      {errors.name && touched.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Teléfono *</label>
                      <CountryPhoneInput
                        value={values.phone}
                        onChange={(value) => setValue("phone", value)}
                        placeholder="Tu número de WhatsApp"
                        required
                        error={errors.phone && touched.phone ? errors.phone : undefined}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email *</label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={values.email}
                      onChange={(e) => setValue("email", e.target.value)}
                      onBlur={() => {
                        setFieldTouched("email")
                        validateSingleField("email", validationRules.email)
                      }}
                      required
                      className={cn(errors.email && touched.email && "border-destructive")}
                    />
                    {errors.email && touched.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Nombre del negocio</label>
                    <Input
                      placeholder="Nombre de tu licorería o tienda"
                      value={values.businessName}
                      onChange={(e) => setValue("businessName", e.target.value)}
                      onBlur={() => {
                        setFieldTouched("businessName")
                        validateSingleField("businessName", validationRules.businessName)
                      }}
                      className={cn(errors.businessName && touched.businessName && "border-destructive")}
                    />
                    {errors.businessName && touched.businessName && (
                      <p className="text-sm text-destructive mt-1">{errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Mensaje</label>
                    <Textarea
                      placeholder="Cuéntanos sobre tu negocio y cómo podemos ayudarte..."
                      rows={4}
                      value={values.message}
                      onChange={(e) => setValue("message", e.target.value)}
                      onBlur={() => {
                        setFieldTouched("message")
                        validateSingleField("message", validationRules.message)
                      }}
                      className={cn(errors.message && touched.message && "border-destructive")}
                    />
                    {errors.message && touched.message && (
                      <p className="text-sm text-destructive mt-1">{errors.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="animate-slide-in-right">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-6">Información de contacto</h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">WhatsApp</p>
                        <p className="text-muted-foreground">+54 9 351 336 3008</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <p className="text-muted-foreground">ventas@pedisolutions.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Oficina</p>
                        <p className="text-muted-foreground">Córdoba, Argentina</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-4">Horarios de atención</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                    <p>Sábados: 9:00 AM - 2:00 PM</p>
                    <p>Domingos: Cerrado</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-4">Síguenos</h4>
                  <div className="flex gap-4">
                    <Button variant="outline" size="icon">
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Instagram className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Bottom */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-foreground">Pedi Solutions</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 Pedi Solutions. Todos los derechos reservados.</span>
              <div className="flex gap-4">
                <a href="#" className="hover:text-foreground transition-colors">
                  Términos
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacidad
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
