"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, FileImage, TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"
import NavWrapper from "@/components/nav-wrapper"

interface User {
  id: number
  email: string
  name: string
  role: string
}

export default function UserDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [diseaseCount, setDiseaseCount] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        // Check session
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

        setUser(sessionData.user)

        // Fetch disease detection count
        // For now, set to 0 as we don't have the API endpoint yet
        setDiseaseCount(0)
      } catch (error) {
        console.error("[v0] Dashboard load error:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <NavWrapper />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, {user.name || "User"}!</h1>
            <p className="text-muted-foreground">Manage your detections and view your analysis history</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card className="glass-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fish Disease Scans</CardTitle>
                <FileImage className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{diseaseCount}</div>
                <p className="text-xs text-muted-foreground">Total analyses performed</p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Biofloc Monitoring</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">Real-time water quality tracking</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Fish Disease Detection</CardTitle>
                <CardDescription>Upload fish images for AI-powered disease analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/disease-detection">
                    <FileImage className="mr-2 h-4 w-4" />
                    Start Detection
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Biofloc Monitoring</CardTitle>
                <CardDescription>Monitor water quality and predict system health</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    <Activity className="mr-2 h-4 w-4" />
                    View Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Recent Disease Detections</CardTitle>
              <CardDescription>Your latest fish health analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No detections yet. Start by uploading a fish image!
              </p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/disease-detection">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
