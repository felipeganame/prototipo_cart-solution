import { NextRequest, NextResponse } from "next/server"
import { SubscriptionManager } from "@/lib/subscription-manager"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("API estado suscripción llamada")
    
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    // Verificar autenticación
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Si no se especifica userId, usar el del token
    const targetUserId = userId ? parseInt(userId) : decoded.userId

    // Solo admin o el mismo usuario puede ver el estado
    if (decoded.role !== 'admin' && decoded.userId !== targetUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (typeof targetUserId !== 'number' || isNaN(targetUserId)) {
      return NextResponse.json({ error: "userId inválido" }, { status: 400 })
    }

    const estadoSuscripcion = await SubscriptionManager.obtenerEstadoSuscripcion(targetUserId)
    
    return NextResponse.json({ 
      success: true, 
      data: estadoSuscripcion 
    })

  } catch (error) {
    console.error("Error obteniendo estado de suscripción:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("API actualizar estados suscripción llamada")
    
    // Verificar autenticación (solo admin puede actualizar estados)
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    await SubscriptionManager.actualizarEstadosSuscripcion()
    
    return NextResponse.json({ 
      success: true, 
      message: "Estados de suscripción actualizados" 
    })

  } catch (error) {
    console.error("Error actualizando estados de suscripción:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}
