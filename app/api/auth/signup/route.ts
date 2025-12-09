import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    console.log("[v0] Signup attempt for email:", email)

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "All fields are required. Please fill in your full name, email, and password." },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 })
    }

    try {
      // Check if user already exists
      console.log("[v0] Checking if user exists...")
      const existingUsers = await sql`
        SELECT id FROM profiles WHERE email = ${email.toLowerCase().trim()}
      `

      if (existingUsers.length > 0) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please try logging in." },
          { status: 400 },
        )
      }

      // Hash password
      console.log("[v0] Hashing password...")
      const passwordHash = await bcrypt.hash(password, 10)
      const userId = nanoid()

      // Create user
      console.log("[v0] Creating user in database...")
      await sql`
        INSERT INTO profiles (id, email, password_hash, full_name, role, created_at, updated_at)
        VALUES (
          ${userId},
          ${email.toLowerCase().trim()},
          ${passwordHash},
          ${fullName.trim()},
          'user',
          NOW(),
          NOW()
        )
      `

      console.log("[v0] User created successfully!")
      return NextResponse.json({
        success: true,
        message: "Account created successfully! You can now sign in.",
      })
    } catch (dbError: any) {
      console.error("[v0] Database error:", dbError)

      if (dbError.message?.includes('relation "profiles" does not exist')) {
        return NextResponse.json(
          {
            error: "Database setup incomplete. Please run the database initialization scripts first.",
            details: "The profiles table has not been created yet.",
          },
          { status: 500 },
        )
      }

      if (dbError.code === "23505") {
        // Unique violation
        return NextResponse.json(
          { error: "An account with this email already exists. Please try logging in." },
          { status: 400 },
        )
      }

      throw dbError // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json(
      {
        error: "We encountered an error while creating your account. Please try again later.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
