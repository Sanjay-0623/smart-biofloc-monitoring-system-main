// Simple cookie-based authentication for v0 environment
import { cookies } from "next/headers"
import { sql } from "./db"
import bcrypt from "bcryptjs"

export interface User {
  id: number
  email: string
  full_name: string
  role: string
}

const SESSION_COOKIE_NAME = "biofloc_session"
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function createSession(user: User) {
  const sessionToken = btoa(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
      exp: Date.now() + SESSION_DURATION,
    }),
  )

  cookies().set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })

  return sessionToken
}

export async function getSession(): Promise<User | null> {
  try {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(atob(sessionCookie.value))

    // Check if session expired
    if (session.exp < Date.now()) {
      await destroySession()
      return null
    }

    return {
      id: session.id,
      email: session.email,
      full_name: session.name,
      role: session.role,
    }
  } catch (error) {
    console.error("[v0] Session parse error:", error)
    return null
  }
}

export async function destroySession() {
  cookies().delete(SESSION_COOKIE_NAME)
}

export async function validateCredentials(email: string, password: string): Promise<User | null> {
  try {
    const users = await sql`
      SELECT * FROM profiles WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return null
    }

    const user = users[0]

    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role || "user",
    }
  } catch (error) {
    console.error("[v0] Auth validation error:", error)
    return null
  }
}
