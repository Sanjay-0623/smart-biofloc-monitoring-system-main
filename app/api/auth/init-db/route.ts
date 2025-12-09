import { initializeDatabase } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const success = await initializeDatabase()

    if (success) {
      return NextResponse.json({
        message: "Database initialized successfully! You can now create accounts.",
      })
    } else {
      return NextResponse.json(
        { error: "Failed to initialize database. Check server logs for details." },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Init DB route error:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize database",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
