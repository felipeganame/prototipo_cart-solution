import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { executeQuery } from "./database"
import type { User } from "./types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const secret = new TextEncoder().encode(JWT_SECRET)

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function generateToken(user: User): Promise<string> {
  console.log("Generating token with JWT_SECRET:", JWT_SECRET ? "SET" : "NOT SET")
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    planId: user.plan_id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
  
  console.log("Generated token length:", token.length)
  return token
}

export async function verifyToken(token: string) {
  try {
    console.log("Verifying token with JWT_SECRET:", JWT_SECRET ? "SET" : "NOT SET")
    const { payload } = await jwtVerify(token, secret)
    console.log("Token verification successful:", payload)
    return payload
  } catch (error) {
    console.log("Token verification failed:", error instanceof Error ? error.message : String(error))
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const query = `
    SELECT u.*, up.name as plan_name, up.price as plan_price, 
           up.max_stores, up.max_products_per_store, up.max_categories_per_store, up.features
    FROM users u
    LEFT JOIN user_plans up ON u.plan_id = up.id
    WHERE u.email = ? AND u.is_active = TRUE
  `

  const results = (await executeQuery(query, [email])) as any[]

  if (results.length === 0) return null

  const user = results[0]
  return {
    ...user,
    plan: user.plan_name
      ? {
          id: user.plan_id,
          name: user.plan_name,
          price: user.plan_price,
          max_stores: user.max_stores,
          max_products_per_store: user.max_products_per_store,
          max_categories_per_store: user.max_categories_per_store,
          features: typeof user.features === 'string' ? JSON.parse(user.features || "{}") : (user.features || {}),
        }
      : undefined,
  }
}
