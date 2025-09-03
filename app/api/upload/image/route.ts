import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { uploadImageToCloudflare } from "@/lib/cloudflare-images"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const imageType = formData.get("type") as string // 'product', 'category', 'store', 'logo'
    const entityId = formData.get("entityId") as string

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 })
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "El archivo es demasiado grande (máximo 10MB)" }, { status: 400 })
    }

    // Metadata para organizar las imágenes
    const metadata = {
      userId: decoded.userId.toString(),
      type: imageType || "general",
      entityId: entityId || "",
      uploadedAt: new Date().toISOString(),
    }

    const uploadResult = await uploadImageToCloudflare(file, metadata)

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error || "Error al subir imagen" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imageId: uploadResult.result?.id,
      imageUrl: `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_ID}/${uploadResult.result?.id}/public`,
      variants: {
        thumbnail: `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_ID}/${uploadResult.result?.id}/thumbnail`,
        medium: `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_ID}/${uploadResult.result?.id}/medium`,
        large: `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_ID}/${uploadResult.result?.id}/large`,
      },
    })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
