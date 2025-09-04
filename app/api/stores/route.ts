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
    if (!decoded || !decoded.userId) {
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

    const decoded = await verifyToken(token) as any
    console.log("Decoded token:", decoded)
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Token inválido o userId no encontrado" }, { status: 401 })
    }

    const { name, description, country, state_province, city, postal_code, street_name, street_number, phone, whatsapp_number } = await request.json()

    console.log("Creating store with data:", { name, description, country, state_province, city, postal_code, street_name, street_number, phone, whatsapp_number })

    if (!name) {
      return NextResponse.json({ error: "El nombre de la tienda es requerido" }, { status: 400 })
    }

    if (!country || !state_province || !city || !street_name || !street_number) {
      return NextResponse.json({ error: "País, estado/provincia, ciudad, nombre de calle y número son requeridos" }, { status: 400 })
    }

    // Normalizar valores undefined a null para MySQL
    const normalizedData = {
      name: name || null,
      description: description || null,
      country: country || null,
      state_province: state_province || null,
      city: city || null,
      postal_code: postal_code || null,
      street_name: street_name || null,
      street_number: street_number || null,
      phone: phone || null,
      whatsapp_number: whatsapp_number || null
    }

    console.log("Normalized data:", normalizedData)

    // Verificar límites del plan - usar max_stores de la tabla users directamente
    const userQuery = `
      SELECT max_stores 
      FROM users 
      WHERE id = ?
    `
    const userResults = (await executeQuery(userQuery, [decoded.userId])) as any[]

    if (userResults.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user = userResults[0]
    console.log("User max_stores:", user.max_stores)
    
    const currentStoresCount = (
      (await executeQuery("SELECT COUNT(*) as count FROM stores WHERE user_id = ? AND is_active = TRUE", [
        decoded.userId,
      ])) as any[]
    )[0].count

    console.log("Current stores count:", currentStoresCount)

    if (currentStoresCount >= user.max_stores) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${user.max_stores} tiendas para tu plan` },
        { status: 403 },
      )
    }

    // Generar código QR único
    const qrCode = `store_${decoded.userId}_${Date.now()}`

    console.log("Creating store with QR code:", qrCode)

    // Log de parámetros antes de la consulta SQL
    const sqlParams = [
      decoded.userId, 
      normalizedData.name, 
      normalizedData.description, 
      normalizedData.country, 
      normalizedData.state_province, 
      normalizedData.city, 
      normalizedData.postal_code, 
      normalizedData.street_name, 
      normalizedData.street_number, 
      normalizedData.phone, 
      normalizedData.whatsapp_number, 
      qrCode
    ]
    
    console.log("SQL Parameters:", sqlParams)
    console.log("SQL Parameters types:", sqlParams.map(p => typeof p))

    const result = await executeQuery(
      `INSERT INTO stores (user_id, name, description, country, state_province, city, postal_code, street_name, street_number, phone, whatsapp_number, qr_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      sqlParams,
    )

    const storeId = (result as any).insertId
    console.log("Store created with ID:", storeId)

    return NextResponse.json({
      success: true,
      store: {
        id: storeId,
        name: normalizedData.name,
        description: normalizedData.description,
        country: normalizedData.country,
        state_province: normalizedData.state_province,
        city: normalizedData.city,
        postal_code: normalizedData.postal_code,
        street_name: normalizedData.street_name,
        street_number: normalizedData.street_number,
        phone: normalizedData.phone,
        whatsapp_number: normalizedData.whatsapp_number,
        qr_code: qrCode,
      },
    })
  } catch (error) {
    console.error("Error creating store:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
