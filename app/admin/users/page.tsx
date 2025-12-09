import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Mail, Calendar } from "lucide-react"

export default async function AdminUsersPage() {
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

  // Fetch all users with their detection counts
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  // Fetch detection counts for each user
  const usersWithStats = await Promise.all(
    (users || []).map(async (userProfile) => {
      const { count: diseaseCount } = await supabase
        .from("fish_disease_detections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userProfile.id)

      return {
        ...userProfile,
        diseaseCount: diseaseCount || 0,
      }
    }),
  )

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
          <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">View and manage all registered users</p>
        </div>

        <div className="grid gap-4">
          {usersWithStats.map((userProfile) => (
            <Card key={userProfile.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {userProfile.full_name || "Unknown User"}
                      <Badge variant={userProfile.role === "admin" ? "default" : "secondary"}>{userProfile.role}</Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {userProfile.email || "No email"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(userProfile.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Disease Detections:</span>
                    <span className="ml-2 font-semibold">{userProfile.diseaseCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Activity:</span>
                    <span className="ml-2 font-semibold">{userProfile.diseaseCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
