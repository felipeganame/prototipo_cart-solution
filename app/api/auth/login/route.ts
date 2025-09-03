import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario en la base de datos
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar token JWT
    const token = await generateToken(user)
    console.log("Generated token for user:", user.email, "role:", user.role)

    // Crear respuesta con cookie segura
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company_name: user.company_name,
        first_name: user.first_name,
        last_name: user.last_name,
        plan: user.plan,
      },
      redirectTo: user.role === "admin" ? "/admin-dashboard" : "/user-dashboard",
    })

    // Establecer cookie HTTP-only para el token
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 días
    })

    console.log("Cookie set successfully for user:", user.email)
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
