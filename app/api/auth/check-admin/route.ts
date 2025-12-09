import { getSession } from "@/lib/auth-simple"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getSession()

  if (!user) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }

  const isAdmin = user.role === "admin"

  return NextResponse.json({ isAdmin })
}
