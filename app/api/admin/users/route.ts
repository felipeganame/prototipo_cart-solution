import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// GET - Obtener todos los usuarios para administración
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"

    const offset = (page - 1) * limit

    // Construir query con filtros
    let whereClause = "WHERE u.role = 'user'"
    const queryParams: any[] = []

    if (search) {
      whereClause += " AND (u.email LIKE ? OR u.company_name LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)"
      const searchPattern = `%${search}%`
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    if (status !== "all") {
      if (status === "active") {
        whereClause += " AND u.is_active = TRUE"
      } else if (status === "inactive") {
        whereClause += " AND u.is_active = FALSE"
      } else if (status === "overdue") {
        whereClause += " AND u.payment_status = 'overdue'"
      }
    }

    // Query principal con información completa
    const usersQuery = `
      SELECT 
        u.id,
        u.email,
        u.company_name,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.subscription_start,
        u.subscription_end,
        u.fecha_inicio_suscripcion,
        u.dia_vencimiento,
        u.ultimo_pago,
        u.estado_suscripcion,
        u.fecha_proximo_vencimiento,
        u.dias_gracia_restantes,
        u.last_payment_date,
        u.payment_status,
        u.created_at,
        up.name as plan_name,
        up.price as plan_price,
        COUNT(s.id) as store_count,
        DATEDIFF(COALESCE(u.fecha_proximo_vencimiento, u.subscription_end), CURDATE()) as days_until_expiry
      FROM users u
      LEFT JOIN user_plans up ON u.plan_id = up.id
      LEFT JOIN stores s ON u.id = s.user_id AND s.is_active = TRUE
      ${whereClause}
      GROUP BY u.id
      ORDER BY 
        CASE COALESCE(u.estado_suscripcion, 'Activo')
          WHEN 'Bloqueado Parcial' THEN 1
          WHEN 'En gracia' THEN 2
          WHEN 'En deuda' THEN 3
          WHEN 'Activo' THEN 4
          ELSE 5
        END,
        u.fecha_proximo_vencimiento ASC,
        u.created_at DESC
      LIMIT ? OFFSET ?
    `

    queryParams.push(limit, offset)

    const users = await executeQuery(usersQuery, queryParams)

    // Query para contar total de usuarios
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN user_plans up ON u.plan_id = up.id
      ${whereClause}
    `

    const countResult = (await executeQuery(countQuery, queryParams.slice(0, -2))) as any[]
    const total = countResult[0].total

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
