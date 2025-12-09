"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, FileImage, LayoutDashboard } from "lucide-react"
import LogoutButton from "./logout-button"
import ThemeToggle from "./theme-toggle"

export default function UserNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard", label: "Biofloc Monitor", icon: Home },
    { href: "/disease-detection", label: "Disease Detection", icon: FileImage },
  ]

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/user/dashboard" className="font-bold text-xl">
              Smart Biofloc
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button key={item.href} asChild variant={pathname === item.href ? "default" : "ghost"} size="sm">
                    <Link href={item.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
