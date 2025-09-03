import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// PUT - Actualizar estado del usuario (activar/desactivar)
export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { is_active, payment_status } = await request.json()

    // Verificar que el usuario existe y no es admin
    const userCheck = await executeQuery("SELECT id, role FROM users WHERE id = ?", [params.userId])

    if ((userCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user = (userCheck as any[])[0]
    if (user.role === "admin") {
      return NextResponse.json({ error: "No se puede modificar un usuario administrador" }, { status: 403 })
    }

    // Actualizar usuario
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (typeof is_active === "boolean") {
      updateFields.push("is_active = ?")
      updateValues.push(is_active)
    }

    if (payment_status && ["paid", "pending", "overdue"].includes(payment_status)) {
      updateFields.push("payment_status = ?")
      updateValues.push(payment_status)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(params.userId)

    await executeQuery(`UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    return NextResponse.json({ success: true, message: "Usuario actualizado exitosamente" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET - Obtener detalles específicos de un usuario
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const userQuery = `
      SELECT 
        u.*,
        up.name as plan_name,
        up.price as plan_price,
        up.max_stores,
        up.max_products_per_store,
        up.max_categories_per_store
      FROM users u
      LEFT JOIN user_plans up ON u.plan_id = up.id
      WHERE u.id = ? AND u.role = 'user'
    `

    const userResult = await executeQuery(userQuery, [params.userId])

    if ((userResult as any[]).length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user = (userResult as any[])[0]

    // Obtener tiendas del usuario
    const stores = await executeQuery("SELECT * FROM stores WHERE user_id = ? ORDER BY created_at DESC", [
      params.userId,
    ])

    return NextResponse.json({
      user,
      stores,
    })
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
