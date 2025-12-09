import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-simple"

export async function GET() {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Session fetch error:", error)
    return NextResponse.json({ user: null })
  }
}
