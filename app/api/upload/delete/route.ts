import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { deleteImageFromCloudflare } from "@/lib/cloudflare-images"

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { imageId } = await request.json()

    if (!imageId) {
      return NextResponse.json({ error: "ID de imagen requerido" }, { status: 400 })
    }

    const deleted = await deleteImageFromCloudflare(imageId)

    if (!deleted) {
      return NextResponse.json({ error: "Error al eliminar imagen" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Imagen eliminada exitosamente" })
  } catch (error) {
    console.error("Image delete error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
