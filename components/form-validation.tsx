"use client"

import { useState } from "react"

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

export interface ValidationErrors {
  [key: string]: string
}

export function useFormValidation(initialValues: Record<string, string>) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (name: string, value: string, rules: ValidationRule): string | null => {
    if (rules.required && !value.trim()) {
      return "Este campo es obligatorio"
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      return `Debe tener al menos ${rules.minLength} caracteres`
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      return `No puede tener más de ${rules.maxLength} caracteres`
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      switch (name) {
        case "email":
          return "Ingresa un email válido"
        case "phone":
          return "Ingresa un número de teléfono válido"
        case "whatsapp_number":
          return "Ingresa un número de WhatsApp válido (ej: +54 93510000000)"
        case "password":
          return "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
        default:
          return "Formato inválido"
      }
    }

    if (value && rules.custom) {
      return rules.custom(value)
    }

    return null
  }

  const setValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const setFieldTouched = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const validateForm = (validationRules: Record<string, ValidationRule>): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName] || "", validationRules[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const validateSingleField = (name: string, rules: ValidationRule) => {
    const error = validateField(name, values[name] || "", rules)
    setErrors((prev) => ({ ...prev, [name]: error || "" }))
    return !error
  }

  const resetForm = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateForm,
    validateSingleField,
    resetForm,
  }
}

// Patrones de validación comunes
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+\d{1,4}\s[\d\s\-()]{7,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  businessName: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
  fullName: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
  productName: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-.]{2,100}$/,
  categoryName: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,30}$/,
  price: /^\d+(\.\d{1,2})?$/,
}

export const validateForm = {
  email: (email: string): boolean => {
    return validationPatterns.email.test(email)
  },

  phone: (phone: string): boolean => {
    return validationPatterns.phone.test(phone)
  },

  password: (password: string): boolean => {
    return validationPatterns.password.test(password)
  },

  businessName: (name: string): boolean => {
    return name.trim().length >= 2 && validationPatterns.businessName.test(name)
  },

  fullName: (name: string): boolean => {
    return name.trim().length >= 2 && validationPatterns.fullName.test(name)
  },

  productName: (name: string): boolean => {
    return name.trim().length >= 2 && validationPatterns.productName.test(name)
  },

  categoryName: (name: string): boolean => {
    return name.trim().length >= 2 && validationPatterns.categoryName.test(name)
  },

  price: (price: string): boolean => {
    if (!price.trim()) return false
    const numPrice = Number.parseFloat(price)
    return validationPatterns.price.test(price) && numPrice > 0 && numPrice <= 999999
  },
}
