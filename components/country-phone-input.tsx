"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface Country {
  code: string
  name: string
  flag: string
  dialCode: string
  format?: string
}

const countries: Country[] = [
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54" },
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
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filtrar países basado en la búsqueda con debounce optimizado
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries.slice(0, 50) // Mostrar solo los primeros 50 por defecto
    
    const query = searchQuery.toLowerCase().trim()
    const filtered = countries.filter(country => 
      country.name.toLowerCase().includes(query) ||
      country.dialCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    )
    
    return filtered.slice(0, 20) // Limitar a 20 resultados para mejor rendimiento
  }, [searchQuery])

  // Auto-focus en el campo de búsqueda cuando se abre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Manejar teclas para navegación
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery("")
    }
  }, [])

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

  const handlePhoneChange = useCallback((phone: string) => {
    // Solo permitir números y limitar a exactamente 11 dígitos
    const numbers = phone.replace(/[^\d]/g, "")
    const limitedNumbers = numbers.slice(0, 11) // Máximo 11 dígitos
    
    onChange(`${selectedCountry.dialCode} ${limitedNumbers}`)
  }, [selectedCountry.dialCode, onChange])

  const handleCountryChange = useCallback((countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode) || countries[0]
    setSelectedCountry(country)
    setIsOpen(false)
    setSearchQuery("")

    // Extraer solo los números (sin prefijo) y mantener máximo 11 dígitos
    const phoneNumbers = value.replace(/^\+\d+\s?/, "").replace(/[^\d]/g, "").slice(0, 11)
    onChange(`${country.dialCode} ${phoneNumbers}`)
  }, [value, onChange])

  const phoneWithoutCode = value.replace(/^\+\d+\s?/, "").replace(/[^\d]/g, "")

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="relative">
          <Select 
            value={selectedCountry.code} 
            onValueChange={handleCountryChange}
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open)
              if (!open) {
                setSearchQuery("")
              }
            }}
          >
            <SelectTrigger className="w-[120px] shrink-0">
              <SelectValue>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{selectedCountry.flag}</span>
                  <span className="text-xs font-medium">{selectedCountry.dialCode}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-[320px] p-0" onKeyDown={handleKeyDown}>
              <div className="sticky top-0 z-10 bg-background p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Escribe para buscar país..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-8 h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                {searchQuery && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {filteredCountries.length} resultado(s) encontrado(s)
                  </div>
                )}
              </div>
              <div className="max-h-[250px] overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  <>
                    {filteredCountries.map((country) => (
                      <SelectItem 
                        key={country.code} 
                        value={country.code} 
                        className="cursor-pointer focus:bg-accent/50 px-3 py-2"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm font-medium min-w-[60px]">{country.dialCode}</span>
                          <span className="text-sm text-muted-foreground truncate flex-1">{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    {!searchQuery && filteredCountries.length === 50 && (
                      <div className="p-3 text-center text-xs text-muted-foreground border-t bg-muted/30">
                        Escribe para buscar más países...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <div className="text-sm text-muted-foreground">
                      No se encontraron países que coincidan con "{searchQuery}"
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Intenta buscar por nombre del país o código de área
                    </div>
                  </div>
                )}
              </div>
            </SelectContent>
          </Select>
        </div>

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
