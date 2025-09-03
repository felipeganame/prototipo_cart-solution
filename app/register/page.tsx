"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, UserPlus, Eye, EyeOff, Store, User, Mail, Lock } from "lucide-react"
import { CountryPhoneInput } from "@/components/country-phone-input"
import { useFormValidation, validationPatterns } from "@/components/form-validation"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const { values, errors, touched, setValue, setFieldTouched, validateForm, validateSingleField } = useFormValidation({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [registerError, setRegisterError] = useState("")
  const [countryCode, setCountryCode] = useState("+54")

  const router = useRouter()

  const validationRules = {
    businessName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: validationPatterns.businessName,
    },
    ownerName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: validationPatterns.fullName,
    },
    email: {
      required: true,
      pattern: validationPatterns.email,
    },
    phone: {
      required: true,
      pattern: validationPatterns.phone,
    },
    password: {
      required: true,
      minLength: 8,
      pattern: validationPatterns.password,
    },
    confirmPassword: {
      required: true,
      custom: (value: string) => {
        if (value !== values.password) {
          return "Las contraseñas no coinciden"
        }
        return null
      },
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")

    if (!acceptTerms) {
      setRegisterError("Debes aceptar los términos y condiciones")
      return
    }

    if (!validateForm(validationRules)) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: values.businessName,
          ownerName: values.ownerName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          countryCode: countryCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirigir a login con mensaje de éxito
        router.push("/login?registered=true")
      } else {
        setRegisterError(data.error || "Error al crear la cuenta")
      }
    } catch (error) {
      setRegisterError("Error de conexión. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = () => {
    console.log("Google register attempt")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-xl">P</span>
            </div>
            <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
            <CardDescription>Únete a Pedi Solutions y digitaliza tu negocio</CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 mb-6 border-2 bg-transparent"
              onClick={handleGoogleRegister}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Registrarse con Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O regístrate con email</span>
              </div>
            </div>

            {registerError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{registerError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nombre del negocio</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Licorería El Buen Gusto"
                    value={values.businessName}
                    onChange={(e) => setValue("businessName", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("businessName")
                      validateSingleField("businessName", validationRules.businessName)
                    }}
                    required
                    className={cn("h-11 pl-10", errors.businessName && touched.businessName && "border-destructive")}
                  />
                </div>
                {errors.businessName && touched.businessName && (
                  <p className="text-sm text-destructive">{errors.businessName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Tu nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="ownerName"
                    type="text"
                    placeholder="Juan Pérez"
                    value={values.ownerName}
                    onChange={(e) => setValue("ownerName", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("ownerName")
                      validateSingleField("ownerName", validationRules.ownerName)
                    }}
                    required
                    className={cn("h-11 pl-10", errors.ownerName && touched.ownerName && "border-destructive")}
                  />
                </div>
                {errors.ownerName && touched.ownerName && (
                  <p className="text-sm text-destructive">{errors.ownerName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={values.email}
                    onChange={(e) => setValue("email", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("email")
                      validateSingleField("email", validationRules.email)
                    }}
                    required
                    className={cn("h-11 pl-10", errors.email && touched.email && "border-destructive")}
                  />
                </div>
                {errors.email && touched.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Número de teléfono</Label>
                <CountryPhoneInput
                  value={values.phone}
                  onChange={(value) => setValue("phone", value)}
                  onCountryChange={(code) => setCountryCode(code)}
                  placeholder="Número de WhatsApp"
                  required
                  error={errors.phone && touched.phone ? errors.phone : undefined}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número"
                    value={values.password}
                    onChange={(e) => setValue("password", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("password")
                      validateSingleField("password", validationRules.password)
                    }}
                    required
                    className={cn("h-11 pl-10 pr-10", errors.password && touched.password && "border-destructive")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && touched.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={values.confirmPassword}
                    onChange={(e) => setValue("confirmPassword", e.target.value)}
                    onBlur={() => {
                      setFieldTouched("confirmPassword")
                      validateSingleField("confirmPassword", validationRules.confirmPassword)
                    }}
                    required
                    className={cn(
                      "h-11 pl-10 pr-10",
                      errors.confirmPassword && touched.confirmPassword && "border-destructive",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-border mt-1"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  Acepto los{" "}
                  <Link href="#" className="text-primary hover:underline">
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link href="#" className="text-primary hover:underline">
                    política de privacidad
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading || !acceptTerms}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creando cuenta...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Crear Cuenta
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
