import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { businessName, ownerName, email, phone, password, countryCode } = await request.json()

    if (!businessName || !ownerName || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const existingUser = await executeQuery("SELECT id FROM users WHERE email = ?", [email])

    if ((existingUser as any[]).length > 0) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 })
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(password)

    // Insertar nuevo usuario con plan básico por defecto
    const result = await executeQuery(
      `INSERT INTO users (email, password_hash, role, plan_id, company_name, first_name, last_name, phone, country_code, subscription_start, subscription_end, payment_status) 
       VALUES (?, ?, 'user', 1, ?, ?, '', ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'pending')`,
      [email, passwordHash, businessName, ownerName, phone, countryCode],
    )

    const userId = (result as any).insertId

    // Crear tienda inicial
    const storeQrCode = `store_${userId}_${Date.now()}`
    await executeQuery(`INSERT INTO stores (user_id, name, whatsapp_number, qr_code) VALUES (?, ?, ?, ?)`, [
      userId,
      businessName,
      phone,
      storeQrCode,
    ])

    return NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente",
      userId: userId,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
