import { NextRequest, NextResponse } from "next/server"
import { puedeAccederQR } from "@/lib/subscription-manager"
import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pedi_solutions",
  port: parseInt(process.env.DB_PORT || "3306"),
}

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const storeId = params.storeId
    
    if (!storeId) {
      return NextResponse.json({ error: "Store ID requerido" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)
    
    try {
      // Obtener información de la tienda y el usuario propietario
      const [storeResults] = await connection.execute(
        `SELECT s.*, u.id as user_id, u.estado_suscripcion 
         FROM stores s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.id = ? AND s.is_active = 1`,
        [storeId]
      )
      
      const stores = storeResults as any[]
      
      if (stores.length === 0) {
        return NextResponse.json(
          { error: "Tienda no encontrada o inactiva" }, 
          { status: 404 }
        )
      }
      
      const store = stores[0]
      
      // Verificar si el usuario puede acceder al QR público
      const puedeAcceder = await puedeAccederQR(store.user_id)
      
      if (!puedeAcceder) {
        // Mensaje personalizado para tienda bloqueada
        return NextResponse.json({
          error: "Tienda temporalmente no disponible",
          message: "Esta tienda está temporalmente fuera de servicio. Por favor intenta más tarde.",
          blocked: true
        }, { status: 403 })
      }
      
      // Si puede acceder, devolver información de la tienda
      return NextResponse.json({
        success: true,
        data: {
          id: store.id,
          name: store.name,
          description: store.description,
          address: store.address,
          phone: store.phone,
          whatsapp_number: store.whatsapp_number,
          logo_url: store.logo_url,
          qr_code: store.qr_code,
          is_active: store.is_active
        }
      })
      
    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error("Error en API verificación QR:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}
