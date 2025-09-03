"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string, imageId: string) => void
  onImageRemoved?: () => void
  currentImageUrl?: string
  imageType?: "product" | "category" | "store" | "logo"
  entityId?: string
  className?: string
  maxSizeMB?: number
  acceptedFormats?: string[]
}

export function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  currentImageUrl,
  imageType = "general",
  entityId,
  className,
  maxSizeMB = 10,
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setUploadError("")

    // Validaciones
    if (!acceptedFormats.includes(file.type)) {
      setUploadError("Formato de archivo no permitido. Usa JPG, PNG o WebP.")
      return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", imageType)
      if (entityId) formData.append("entityId", entityId)

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        onImageUploaded(data.imageUrl, data.imageId)
      } else {
        setUploadError(data.error || "Error al subir imagen")
      }
    } catch (error) {
      setUploadError("Error de conexión. Intenta nuevamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveImage = async () => {
    if (onImageRemoved) {
      onImageRemoved()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {currentImageUrl ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square">
              <img
                src={currentImageUrl || "/placeholder.svg"}
                alt="Imagen subida"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="bg-destructive/80 hover:bg-destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            isUploading && "pointer-events-none opacity-50",
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {dragActive ? (
                    <Upload className="w-6 h-6 text-primary" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-primary" />
                  )}
                </div>
                <h3 className="font-medium mb-2">{dragActive ? "Suelta la imagen aquí" : "Subir imagen"}</h3>
                <p className="text-sm text-muted-foreground mb-4">Arrastra y suelta o haz clic para seleccionar</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP hasta {maxSizeMB}MB</p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {uploadError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{uploadError}</p>
        </div>
      )}
    </div>
  )
}
