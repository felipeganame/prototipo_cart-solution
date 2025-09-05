import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// GET - Obtener categorías de una tienda específica
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "ID de tienda requerido" }, { status: 400 })
    }

    // Verificar que la tienda pertenece al usuario
    const storeCheck = await executeQuery("SELECT id FROM stores WHERE id = ? AND user_id = ? AND is_active = TRUE", [
      storeId,
      decoded.userId,
    ])

    if ((storeCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
    }

    const categories = await executeQuery(
      "SELECT * FROM categories WHERE store_id = ? AND is_active = TRUE ORDER BY sort_order ASC, name ASC",
      [storeId],
    )

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { storeId, name, description, backgroundImageUrl, backgroundImageId } = await request.json()

    if (!storeId || !name) {
      return NextResponse.json({ error: "ID de tienda y nombre son requeridos" }, { status: 400 })
    }

    // Verificar que la tienda pertenece al usuario
    const storeCheck = await executeQuery("SELECT id FROM stores WHERE id = ? AND user_id = ? AND is_active = TRUE", [
      storeId,
      decoded.userId,
    ])

    if ((storeCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
    }

    // Verificar límites del plan
    const userQuery = `
      SELECT u.*, up.max_categories_per_store 
      FROM users u 
      LEFT JOIN user_plans up ON u.plan_id = up.id 
      WHERE u.id = ?
    `
    const userResults = (await executeQuery(userQuery, [decoded.userId])) as any[]
    const user = userResults[0]

    const currentCategoriesCount = (
      (await executeQuery("SELECT COUNT(*) as count FROM categories WHERE store_id = ? AND is_active = TRUE", [
        storeId,
      ])) as any[]
    )[0].count

    if (currentCategoriesCount >= user.max_categories_per_store) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${user.max_categories_per_store} categorías para tu plan` },
        { status: 403 },
      )
    }

    const result = await executeQuery(
      `INSERT INTO categories (store_id, name, description, background_image_url, sort_order) 
       VALUES (?, ?, ?, ?, ?)`,
      [storeId, name, description, backgroundImageUrl, currentCategoriesCount],
    )

    const categoryId = (result as any).insertId

    return NextResponse.json({
      success: true,
      category: {
        id: categoryId,
        name,
        description,
        background_image_url: backgroundImageUrl,
      },
    })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
