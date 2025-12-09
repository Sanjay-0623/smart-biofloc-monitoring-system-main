"use client"

import { useEffect, useState } from "react"
import UserNav from "./user-nav"
import AdminNav from "./admin-nav"

interface User {
  id: number
  email: string
  full_name: string
  role: string
}

export default function NavWrapper() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("[v0] Session check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  if (loading || !user) {
    return null
  }

  return user.role === "admin" ? <AdminNav /> : <UserNav />
}
