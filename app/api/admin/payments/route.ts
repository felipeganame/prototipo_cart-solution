import { NextRequest, NextResponse } from "next/server"
import { SubscriptionManager } from "@/lib/subscription-manager"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("API registrar pago llamada")
    
    // Verificar autenticación (solo admin puede registrar pagos por ahora)
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      console.log("No token found")
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      console.log("Invalid token or not admin")
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, fechaPago, monto } = body

    // Validar datos de entrada
    if (!userId || !fechaPago || !monto) {
      return NextResponse.json(
        { error: "userId, fechaPago y monto son requeridos" }, 
        { status: 400 }
      )
    }

    // Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!fechaRegex.test(fechaPago)) {
      return NextResponse.json(
        { error: "fechaPago debe tener formato YYYY-MM-DD" }, 
        { status: 400 }
      )
    }

    // Registrar el pago
    await SubscriptionManager.registrarPago(userId, fechaPago, parseFloat(monto))
    
    return NextResponse.json({ 
      success: true, 
      message: "Pago registrado exitosamente" 
    })

  } catch (error) {
    console.error("Error en API registrar pago:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" }, 
        { status: 400 }
      )
    }

    // Verificar autenticación
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Solo admin o el mismo usuario puede ver los pagos
    if (decoded.role !== 'admin' && decoded.userId !== parseInt(userId)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const historialPagos = await SubscriptionManager.obtenerHistorialPagos(parseInt(userId))
    
    return NextResponse.json({ 
      success: true, 
      data: historialPagos 
    })

  } catch (error) {
    console.error("Error obteniendo historial de pagos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}
