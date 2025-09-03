// Configuración y utilidades para Cloudflare Images
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const CLOUDFLARE_IMAGES_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`

export interface CloudflareImageResponse {
  id: string
  filename: string
  uploaded: string
  requireSignedURLs: boolean
  variants: string[]
}

export interface ImageUploadResult {
  success: boolean
  result?: CloudflareImageResponse
  error?: string
}

export async function uploadImageToCloudflare(
  file: File,
  metadata?: Record<string, string>,
): Promise<ImageUploadResult> {
  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      throw new Error("Cloudflare credentials not configured")
    }

    const formData = new FormData()
    formData.append("file", file)

    // Agregar metadata si se proporciona
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(`metadata[${key}]`, value)
      })
    }

    const response = await fetch(CLOUDFLARE_IMAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || "Failed to upload image")
    }

    return {
      success: true,
      result: data.result,
    }
  } catch (error) {
    console.error("Cloudflare upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function deleteImageFromCloudflare(imageId: string): Promise<boolean> {
  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      throw new Error("Cloudflare credentials not configured")
    }

    const response = await fetch(`${CLOUDFLARE_IMAGES_URL}/${imageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Cloudflare delete error:", error)
    return false
  }
}

// Generar URL de imagen con variantes (redimensionamiento automático)
export function getCloudflareImageUrl(imageId: string, variant = "public"): string {
  if (!CLOUDFLARE_ACCOUNT_ID) {
    return "/placeholder.svg?height=400&width=400"
  }
  return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/${variant}`
}

// Variantes predefinidas para diferentes usos
export const IMAGE_VARIANTS = {
  thumbnail: "thumbnail", // 200x200
  medium: "medium", // 400x400
  large: "large", // 800x800
  public: "public", // Original size
} as const

export type ImageVariant = (typeof IMAGE_VARIANTS)[keyof typeof IMAGE_VARIANTS]
