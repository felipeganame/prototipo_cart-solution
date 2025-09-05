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
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    
    if (!userId) {
      return NextResponse.json({ error: "User ID requerido" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)
    
    try {
      // Verificar si el usuario puede acceder al QR público
      const puedeAcceder = await puedeAccederQR(parseInt(userId))
      
      if (!puedeAcceder) {
        return NextResponse.json({
          error: "Usuario temporalmente no disponible",
          message: "Este usuario está temporalmente fuera de servicio. Por favor intenta más tarde.",
          blocked: true
        }, { status: 403 })
      }

      // Obtener tiendas activas del usuario
      const [storesResults] = await connection.execute(
        `SELECT id, name, description, whatsapp_number, 
                country, state_province, city, postal_code, 
                street_name, street_number, street_address, logo_url
         FROM stores 
         WHERE user_id = ? AND is_active = 1 
         ORDER BY name`,
        [userId]
      )
      
      const stores = storesResults as any[]
      
      return NextResponse.json({
        success: true,
        stores: stores
      })
      
    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error("Error en API tiendas de usuario:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}
