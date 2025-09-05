import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// GET - Obtener productos de una categoría específica
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
    const categoryId = searchParams.get("categoryId")
    const storeId = searchParams.get("storeId")

    if (!categoryId || !storeId) {
      return NextResponse.json({ error: "ID de categoría y tienda requeridos" }, { status: 400 })
    }

    // Verificar que la categoría pertenece a una tienda del usuario
    const categoryCheck = await executeQuery(
      `SELECT c.* FROM categories c 
       JOIN stores s ON c.store_id = s.id 
       WHERE c.id = ? AND s.id = ? AND s.user_id = ? AND c.is_active = TRUE AND s.is_active = TRUE`,
      [categoryId, storeId, decoded.userId],
    )

    if ((categoryCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    const products = await executeQuery(
      "SELECT * FROM products WHERE category_id = ? AND is_active = TRUE ORDER BY sort_order ASC, name ASC",
      [categoryId],
    )

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nuevo producto
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

    const { categoryId, storeId, name, description, price, imageUrl, imageId } = await request.json()

    if (!categoryId || !storeId || !name || !price) {
      return NextResponse.json({ error: "Campos requeridos: categoría, tienda, nombre y precio" }, { status: 400 })
    }

    // Verificar que la categoría pertenece a una tienda del usuario
    const categoryCheck = await executeQuery(
      `SELECT c.* FROM categories c 
       JOIN stores s ON c.store_id = s.id 
       WHERE c.id = ? AND s.id = ? AND s.user_id = ? AND c.is_active = TRUE AND s.is_active = TRUE`,
      [categoryId, storeId, decoded.userId],
    )

    if ((categoryCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    // Verificar límites del plan
    const userQuery = `
      SELECT u.*, up.max_products_per_store 
      FROM users u 
      LEFT JOIN user_plans up ON u.plan_id = up.id 
      WHERE u.id = ?
    `
    const userResults = (await executeQuery(userQuery, [decoded.userId])) as any[]
    const user = userResults[0]

    const currentProductsCount = (
      (await executeQuery(
        `SELECT COUNT(*) as count FROM products p 
         JOIN categories c ON p.category_id = c.id 
         WHERE c.store_id = ? AND p.is_active = TRUE`,
        [storeId],
      )) as any[]
    )[0].count

    if (currentProductsCount >= user.max_products_per_store) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${user.max_products_per_store} productos para tu plan` },
        { status: 403 },
      )
    }

    const result = await executeQuery(
      `INSERT INTO products (category_id, name, description, price, image_url, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [categoryId, name, description, price, imageUrl, currentProductsCount],
    )

    const productId = (result as any).insertId

    return NextResponse.json({
      success: true,
      product: {
        id: productId,
        name,
        description,
        price,
        image_url: imageUrl,
      },
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
