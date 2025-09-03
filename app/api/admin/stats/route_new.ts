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
        SUM(CASE WHEN payment_status = 'en_deuda' THEN 1 ELSE 0 END) as debt_users,
        SUM(CASE WHEN payment_status = 'deshabilitado' THEN 1 ELSE 0 END) as disabled_users,
        SUM(CASE WHEN payment_status = 'al_dia' THEN 1 ELSE 0 END) as up_to_date_users,
        SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_month
      FROM users 
      WHERE role = 'user'
    `)

    // Ingresos totales y del mes actual
    const revenueStats = await executeQuery(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN payment_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN amount ELSE 0 END), 0) as monthly_revenue,
        COUNT(*) as total_payments,
        COALESCE(SUM(CASE WHEN payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN amount ELSE 0 END), 0) as weekly_revenue
      FROM payment_records
    `)

    // Ingresos proyectados mensuales basados en pagos activos
    const projectedRevenue = await executeQuery(`
      SELECT 
        COALESCE(SUM(monthly_payment), 0) as projected_monthly_revenue,
        COALESCE(AVG(monthly_payment), 0) as average_monthly_payment
      FROM users 
      WHERE role = 'user' AND payment_status = 'al_dia'
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

    // Top 5 usuarios por pago mensual
    const topUsers = await executeQuery(`
      SELECT 
        CONCAT(first_name, ' ', last_name) as name,
        company_name,
        monthly_payment,
        max_stores,
        payment_status
      FROM users 
      WHERE role = 'user' 
      ORDER BY monthly_payment DESC 
      LIMIT 5
    `)

    // Pagos recientes (últimos 10)
    const recentPayments = await executeQuery(`
      SELECT 
        pr.amount,
        pr.payment_date,
        pr.payment_method,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.company_name
      FROM payment_records pr
      JOIN users u ON pr.user_id = u.id
      ORDER BY pr.payment_date DESC
      LIMIT 10
    `)

    return NextResponse.json({
      users: (userStats as any[])[0],
      revenue: (revenueStats as any[])[0],
      projected: (projectedRevenue as any[])[0],
      stores: (storeStats as any[])[0],
      products: (productStats as any[])[0],
      topUsers,
      recentPayments,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
