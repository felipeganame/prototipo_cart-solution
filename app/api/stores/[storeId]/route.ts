import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// GET - Obtener tienda específica
export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const store = await executeQuery("SELECT * FROM stores WHERE id = ? AND user_id = ? AND is_active = TRUE", [
      params.storeId,
      decoded.userId,
    ])

    if ((store as any[]).length === 0) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ store: (store as any[])[0] })
  } catch (error) {
    console.error("Error fetching store:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT - Actualizar tienda
export async function PUT(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { name, description, country, state_province, city, postal_code, street_address, phone, whatsapp_number } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "El nombre de la tienda es requerido" }, { status: 400 })
    }

    await executeQuery(
      `UPDATE stores SET name = ?, description = ?, country = ?, state_province = ?, city = ?, postal_code = ?, street_address = ?, phone = ?, whatsapp_number = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND user_id = ?`,
      [name, description, country, state_province, city, postal_code, street_address, phone, whatsapp_number, params.storeId, decoded.userId],
    )

    return NextResponse.json({ success: true, message: "Tienda actualizada exitosamente" })
  } catch (error) {
    console.error("Error updating store:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar tienda
export async function DELETE(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Soft delete - marcar como inactiva
    await executeQuery("UPDATE stores SET is_active = FALSE WHERE id = ? AND user_id = ?", [
      params.storeId,
      decoded.userId,
    ])

    return NextResponse.json({ success: true, message: "Tienda eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting store:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
