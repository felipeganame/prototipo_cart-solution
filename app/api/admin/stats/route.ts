import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// GET - Obtener estadísticas del dashboard admin
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    console.log("Admin stats - decoded token:", decoded)
    if (!decoded || decoded.role !== "admin") {
      console.log("Admin stats - access denied. Role:", decoded?.role)
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Estadísticas de usuarios
    const userStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN payment_status = 'overdue' THEN 1 ELSE 0 END) as overdue_users,
        SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_month
      FROM users 
      WHERE role = 'user'
    `)

    // Estadísticas de tiendas
    const storeStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_stores,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_stores
      FROM stores
    `)

    // Estadísticas de productos
    const productStats = await executeQuery(`
      SELECT COUNT(*) as total_products
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE AND c.is_active = TRUE
    `)

    // Estadísticas de ingresos (simuladas por ahora)
    const revenueStats = await executeQuery(`
      SELECT 
        SUM(CASE WHEN up.price IS NOT NULL THEN up.price ELSE 0 END) as monthly_revenue,
        COUNT(CASE WHEN u.payment_status = 'paid' THEN 1 END) as paying_users
      FROM users u
      LEFT JOIN user_plans up ON u.plan_id = up.id
      WHERE u.role = 'user' AND u.is_active = TRUE
    `)

    // Estadísticas por plan
    const planStats = await executeQuery(`
      SELECT 
        up.name as plan_name,
        COUNT(u.id) as user_count,
        SUM(up.price) as plan_revenue
      FROM user_plans up
      LEFT JOIN users u ON up.id = u.plan_id AND u.role = 'user' AND u.is_active = TRUE
      GROUP BY up.id, up.name
      ORDER BY user_count DESC
    `)

    return NextResponse.json({
      users: (userStats as any[])[0],
      stores: (storeStats as any[])[0],
      products: (productStats as any[])[0],
      revenue: (revenueStats as any[])[0],
      planBreakdown: planStats,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
