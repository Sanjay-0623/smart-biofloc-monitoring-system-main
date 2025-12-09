"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import DiseaseDetectionUpload from "@/components/disease-detection-upload"
import NavWrapper from "@/components/nav-wrapper"

export default function DiseaseDetectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const sessionRes = await fetch("/api/auth/session")
        if (!sessionRes.ok) {
          router.push("/auth/login")
          return
        }

        const sessionData = await sessionRes.json()
        if (!sessionData.user) {
          router.push("/auth/login")
          return
        }

        setUserId(sessionData.user.id)
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <>
      <NavWrapper />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Fish Disease Detection</h1>
            <p className="text-muted-foreground">
              Upload an image of your fish to detect potential diseases using AI-powered analysis
            </p>
          </div>

          <DiseaseDetectionUpload userId={userId} />
        </div>
      </div>
    </>
  )
}
