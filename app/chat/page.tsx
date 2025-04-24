"use client"

import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"
import AuthGuard from "@/components/auth-guard"

type Message = {
  user?: string
  ai?: string
  timestamp?: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { user: input, timestamp: new Date() };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const aiMessage: Message = { ai: data.response, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-6">Chat with Your AI Companion</h1>

          <Card className="h-[calc(100vh-240px)] flex flex-col">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>Your AI companion is here to listen and support you</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.user ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-3 max-w-[80%] ${message.user ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {message.user ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div
                          className={`rounded-lg p-4 ${
                            message.user ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.user || message.ai}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatTime(message.timestamp!)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <form
                className="flex w-full items-center space-x-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
              >
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1"
                  aria-label="Message input"
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isLoading} aria-label="Send message">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}

