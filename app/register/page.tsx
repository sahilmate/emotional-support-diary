"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HeartPulse, User, Mail, Lock, AlertCircle, Loader2, Check } from "lucide-react"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Registration failed")
      }

      // Registration successful, redirect to login
      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicators
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gradient-to-b from-background to-muted/50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <HeartPulse className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
            <p className="text-muted-foreground mt-2">Join us on your emotional wellness journey</p>
          </div>

          <Card className="border-border/40 shadow-lg">
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Enter your details to create your account</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${hasMinLength ? "bg-green-500" : "bg-muted"}`}
                      >
                        {hasMinLength && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={hasMinLength ? "text-green-500" : "text-muted-foreground"}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${hasUpperCase ? "bg-green-500" : "bg-muted"}`}
                      >
                        {hasUpperCase && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={hasUpperCase ? "text-green-500" : "text-muted-foreground"}>
                        At least one uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${hasNumber ? "bg-green-500" : "bg-muted"}`}
                      >
                        {hasNumber && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={hasNumber ? "text-green-500" : "text-muted-foreground"}>
                        At least one number
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoading || !hasMinLength || !hasUpperCase || !hasNumber || password !== confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </main>
    </div>
  )
}

