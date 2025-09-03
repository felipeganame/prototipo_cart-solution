"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { getCloudflareImageUrl, type ImageVariant } from "@/lib/cloudflare-images"

interface OptimizedImageProps {
  imageId?: string
  alt: string
  variant?: ImageVariant
  className?: string
  fallbackSrc?: string
  width?: number
  height?: number
}

export function OptimizedImage({
  imageId,
  alt,
  variant = "public",
  className,
  fallbackSrc = "/placeholder.svg?height=400&width=400",
  width,
  height,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const imageSrc = imageId && !imageError ? getCloudflareImageUrl(imageId, variant) : fallbackSrc

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      )}
      <img
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={cn("w-full h-full object-cover transition-opacity", isLoading ? "opacity-0" : "opacity-100")}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}
