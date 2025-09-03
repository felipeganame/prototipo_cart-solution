"use client"

import { useEffect, useRef } from "react"

interface GoogleRecaptchaProps {
  onVerify: (token: string | null) => void
  onExpired?: () => void
  onError?: () => void
  theme?: "light" | "dark"
  size?: "normal" | "compact"
  siteKey?: string
}

declare global {
  interface Window {
    grecaptcha: any
    onRecaptchaLoad: () => void
  }
}

export default function GoogleRecaptcha({
  onVerify,
  onExpired,
  onError,
  theme = "light",
  size = "normal",
  siteKey,
}: GoogleRecaptchaProps) {
  const recaptchaRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<number | null>(null)

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && recaptchaRef.current && siteKey) {
        widgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          "expired-callback": onExpired,
          "error-callback": onError,
          theme,
          size,
        })
      }
    }

    if (window.grecaptcha) {
      loadRecaptcha()
    } else {
      window.onRecaptchaLoad = loadRecaptcha

      // Load reCAPTCHA script
      const script = document.createElement("script")
      script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit"
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    return () => {
      if (widgetId.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetId.current)
      }
    }
  }, [onVerify, onExpired, onError, theme, size, siteKey])

  if (!siteKey) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center text-sm text-gray-600">
        reCAPTCHA no configurado. Agrega tu Site Key para habilitar la verificación.
      </div>
    )
  }

  return <div ref={recaptchaRef} className="flex justify-center" />
}
