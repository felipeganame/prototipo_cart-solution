"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Store, MapPin } from "lucide-react"
import { CountryPhoneInput } from "@/components/country-phone-input"
import { useFormValidation, validationPatterns } from "@/components/form-validation"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/image-upload"

export default function AddStorePage() {
  const { values, errors, touched, setValue, setFieldTouched, validateForm, validateSingleField } = useFormValidation({
    name: "",
    description: "",
    address: "",
    whatsapp_number: "",
  })

  const [logoData, setLogoData] = useState({
    logoUrl: "",
    logoId: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const router = useRouter()

  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    description: {
      maxLength: 500,
    },
    address: {
      maxLength: 200,
    },
    whatsapp_number: {
      required: true,
      pattern: /^\+\d{1,4}\s?\d{11}$/, // Prefijo del país + exactamente 11 dígitos
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    if (!validateForm(validationRules)) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description || null,
          address: values.address || null,
          phone: null,
          whatsapp_number: values.whatsapp_number || null,
          logoUrl: logoData.logoUrl || null,
          logoId: logoData.logoId || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/user-dashboard/stores")
      } else {
        setSubmitError(data.error || "Error al crear la tienda")
      }
    } catch (error) {
      setSubmitError("Error de conexión. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUploaded = (imageUrl: string, imageId: string) => {
    setLogoData({ logoUrl: imageUrl, logoId: imageId })
  }

  const handleLogoRemoved = () => {
    setLogoData({ logoUrl: "", logoId: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Link
            href="/user-dashboard/stores"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis Tiendas
          </Link>

          <h1 className="text-3xl font-bold mb-2">Agregar Nueva Tienda</h1>
          <p className="text-muted-foreground">Crea una nueva sucursal para expandir tu negocio</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Información de la Tienda
            </CardTitle>
            <CardDescription>Completa los datos de tu nueva sucursal</CardDescription>
          </CardHeader>

          <CardContent>
            {submitError && (
              <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la tienda *</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Licorería Centro"
                    value={values.name}
                    onChange={(e) => setValue("name", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("name")
                      validateSingleField("name", validationRules.name)
                    }}
                    required
                    className={cn("pl-10", errors.name && touched.name && "border-destructive")}
                  />
                </div>
                {errors.name && touched.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu tienda (opcional)"
                  value={values.description}
                  onChange={(e) => setValue("description", e.target.value)}
                  onBlur={() => {
                    setFieldTouched("description")
                    validateSingleField("description", validationRules.description)
                  }}
                  className={cn(errors.description && touched.description && "border-destructive")}
                  rows={3}
                />
                {errors.description && touched.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Av. Principal 123, Ciudad"
                    value={values.address}
                    onChange={(e) => setValue("address", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("address")
                      validateSingleField("address", validationRules.address)
                    }}
                    className={cn("pl-10", errors.address && touched.address && "border-destructive")}
                  />
                </div>
                {errors.address && touched.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp para pedidos *</Label>
                <CountryPhoneInput
                  value={values.whatsapp_number}
                  onChange={(value) => setValue("whatsapp_number", value)}
                  placeholder="93513363008"
                  error={errors.whatsapp_number && touched.whatsapp_number ? errors.whatsapp_number : undefined}
                />
                {errors.whatsapp_number && touched.whatsapp_number && (
                  <p className="text-sm text-destructive">{errors.whatsapp_number}</p>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Los clientes enviarán sus pedidos a este número de WhatsApp
                  </p>
                  <p className="text-xs text-orange-600 font-medium">
                    💡 Selecciona tu país y luego ingresa 11 números. Ejemplo: +54 93513363008
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo de la Tienda (Opcional)</Label>
                <ImageUpload
                  onImageUploaded={handleLogoUploaded}
                  onImageRemoved={handleLogoRemoved}
                  currentImageUrl={logoData.logoUrl}
                  imageType="store"
                  entityId={values.name || "new-store"}
                  maxSizeMB={3}
                />
                <p className="text-xs text-muted-foreground">El logo aparecerá en tu tienda pública y códigos QR</p>
              </div>

              <div className="flex gap-4 pt-6">
                <Link href="/user-dashboard/stores" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancelar
                  </Button>
                </Link>

                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creando...
                    </div>
                  ) : (
                    "Crear Tienda"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
