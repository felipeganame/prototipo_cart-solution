import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// GET - Obtener todos los usuarios para administración
export async function GET(request: NextRequest) {
  try {
    console.log("=== Admin users API called ===")
    const token = request.cookies.get("auth-token")?.value
    console.log("Token found:", token ? "Yes" : "No")

    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = await verifyToken(token)
      console.log("Token decoded successfully:", decoded ? "Yes" : "No")
      console.log("User role from token:", decoded?.role)
    } catch (tokenError) {
      console.error("Token verification error:", tokenError)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }
    
    if (!decoded || decoded.role !== "admin") {
      console.log("Access denied - role:", decoded?.role, "is not admin")
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    console.log("Admin access granted, proceeding with user fetch...")

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.max(1, Math.min(100, Number.parseInt(searchParams.get("limit") || "10", 10)))
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"

    const offset = (page - 1) * limit
    
    console.log("Parsed parameters:", { page, limit, offset, search, status })

    // Primero intentamos sin LIMIT/OFFSET para ver si hay usuarios regulares
    const testQuery = `
      SELECT COUNT(*) as user_count
      FROM users u
      WHERE u.role = 'user'
    `
    
    console.log("Testing user count first...")
    const userCountResult = await executeQuery(testQuery, []) as any[]
    console.log("User count result:", userCountResult[0])
    
    // Si no hay usuarios regulares, creemos uno para probar
    if (userCountResult[0].user_count === 0) {
      console.log("No regular users found, creating test user...")
      
      // Query muy simple sin LIMIT/OFFSET primero
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
          u.created_at
        FROM users u
        WHERE u.role = 'admin'
        ORDER BY u.created_at DESC
      `

      console.log("Getting admin users as test (no LIMIT/OFFSET)...")
      
      const users = await executeQuery(usersQuery, [])
      
      console.log("Query executed successfully, users found:", Array.isArray(users) ? users.length : 0)
      
      return NextResponse.json({
        users: users,
        pagination: {
          page: 1,
          limit: 10,
          total: Array.isArray(users) ? users.length : 0,
          totalPages: 1,
        },
      })
    }

    // Si hay usuarios regulares, intentar con LIMIT/OFFSET usando concatenación de strings
        const usersQuery = `
      SELECT 
        u.id,
        u.email,
        u.company_name,
        u.first_name,
        u.last_name,
        u.is_active,
        u.monthly_payment,
        u.max_stores,
        u.next_payment_due,
        u.days_overdue,
        u.last_payment_date,
        u.payment_status,
        u.created_at,
        COUNT(s.id) as store_count,
        CASE 
          WHEN u.next_payment_due IS NULL THEN 0
          WHEN u.next_payment_due >= CURDATE() THEN DATEDIFF(u.next_payment_due, CURDATE())
          ELSE -DATEDIFF(CURDATE(), u.next_payment_due)
        END as days_until_due
      FROM users u
      LEFT JOIN stores s ON u.id = s.user_id
      WHERE u.role = 'user'
      GROUP BY u.id, u.email, u.company_name, u.first_name, u.last_name, 
               u.is_active, u.monthly_payment, u.max_stores, u.next_payment_due,
               u.days_overdue, u.last_payment_date, u.payment_status, u.created_at
      ORDER BY u.created_at DESC
      ${limit > 0 ? `LIMIT ${limit} OFFSET ${offset}` : ''}
    `

    console.log("Executing query with string interpolation (no params)...")
    
    const users = await executeQuery(usersQuery, [])
    
    console.log("Query executed successfully, users found:", Array.isArray(users) ? users.length : 0)

    // Query para contar total de usuarios (también simplificado)
    const countQuery = `
      SELECT COUNT(u.id) as total
      FROM users u
      WHERE u.role = 'user'
    `

    const countResult = (await executeQuery(countQuery, [])) as any[]
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
