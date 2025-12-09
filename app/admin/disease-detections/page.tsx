import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AdminDiseaseDetectionsPage() {
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

  // Fetch all disease detections with user info
  const { data: detections } = await supabase
    .from("fish_disease_detections")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })

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
          <h1 className="text-4xl font-bold text-foreground mb-2">All Disease Detections</h1>
          <p className="text-muted-foreground">Review fish disease analyses from all users</p>
        </div>

        {detections && detections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {detections.map((detection: any) => (
              <Card key={detection.id}>
                <CardHeader>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted mb-4">
                    <Image src={detection.image_url || "/placeholder.svg"} alt="Fish" fill className="object-cover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{detection.disease_name}</CardTitle>
                    <Badge variant="secondary">{(detection.confidence * 100).toFixed(0)}%</Badge>
                  </div>
                  <CardDescription>
                    {detection.profiles?.full_name || "Unknown User"} •{" "}
                    {new Date(detection.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{detection.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Treatment</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{detection.treatment}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground">No disease detections yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
