"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Fish, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    repeatPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [initializingDb, setInitializingDb] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Client-side validation
    if (!formData.fullName.trim()) {
      setError("Please enter your full name")
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.repeatPassword) {
      setError("Passwords do not match. Please check and try again.")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long for security")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if database needs initialization
        if (data.details?.includes("profiles") || data.error?.includes("Database setup")) {
          setInitializingDb(true)
          const initResponse = await fetch("/api/auth/init-db")
          const initData = await initResponse.json()

          if (initResponse.ok) {
            // Retry signup after initializing database
            const retryResponse = await fetch("/api/auth/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
              }),
            })

            const retryData = await retryResponse.json()
            if (retryResponse.ok) {
              router.push("/auth/login?signup=success")
              return
            } else {
              throw new Error(retryData.error || "Failed to create account after database initialization")
            }
          } else {
            throw new Error(initData.error || "Failed to initialize database")
          }
        }

        throw new Error(data.error || "Failed to create account")
      }

      router.push("/auth/login?signup=success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
      setInitializingDb(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/underwater-fish-farm-aquaculture.jpg"
          alt="Aquaculture background"
          className="h-full w-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/95 to-cyan-900/90" />

        {/* Floating particles animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bubble"></div>
          <div className="bubble" style={{ animationDelay: "2s", left: "20%" }}></div>
          <div className="bubble" style={{ animationDelay: "4s", left: "70%" }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 animate-float shadow-lg shadow-cyan-500/50">
              <Fish className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Smart Biofloc System
            </h1>
            <p className="mt-1 text-sm text-slate-400">Advanced Aquaculture Monitoring</p>
          </div>

          <Card className="glass-effect border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
              <p className="mt-2 text-sm text-slate-400">Start monitoring your aquaculture farm today</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-200">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                />
                <p className="text-xs text-slate-500">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat-password" className="text-sm font-medium text-slate-200">
                  Confirm Password
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.repeatPassword}
                  onChange={(e) => setFormData({ ...formData, repeatPassword: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="bg-red-950/50 border-red-900/50 text-red-200 animate-in slide-in-from-top-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {initializingDb && (
                <Alert className="bg-cyan-950/50 border-cyan-900/50 text-cyan-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription className="text-sm">
                    Initializing database... This will only take a moment.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50"
                disabled={isLoading || initializingDb}
              >
                {isLoading || initializingDb ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {initializingDb ? "Setting up database..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-400">Already have an account? </span>
              <Link href="/auth/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign in here
              </Link>
            </div>
          </Card>

          <p className="mt-6 text-center text-xs text-slate-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
