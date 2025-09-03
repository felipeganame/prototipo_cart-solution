import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Test API called")
    const token = request.cookies.get("auth-token")?.value
    
    console.log("Token found:", token ? `Yes (${token.substring(0, 20)}...)` : "No")
    
    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    console.log("Decoded in test API:", decoded)
    
    return NextResponse.json({ 
      success: true, 
      decoded: decoded,
      tokenLength: token.length
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
