import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Activity, Droplet, Fish, LineChart, Shield, Zap } from "lucide-react"
import NavWrapper from "@/components/nav-wrapper"

export default function Home() {
  return (
    <>
      <NavWrapper />
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-card">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/biofloc-fish-farming-tanks-aerial-view.jpg"
              alt="Biofloc tanks"
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                AI-Powered Aquaculture Monitoring
              </div>

              <h1 className="text-pretty text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                <span className="gradient-text">Smart Biofloc</span>
                <br />
                Monitoring System
              </h1>

              <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
                Advanced water quality monitoring, AI-powered disease detection, and real-time analytics for modern fish
                farming
              </p>

              <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                <Button size="lg" asChild className="group">
                  <Link href="/auth/signup">
                    Get Started
                    <Activity className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Floating Animation */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
            <div className="h-16 w-16 rounded-full bg-primary/20 blur-xl" />
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need for <span className="gradient-text">successful aquaculture</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Comprehensive monitoring and analytics powered by cutting-edge technology
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="group glass-effect p-8 transition-all hover:scale-105 hover:shadow-xl">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Droplet className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Real-Time Monitoring</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track pH, temperature, turbidity, and water level with live sensor data updates
                </p>
              </Card>

              <Card className="group glass-effect p-8 transition-all hover:scale-105 hover:shadow-xl">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
                  <Fish className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">AI Disease Detection</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Detect fish diseases early with advanced AI image analysis and get treatment recommendations
                </p>
              </Card>

              <Card className="group glass-effect p-8 transition-all hover:scale-105 hover:shadow-xl">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <LineChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Data Analytics</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Visualize trends, predict issues, and optimize your biofloc system performance
                </p>
              </Card>

              <Card className="group glass-effect p-8 transition-all hover:scale-105 hover:shadow-xl">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4 transition-colors group-hover:bg-chart-4 group-hover:text-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Smart Alerts</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Receive instant notifications when water parameters exceed safe thresholds
                </p>
              </Card>

              <Card className="group glass-effect p-8 transition-all hover:scale-105 hover:shadow-xl">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5 transition-colors group-hover:bg-chart-5 group-hover:text-primary-foreground">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Historical Data</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Access complete history of sensor readings and disease detections for analysis
                </p>
              </Card>

              <Card className="group glass-effect p-8 transition-all hover:scale-105 hover:shadow-xl">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">ESP32 Integration</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Seamlessly connect your hardware sensors for automated data collection
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Card className="glass-effect overflow-hidden">
              <div className="relative px-6 py-16 sm:px-12 lg:px-16">
                <div className="absolute inset-0 -z-10">
                  <img
                    src="/fish-swimming-in-biofloc-tank.jpg"
                    alt="Fish in tank"
                    className="h-full w-full object-cover opacity-10"
                  />
                </div>

                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start monitoring your farm today</h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Join aquaculture professionals who trust our system for their biofloc operations
                  </p>
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <Button size="lg" asChild className="animate-pulse-glow">
                      <Link href="/auth/signup">Create Free Account</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </>
  )
}
