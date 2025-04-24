"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    setIsLoggedIn(!!token) // Check if the user is logged in
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("access_token") // Remove the token
    setIsLoggedIn(false)
    router.push("/login") // Redirect to login
  }

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/journal",
      label: "Journal",
      active: pathname === "/journal",
    },
    {
      href: "/chat",
      label: "Chat",
      active: pathname === "/chat",
    },
    {
      href: "/voice",
      label: "Voice",
      active: pathname === "/voice",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">EmoDiary</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-500 hover:underline"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline">
                Login
              </Link>
              <Link href="/register" className="text-sm font-medium hover:underline">
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col space-y-4 mt-8">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                    route.active ? "bg-primary/10 text-primary" : "text-foreground",
                  )}
                >
                  {route.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-500 hover:underline"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium hover:underline">
                    Login
                  </Link>
                  <Link href="/register" className="text-sm font-medium hover:underline">
                    Register
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <Button asChild className="hidden sm:flex">
            <Link href="/journal">Start Your Emotional Journey</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

