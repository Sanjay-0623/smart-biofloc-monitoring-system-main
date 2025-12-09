import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, Activity } from "lucide-react"
import AnalyticsCharts from "@/components/analytics-charts"

export default async function AdminAnalyticsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/user/dashboard")
  }

  // Fetch comprehensive statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalDiseaseDetections } = await supabase
    .from("fish_disease_detections")
    .select("*", { count: "exact", head: true })

  // Fetch disease distribution
  const { data: diseaseData } = await supabase.from("fish_disease_detections").select("disease_name")

  const diseaseDistribution = diseaseData?.reduce((acc: any, curr) => {
    acc[curr.disease_name] = (acc[curr.disease_name] || 0) + 1
    return acc
  }, {})

  // Fetch recent activity timeline (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentDiseases } = await supabase
    .from("fish_disease_detections")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString())

  // Group by day
  const activityByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split("T")[0]

    const diseaseCount = recentDiseases?.filter((d) => d.created_at.startsWith(dateStr)).length || 0

    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      diseases: diseaseCount,
      total: diseaseCount,
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground">Comprehensive platform statistics and trends</p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disease Scans</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDiseaseDetections || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDiseaseDetections || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <AnalyticsCharts activityByDay={activityByDay} diseaseDistribution={diseaseDistribution || {}} />
      </div>
    </div>
  )
}
