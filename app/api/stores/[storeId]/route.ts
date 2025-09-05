import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery, getConnection } from "@/lib/database"

// GET - Obtener tienda específica
export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const store = await executeQuery(`
      SELECT id, name, description, whatsapp_number, 
             created_at, updated_at, country, state_province, city, postal_code, 
             street_name, street_number, street_address as address 
      FROM stores 
      WHERE id = ? AND user_id = ? AND is_active = TRUE
    `, [
      storeId,
      decoded.userId,
    ])

    if ((store as any[]).length === 0) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ store: (store as any[])[0] })
  } catch (error) {
    console.error("Error fetching store:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT - Actualizar tienda
export async function PUT(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { name, description, country, state_province, city, postal_code, street_address, whatsapp_number } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "El nombre de la tienda es requerido" }, { status: 400 })
    }

    await executeQuery(
      `UPDATE stores SET name = ?, description = ?, country = ?, state_province = ?, city = ?, postal_code = ?, street_address = ?, whatsapp_number = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND user_id = ?`,
      [name, description, country, state_province, city, postal_code, street_address, whatsapp_number, storeId, decoded.userId],
    )

    return NextResponse.json({ success: true, message: "Tienda actualizada exitosamente" })
  } catch (error) {
    console.error("Error updating store:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH - Actualizar tienda (método alternativo para edición parcial)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params
    console.log("PATCH request received for store:", storeId)
    
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    console.log("Token verification successful:", decoded)

    const body = await request.json()
    console.log("Request body:", body)

    // Verify store belongs to user
    const storeCheck = await executeQuery(
      "SELECT id FROM stores WHERE id = ? AND user_id = ?",
      [storeId, decoded.userId]
    )

    if (!storeCheck || (storeCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
    }

    // Build update query dynamically based on provided fields
    const updateFields = []
    const updateValues = []

    if (body.name) {
      updateFields.push("name = ?")
      updateValues.push(body.name)
    }
    if (body.description !== undefined) {
      updateFields.push("description = ?")
      updateValues.push(body.description)
    }
    if (body.whatsapp_number !== undefined) {
      updateFields.push("whatsapp_number = ?")
      updateValues.push(body.whatsapp_number)
    }
    if (body.country !== undefined) {
      updateFields.push("country = ?")
      updateValues.push(body.country)
    }
    if (body.state !== undefined) {
      updateFields.push("state_province = ?")
      updateValues.push(body.state)
    }
    if (body.state_province !== undefined) {
      updateFields.push("state_province = ?")
      updateValues.push(body.state_province)
    }
    if (body.city !== undefined) {
      updateFields.push("city = ?")
      updateValues.push(body.city)
    }
    if (body.postal_code !== undefined) {
      updateFields.push("postal_code = ?")
      updateValues.push(body.postal_code)
    }
    if (body.street_name !== undefined) {
      updateFields.push("street_name = ?")
      updateValues.push(body.street_name)
    }
    if (body.street_number !== undefined) {
      updateFields.push("street_number = ?")
      updateValues.push(body.street_number)
    }
    if (body.address !== undefined) {
      updateFields.push("street_address = ?")
      updateValues.push(body.address)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    // Always update the updated_at timestamp
    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    
    // Add storeId for WHERE clause
    updateValues.push(storeId)

    const updateQuery = `UPDATE stores SET ${updateFields.join(", ")} WHERE id = ?`
    
    console.log("Update query:", updateQuery)
    console.log("Update values:", updateValues)

    await executeQuery(updateQuery, updateValues)

    // Get updated store data
    const updatedStore = await executeQuery(
      `SELECT id, name, description, whatsapp_number, 
              created_at, updated_at, country, state_province, city, postal_code, 
              street_name, street_number, street_address as address 
       FROM stores WHERE id = ?`,
      [storeId]
    )

    return NextResponse.json({
      message: "Tienda actualizada exitosamente",
      store: (updatedStore as any[])[0]
    })

  } catch (error) {
    console.error("Error updating store:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar tienda con todas sus categorías y productos en cascada
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    console.log('=== DELETE Store API called v2 ===')
    const { storeId } = await params
    console.log('Store ID:', storeId)
    
    const token = request.cookies.get("auth-token")?.value
    console.log('Token found:', !!token)

    if (!token) {
      console.log('No token provided')
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) as any
    console.log('Token decoded:', !!decoded)
    
    if (!decoded) {
      console.log('Invalid token')
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    console.log('User ID from token:', decoded.userId)

    // Verificar que la tienda pertenece al usuario
    console.log('Checking store ownership...')
    const storeCheck = await executeQuery(
      "SELECT id FROM stores WHERE id = ? AND user_id = ? AND is_active = TRUE",
      [storeId, decoded.userId]
    )

    console.log('Store check result:', storeCheck)

    if ((storeCheck as any[]).length === 0) {
      console.log('Store not found or not owned by user')
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
    }

    console.log('Starting cascade deletion...')

    // Usar conexión directa para manejar transacciones
    const connection = await getConnection()
    
    try {
      // Iniciar transacción
      await connection.beginTransaction()
      console.log('Transaction started')

      // 1. Eliminar todos los productos de todas las categorías de la tienda
      console.log('Deleting products...')
      const [productResult] = await connection.execute(
        `UPDATE products p 
         JOIN categories c ON p.category_id = c.id 
         SET p.is_active = FALSE 
         WHERE c.store_id = ?`,
        [storeId]
      )
      console.log('Products deleted:', (productResult as any).affectedRows)

      // 2. Eliminar todas las categorías de la tienda
      console.log('Deleting categories...')
      const [categoryResult] = await connection.execute(
        "UPDATE categories SET is_active = FALSE WHERE store_id = ?",
        [storeId]
      )
      console.log('Categories deleted:', (categoryResult as any).affectedRows)

      // 3. Eliminar la tienda
      console.log('Deleting store...')
      const [storeResult] = await connection.execute(
        "UPDATE stores SET is_active = FALSE WHERE id = ? AND user_id = ?",
        [storeId, decoded.userId]
      )
      console.log('Store deleted:', (storeResult as any).affectedRows)

      // Confirmar transacción
      await connection.commit()
      console.log('Transaction committed successfully')

      return NextResponse.json({ 
        success: true, 
        message: "Tienda, categorías y productos eliminados exitosamente" 
      })

    } catch (error) {
      // Revertir en caso de error
      console.error('Error in cascade deletion, rolling back:', error)
      await connection.rollback()
      throw error
    } finally {
      // Liberar la conexión
      connection.release()
    }

  } catch (error) {
    console.error("Error deleting store:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
