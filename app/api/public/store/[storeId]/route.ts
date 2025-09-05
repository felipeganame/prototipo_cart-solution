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
      
      // Obtener categorías de la tienda
      const [categoriesResults] = await connection.execute(
        `SELECT id, name, description, icon 
         FROM categories 
         WHERE store_id = ? AND is_active = 1 
         ORDER BY name`,
        [storeId]
      )
      
      const categories = categoriesResults as any[]
      
      // Obtener productos por categoría
      const [productsResults] = await connection.execute(
        `SELECT p.id, p.name, p.description, p.price, p.image_url, p.category_id,
                c.name as category_name
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE c.store_id = ? AND p.is_active = 1 AND c.is_active = 1
         ORDER BY c.name, p.name`,
        [storeId]
      )
      
      const products = productsResults as any[]
      
      // Agrupar productos por categoría
      const productsByCategory: Record<string, any[]> = {}
      
      categories.forEach(category => {
        productsByCategory[category.id] = products.filter(
          product => product.category_id === category.id
        )
      })
      
      // Si puede acceder, devolver información completa de la tienda
      return NextResponse.json({
        success: true,
        data: {
          store: {
            id: store.id,
            name: store.name,
            description: store.description,
            whatsapp_number: store.whatsapp_number,
            country: store.country,
            state_province: store.state_province,
            city: store.city,
            postal_code: store.postal_code,
            street_name: store.street_name,
            street_number: store.street_number,
            street_address: store.street_address,
            logo_url: store.logo_url,
            qr_code: store.qr_code,
            is_active: store.is_active
          },
          categories: categories,
          products: products,
          productsByCategory: productsByCategory
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
