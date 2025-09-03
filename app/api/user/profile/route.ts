import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("Profile API called")
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      console.log("No token found in profile API")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("Token found, verifying...")
    const decoded = await verifyToken(token) as any
    console.log("Decoded token:", decoded)
    
    if (!decoded) {
      console.log("Token verification failed in profile API")
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Obtener información completa del usuario con plan
    console.log("Querying user with ID:", decoded.userId)
    const userQuery = `
      SELECT u.*, up.name as plan_name, up.price as plan_price, 
             up.max_stores, up.max_products_per_store, up.max_categories_per_store, up.features
      FROM users u
      LEFT JOIN user_plans up ON u.plan_id = up.id
      WHERE u.id = ? AND u.is_active = TRUE
    `

    const userResults = (await executeQuery(userQuery, [decoded.userId])) as any[]
    console.log("User query results:", userResults)

    if (userResults.length === 0) {
      console.log("No user found with ID:", decoded.userId)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user = userResults[0]

    // Obtener tiendas del usuario
    console.log("Querying stores for user:", decoded.userId)
    const storesQuery = `SELECT * FROM stores WHERE user_id = ? AND is_active = TRUE`
    const stores = await executeQuery(storesQuery, [decoded.userId])
    console.log("Stores query results:", stores)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company_name: user.company_name,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        country_code: user.country_code,
        subscription_start: user.subscription_start,
        subscription_end: user.subscription_end,
        payment_status: user.payment_status,
        plan: user.plan_name ? {
          id: user.plan_id,
          name: user.plan_name,
          price: user.plan_price,
          max_stores: user.max_stores,
          max_products_per_store: user.max_products_per_store,
          max_categories_per_store: user.max_categories_per_store,
          features: typeof user.features === 'string' ? JSON.parse(user.features || "{}") : (user.features || {}),
        } : null,
      },
      stores,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
