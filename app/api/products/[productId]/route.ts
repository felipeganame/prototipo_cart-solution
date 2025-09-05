import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// PATCH - Actualizar producto (especialmente precio)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const body = await request.json()

    // Verificar que el producto pertenece al usuario
    const productCheck = await executeQuery(
      `SELECT p.* FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN stores s ON c.store_id = s.id 
       WHERE p.id = ? AND s.user_id = ? AND p.is_active = TRUE`,
      [productId, decoded.userId],
    )

    if ((productCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Construir la query de actualización dinámicamente
    const updateFields = []
    const updateValues = []

    if (body.price !== undefined) {
      if (!body.price || body.price <= 0) {
        return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 })
      }
      updateFields.push("price = ?")
      updateValues.push(body.price)
    }

    if (body.name !== undefined) {
      updateFields.push("name = ?")
      updateValues.push(body.name)
    }

    if (body.description !== undefined) {
      updateFields.push("description = ?")
      updateValues.push(body.description)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    // Siempre actualizar el timestamp
    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(productId)

    const updateQuery = `UPDATE products SET ${updateFields.join(", ")} WHERE id = ?`

    await executeQuery(updateQuery, updateValues)

    // Obtener el producto actualizado
    const updatedProduct = await executeQuery(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    )

    return NextResponse.json({
      message: "Producto actualizado exitosamente",
      product: (updatedProduct as any[])[0]
    })

  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar producto
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verificar que el producto pertenece al usuario
    const productCheck = await executeQuery(
      `SELECT p.* FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN stores s ON c.store_id = s.id 
       WHERE p.id = ? AND s.user_id = ? AND p.is_active = TRUE`,
      [productId, decoded.userId],
    )

    if ((productCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Soft delete - marcar como inactivo
    await executeQuery("UPDATE products SET is_active = FALSE WHERE id = ?", [productId])

    return NextResponse.json({ success: true, message: "Producto eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
