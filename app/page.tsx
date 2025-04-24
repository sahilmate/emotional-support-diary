import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { BookHeart, MessageCircle, Shield, Brain, HeartPulse, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Your Personal AI Companion for Emotional Well-being
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  A safe space to express your thoughts, track your emotions, and receive compassionate guidance on your
                  journey to better mental health.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/journal">Start Your Emotional Journey</Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="relative lg:block">
                <div className="relative h-[350px] w-[350px] mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-50"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      <div className="absolute inset-0 rounded-full bg-primary/10 wave-animation"></div>
                      <div
                        className="absolute inset-4 rounded-full bg-secondary/10 wave-animation"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      <div
                        className="absolute inset-8 rounded-full bg-primary/10 wave-animation"
                        style={{ animationDelay: "1s" }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <HeartPulse className="h-20 w-20 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover how EmoDiary can support your emotional well-being journey
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <BookHeart className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Journal</h3>
                <p className="text-center text-muted-foreground">
                  Express your thoughts and feelings in a private, secure digital journal
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Brain className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Emotion Analysis</h3>
                <p className="text-center text-muted-foreground">
                  Gain insights into your emotional patterns with AI-powered analysis
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <MessageCircle className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">AI Companion</h3>
                <p className="text-center text-muted-foreground">
                  Receive empathetic responses and guidance from your AI companion
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Sparkles className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Voice Interaction</h3>
                <p className="text-center text-muted-foreground">
                  Listen to AI responses with natural text-to-speech technology
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Shield className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Privacy First</h3>
                <p className="text-center text-muted-foreground">
                  Your data is encrypted and protected with the highest privacy standards
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <HeartPulse className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Wellness Resources</h3>
                <p className="text-center text-muted-foreground">
                  Access curated mental health resources and self-care tips
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Begin Your Emotional Wellness Journey Today
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Take the first step towards better emotional health with EmoDiary
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link href="/journal">Start Your Emotional Journey</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Your privacy is our priority. All data is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 md:py-8 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © 2025 EmoDiary. All rights reserved.
            </p>
            <nav className="flex gap-4 sm:gap-6">
              <Link className="text-sm font-medium hover:underline" href="#">
                Terms of Service
              </Link>
              <Link className="text-sm font-medium hover:underline" href="#">
                Privacy Policy
              </Link>
              <Link className="text-sm font-medium hover:underline" href="#">
                Mental Health Resources
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}