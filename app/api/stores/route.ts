import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

// GET - Obtener todas las tiendas del usuario
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const stores = await executeQuery(
      "SELECT * FROM stores WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC",
      [decoded.userId],
    )

    return NextResponse.json({ stores })
  } catch (error) {
    console.error("Error fetching stores:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nueva tienda
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { name, description, address, phone, whatsapp_number } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "El nombre de la tienda es requerido" }, { status: 400 })
    }

    // Verificar límites del plan
    const userQuery = `
      SELECT u.*, up.max_stores 
      FROM users u 
      LEFT JOIN user_plans up ON u.plan_id = up.id 
      WHERE u.id = ?
    `
    const userResults = (await executeQuery(userQuery, [decoded.userId])) as any[]

    if (userResults.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user = userResults[0]
    const currentStoresCount = (
      (await executeQuery("SELECT COUNT(*) as count FROM stores WHERE user_id = ? AND is_active = TRUE", [
        decoded.userId,
      ])) as any[]
    )[0].count

    if (currentStoresCount >= user.max_stores) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${user.max_stores} tiendas para tu plan` },
        { status: 403 },
      )
    }

    // Generar código QR único
    const qrCode = `store_${decoded.userId}_${Date.now()}`

    const result = await executeQuery(
      `INSERT INTO stores (user_id, name, description, address, phone, whatsapp_number, qr_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [decoded.userId, name, description, address, phone, whatsapp_number, qrCode],
    )

    const storeId = (result as any).insertId

    return NextResponse.json({
      success: true,
      store: {
        id: storeId,
        name,
        description,
        address,
        phone,
        whatsapp_number,
        qr_code: qrCode,
      },
    })
  } catch (error) {
    console.error("Error creating store:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
