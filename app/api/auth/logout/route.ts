import { NextResponse } from "next/server"

export async function POST() {
  console.log("Logout API called")
  const response = NextResponse.json({ success: true, message: "Logout successful" })

  // Eliminar cookie de autenticación con configuraciones consistentes
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  })

  // También intentar eliminar con delete para máxima compatibilidad
  response.cookies.delete("auth-token")

  console.log("Auth cookie cleared")
  return response
}
