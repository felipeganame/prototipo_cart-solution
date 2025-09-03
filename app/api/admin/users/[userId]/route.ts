import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// PUT - Actualizar un usuario
export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    console.log('=== Admin user update API called ===')
    const resolvedParams = await params
    const token = request.cookies.get("auth-token")?.value
    console.log('Token found:', token ? 'Yes' : 'No')

    if (!token) {
      console.log('No token provided')
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log('Verifying token...')
    const decoded = await verifyToken(token) as any
    console.log('Token decoded successfully:', decoded ? 'Yes' : 'No')
    console.log('User role from token:', decoded?.role)
    
    if (!decoded || decoded.role !== "admin") {
      console.log("Access denied - role:", decoded?.role, "is not admin")
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    console.log("Admin access granted, proceeding with user update...")

    const body = await request.json()
    const { is_active, payment_status, monthly_payment, mark_as_paid } = body

    // Verificar que el usuario existe y no es admin
    const userCheck = await executeQuery("SELECT id, role FROM users WHERE id = ?", [resolvedParams.userId])

    if ((userCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user = (userCheck as any[])[0]
    if (user.role === "admin") {
      return NextResponse.json({ error: "No se puede modificar un usuario administrador" }, { status: 403 })
    }

    // Si se marca como pagado, crear registro de pago y actualizar fechas
    if (mark_as_paid && monthly_payment) {
      const paymentAmount = parseFloat(monthly_payment)
      const maxStores = Math.floor(paymentAmount / 10)
      
      // Crear registro de pago
      await executeQuery(`
        INSERT INTO payment_records (user_id, amount, payment_date, payment_method, created_by_admin, admin_id, notes)
        VALUES (?, ?, CURDATE(), 'admin', true, ?, 'Pago registrado por administrador')
      `, [resolvedParams.userId, paymentAmount, decoded.user_id])

      // Actualizar usuario con nueva fecha de vencimiento y estado
      await executeQuery(`
        UPDATE users 
        SET 
          monthly_payment = ?,
          max_stores = ?,
          last_payment_date = CURDATE(),
          next_payment_due = DATE_ADD(CURDATE(), INTERVAL 30 DAY),
          payment_status = 'al_dia',
          days_overdue = 0,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [paymentAmount, maxStores, resolvedParams.userId])

      return NextResponse.json({ 
        success: true, 
        message: "Pago registrado exitosamente",
        payment_amount: paymentAmount,
        max_stores: maxStores
      })
    }

    // Actualizar otros campos
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (typeof is_active === "boolean") {
      updateFields.push("is_active = ?")
      updateValues.push(is_active)
    }

    if (payment_status && ["al_dia", "en_deuda", "deshabilitado"].includes(payment_status)) {
      updateFields.push("payment_status = ?")
      updateValues.push(payment_status)
    }

    if (monthly_payment && typeof monthly_payment === "number") {
      const maxStores = Math.floor(monthly_payment / 10)
      updateFields.push("monthly_payment = ?", "max_stores = ?")
      updateValues.push(monthly_payment, maxStores)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(resolvedParams.userId)

    await executeQuery(`UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    return NextResponse.json({ success: true, message: "Usuario actualizado exitosamente" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET - Obtener detalles específicos de un usuario
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    console.log('=== Admin user details API called ===')
    const resolvedParams = await params
    const token = request.cookies.get("auth-token")?.value
    console.log('Token found:', token ? 'Yes' : 'No')

    if (!token) {
      console.log('No token provided')
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log('Verifying token...')
    const decoded = await verifyToken(token) as any
    console.log('Token verification result:', decoded ? 'Valid' : 'Invalid')
    console.log('User role:', decoded?.role)
    
    if (!decoded || decoded.role !== "admin") {
      console.log("Access denied - role:", decoded?.role, "is not admin")
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    console.log("Admin access granted, fetching user details...")

    const userQuery = `
      SELECT 
        u.*,
        COUNT(s.id) as store_count,
        CASE 
          WHEN u.next_payment_due IS NULL THEN 0
          WHEN u.next_payment_due >= CURDATE() THEN DATEDIFF(u.next_payment_due, CURDATE())
          ELSE -DATEDIFF(CURDATE(), u.next_payment_due)
        END as days_until_due
      FROM users u
      LEFT JOIN stores s ON u.id = s.user_id
      WHERE u.id = ? AND u.role = 'user'
      GROUP BY u.id
    `

    const userResult = await executeQuery(userQuery, [resolvedParams.userId])

    if ((userResult as any[]).length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user = (userResult as any[])[0]

    // Obtener tiendas del usuario
    const stores = await executeQuery("SELECT * FROM stores WHERE user_id = ? ORDER BY created_at DESC", [
      resolvedParams.userId,
    ])

    // Obtener historial de pagos
    const payments = await executeQuery(`
      SELECT pr.*, u.first_name as admin_name, u.last_name as admin_lastname
      FROM payment_records pr
      LEFT JOIN users u ON pr.admin_id = u.id
      WHERE pr.user_id = ?
      ORDER BY pr.payment_date DESC
      LIMIT 10
    `, [resolvedParams.userId])

    return NextResponse.json({
      user,
      stores,
      payments,
    })
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
