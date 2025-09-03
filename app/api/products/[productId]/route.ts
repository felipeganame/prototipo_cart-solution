import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// DELETE - Eliminar producto
export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verificar que el producto pertenece al usuario
    const productCheck = await executeQuery(
      `SELECT p.* FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN stores s ON c.store_id = s.id 
       WHERE p.id = ? AND s.user_id = ? AND p.is_active = TRUE`,
      [params.productId, decoded.userId],
    )

    if ((productCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Soft delete - marcar como inactivo
    await executeQuery("UPDATE products SET is_active = FALSE WHERE id = ?", [params.productId])

    return NextResponse.json({ success: true, message: "Producto eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
