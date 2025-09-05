import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery, getConnection } from "@/lib/database"

// DELETE - Eliminar categoría con todos sus productos en cascada
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const { categoryId } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verificar que la categoría pertenece al usuario
    const categoryCheck = await executeQuery(
      `SELECT c.*, s.user_id FROM categories c 
       JOIN stores s ON c.store_id = s.id 
       WHERE c.id = ? AND s.user_id = ? AND c.is_active = TRUE`,
      [categoryId, decoded.userId],
    )

    if ((categoryCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    // Iniciar transacción para eliminación en cascada
    const connection = await getConnection()
    
    try {
      await connection.beginTransaction()

      // 1. Eliminar todos los productos de la categoría (soft delete)
      await connection.execute(
        "UPDATE products SET is_active = FALSE WHERE category_id = ?",
        [categoryId]
      )

      // 2. Eliminar la categoría (soft delete)
      await connection.execute(
        "UPDATE categories SET is_active = FALSE WHERE id = ?",
        [categoryId]
      )

      // Confirmar transacción
      await connection.commit()

      return NextResponse.json({ 
        success: true, 
        message: "Categoría y todos sus productos eliminados exitosamente" 
      })

    } catch (error) {
      // Revertir en caso de error
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
``