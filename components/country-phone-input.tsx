"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Country {
  code: string
  name: string
  flag: string
  dialCode: string
  format?: string
}

const countries: Country[] = [
  { code: "CO", name: "Colombia", flag: "🇨🇴", dialCode: "+57", format: "### ### ####" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", dialCode: "+1", format: "(###) ###-####" },
  { code: "MX", name: "México", flag: "🇲🇽", dialCode: "+52", format: "## #### ####" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54", format: "## #### ####" },
  { code: "PE", name: "Perú", flag: "🇵🇪", dialCode: "+51", format: "### ### ###" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56", format: "# #### ####" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", dialCode: "+593", format: "## ### ####" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", dialCode: "+58", format: "### ### ####" },
  { code: "ES", name: "España", flag: "🇪🇸", dialCode: "+34", format: "### ### ###" },
]

interface CountryPhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  error?: string
}

export function CountryPhoneInput({
  value,
  onChange,
  placeholder = "Número de teléfono",
  className,
  required = false,
  error,
}: CountryPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0])

  const formatPhoneNumber = (phone: string, format?: string) => {
    if (!format) return phone

    const numbers = phone.replace(/\D/g, "")
    let formatted = ""
    let numberIndex = 0

    for (let i = 0; i < format.length && numberIndex < numbers.length; i++) {
      if (format[i] === "#") {
        formatted += numbers[numberIndex]
        numberIndex++
      } else {
        formatted += format[i]
      }
    }

    return formatted
  }

  const handlePhoneChange = (phone: string) => {
    // Solo permitir números y limitar a exactamente 11 dígitos
    const numbers = phone.replace(/[^\d]/g, "")
    const limitedNumbers = numbers.slice(0, 11) // Máximo 11 dígitos
    
    onChange(`${selectedCountry.dialCode} ${limitedNumbers}`)
  }

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode) || countries[0]
    setSelectedCountry(country)

    // Extraer solo los números (sin prefijo) y mantener máximo 11 dígitos
    const phoneNumbers = value.replace(/^\+\d+\s?/, "").replace(/[^\d]/g, "").slice(0, 11)
    onChange(`${country.dialCode} ${phoneNumbers}`)
  }

  const phoneWithoutCode = value.replace(/^\+\d+\s?/, "").replace(/[^\d]/g, "")

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[100px] shrink-0">
            <SelectValue>
              <div className="flex items-center gap-1">
                <span className="text-sm">{selectedCountry.flag}</span>
                <span className="text-xs font-medium">{selectedCountry.dialCode}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span className="text-sm font-medium">{country.dialCode}</span>
                  <span className="text-sm text-muted-foreground">{country.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="tel"
          placeholder={placeholder}
          value={phoneWithoutCode}
          onChange={(e) => handlePhoneChange(e.target.value)}
          required={required}
          className={cn("flex-1 min-w-0", error && "border-destructive")}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
