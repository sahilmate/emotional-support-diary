"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Mic, Send, RefreshCw, Bot } from "lucide-react"
import AuthGuard from "@/components/auth-guard"; // Import the AuthGuard component

export default function VoicePage() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([50])
  const [isMuted, setIsMuted] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) return

    setIsGenerating(true)

    // Simulate API call
    setTimeout(() => {
      setResponse(
        "I hear you. It sounds like you're going through a challenging time. Remember that it's okay to feel this way, and your emotions are valid. Would you like to explore some coping strategies that might help you navigate these feelings?",
      )
      setIsGenerating(false)
    }, 2000)
  }

  const handleGenerateSpeech = async () => {
    const response = await fetch("http://127.0.0.1:8000/voice/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const data = await response.json();
    const audio = new Audio(data.audio_file);
    audio.play();
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <AuthGuard> {/* Wrap the entire page with AuthGuard */}
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-6">Voice Interaction</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Message</CardTitle>
                <CardDescription>Type or speak your message to get an audio response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="How are you feeling today?"
                    className="min-h-[150px] resize-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <div className="flex justify-center">
                    <Button variant="outline" size="lg" className="rounded-full w-16 h-16">
                      <Mic className="h-6 w-6" />
                      <span className="sr-only">Record voice</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleSubmit} disabled={!input.trim() || isGenerating}>
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Get Response
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Response</CardTitle>
                <CardDescription>Listen to your AI companion's response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="min-h-[150px] rounded-md border p-4 bg-muted/50">
                    {response ? (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <p className="text-sm">{response}</p>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">
                          {isGenerating ? "Generating response..." : "Your AI response will appear here"}
                        </p>
                      </div>
                    )}
                  </div>

                  {response && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-12 w-12"
                          onClick={togglePlayback}
                          disabled={!response}
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8">
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Slider
                          value={volume}
                          max={100}
                          step={1}
                          className="flex-1"
                          onValueChange={(value) => {
                            setVolume(value)
                            if (value[0] === 0) {
                              setIsMuted(true)
                            } else if (isMuted) {
                              setIsMuted(false)
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" disabled={!response}>
                  Download Audio
                </Button>
                <Button variant="outline" disabled={!response}>
                  Save Response
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Customize your AI companion's voice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice Style</label>
                  <label htmlFor="voice-style" className="text-sm font-medium">Voice Style</label>
                  <select id="voice-style" className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="calm">Calm</option>
                    <option value="friendly">Friendly</option>
                    <option value="supportive">Supportive</option>
                    <option value="gentle">Gentle</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Speaking Rate</label>
                  <Slider defaultValue={[1]} max={2} min={0.5} step={0.1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slower</span>
                    <span>Normal</span>
                    <span>Faster</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}

