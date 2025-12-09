import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function DiseaseHistoryPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: detections } = await supabase
    .from("fish_disease_detections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/user/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Fish Disease Detection History</h1>
          <p className="text-muted-foreground">View all your fish health analyses</p>
        </div>

        {detections && detections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {detections.map((detection) => (
              <Card key={detection.id}>
                <CardHeader>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted mb-4">
                    <Image src={detection.image_url || "/placeholder.svg"} alt="Fish" fill className="object-cover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{detection.disease_name}</CardTitle>
                    <Badge variant="secondary">{(detection.confidence * 100).toFixed(0)}%</Badge>
                  </div>
                  <CardDescription>{new Date(detection.created_at).toLocaleString()}</CardDescription>
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
              <p className="text-muted-foreground mb-4">No disease detections yet</p>
              <Button asChild>
                <Link href="/disease-detection">Start Your First Detection</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
