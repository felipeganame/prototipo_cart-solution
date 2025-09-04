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
    country: "",
    state_province: "",
    city: "",
    postal_code: "",
    street_name: "",
    street_number: "",
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
    country: {
      required: true,
      maxLength: 100,
    },
    state_province: {
      required: true,
      maxLength: 100,
    },
    city: {
      required: true,
      maxLength: 100,
    },
    postal_code: {
      maxLength: 20,
    },
    street_name: {
      required: true,
      maxLength: 200,
    },
    street_number: {
      required: true,
      maxLength: 50,
    },
    whatsapp_number: {
      required: true,
      pattern: /^\+\d{2,4}\s\d{8,15}$/, // Formato exacto del componente: +XX XXXXXXXX
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    console.log("Form values:", values)
    console.log("Validation errors:", errors)
    console.log("Touched fields:", touched)

    const isValid = validateForm(validationRules)
    console.log("Form validation result:", isValid)

    if (!isValid) {
      console.log("Validation failed, current errors:", errors)
      setSubmitError("Por favor completa todos los campos requeridos correctamente.")
      return
    }

    setIsLoading(true)

    try {
      console.log("Submitting store data:", {
        name: values.name,
        description: values.description,
        country: values.country,
        state_province: values.state_province,
        city: values.city,
        postal_code: values.postal_code,
        street_name: values.street_name,
        street_number: values.street_number,
        whatsapp_number: values.whatsapp_number,
      })

      const response = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description || null,
          country: values.country || null,
          state_province: values.state_province || null,
          city: values.city || null,
          postal_code: values.postal_code || null,
          street_name: values.street_name || null,
          street_number: values.street_number || null,
          phone: null,
          whatsapp_number: values.whatsapp_number || null,
          logoUrl: logoData.logoUrl || null,
          logoId: logoData.logoId || null,
        }),
      })

      const data = await response.json()
      console.log("API response:", data)

      if (response.ok) {
        console.log("Store created successfully, redirecting...")
        router.push("/user-dashboard/stores")
      } else {
        console.error("Error response:", data)
        setSubmitError(data.error || "Error al crear la tienda")
      }
    } catch (error) {
      console.error("Network error:", error)
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
                <Label htmlFor="name">Nombre de la tienda/restaurante/bar/local *</Label>
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
                <Label htmlFor="country">País *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="country"
                    type="text"
                    placeholder="Argentina"
                    value={values.country}
                    onChange={(e) => setValue("country", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("country")
                      validateSingleField("country", validationRules.country)
                    }}
                    className={cn("pl-10", errors.country && touched.country && "border-destructive")}
                  />
                </div>
                {errors.country && touched.country && <p className="text-sm text-destructive">{errors.country}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state_province">Estado/Provincia *</Label>
                  <Input
                    id="state_province"
                    type="text"
                    placeholder="Córdoba"
                    value={values.state_province}
                    onChange={(e) => setValue("state_province", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("state_province")
                      validateSingleField("state_province", validationRules.state_province)
                    }}
                    className={cn(errors.state_province && touched.state_province && "border-destructive")}
                  />
                  {errors.state_province && touched.state_province && <p className="text-sm text-destructive">{errors.state_province}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Córdoba"
                    value={values.city}
                    onChange={(e) => setValue("city", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("city")
                      validateSingleField("city", validationRules.city)
                    }}
                    className={cn(errors.city && touched.city && "border-destructive")}
                  />
                  {errors.city && touched.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Código Postal</Label>
                  <Input
                    id="postal_code"
                    type="text"
                    placeholder="5000"
                    value={values.postal_code}
                    onChange={(e) => setValue("postal_code", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("postal_code")
                      validateSingleField("postal_code", validationRules.postal_code)
                    }}
                    className={cn(errors.postal_code && touched.postal_code && "border-destructive")}
                  />
                  {errors.postal_code && touched.postal_code && <p className="text-sm text-destructive">{errors.postal_code}</p>}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street_name">Nombre de la Calle *</Label>
                  <Input
                    id="street_name"
                    type="text"
                    placeholder="Av. Principal, Calle 123, etc."
                    value={values.street_name}
                    onChange={(e) => setValue("street_name", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("street_name")
                      validateSingleField("street_name", validationRules.street_name)
                    }}
                    className={cn(errors.street_name && touched.street_name && "border-destructive")}
                  />
                  {errors.street_name && touched.street_name && <p className="text-sm text-destructive">{errors.street_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street_number">Número *</Label>
                  <Input
                    id="street_number"
                    type="text"
                    placeholder="123, 45A, etc."
                    value={values.street_number}
                    onChange={(e) => setValue("street_number", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("street_number")
                      validateSingleField("street_number", validationRules.street_number)
                    }}
                    className={cn(errors.street_number && touched.street_number && "border-destructive")}
                  />
                  {errors.street_number && touched.street_number && <p className="text-sm text-destructive">{errors.street_number}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp para pedidos *</Label>
                <CountryPhoneInput
                  value={values.whatsapp_number}
                  onChange={(value) => setValue("whatsapp_number", value)}
                  placeholder="93510000000"
                  error={errors.whatsapp_number && touched.whatsapp_number ? errors.whatsapp_number : undefined}
                />
                {errors.whatsapp_number && touched.whatsapp_number && (
                  <p className="text-sm text-destructive">{errors.whatsapp_number}</p>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Los clientes enviarán sus pedidos a este número de WhatsApp
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
