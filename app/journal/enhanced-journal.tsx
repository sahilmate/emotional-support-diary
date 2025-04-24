"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { EmojiPicker } from "@/components/emoji-picker";
import { CalendarIcon, ThumbsUp, Send, Bot, Volume2, VolumeX, Trash2, Edit } from "lucide-react";

export default function EnhancedJournal() {
  const [journalEntry, setJournalEntry] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [mood, setMood] = useState<string | null>(null);
  const [moodEmoji, setMoodEmoji] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]); // State to store drafts
  const [moodData, setMoodData] = useState<any[]>([]); // State to store mood data
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const moodOptions = [
    { emoji: "😊", label: "Happy", value: "happy", color: "text-green-500" },
    { emoji: "😌", label: "Calm", value: "calm", color: "text-blue-400" },
    { emoji: "😐", label: "Neutral", value: "neutral", color: "text-yellow-500" },
    { emoji: "😔", label: "Sad", value: "sad", color: "text-indigo-400" },
    { emoji: "😡", label: "Angry", value: "angry", color: "text-red-500" },
    { emoji: "😰", label: "Anxious", value: "anxious", color: "text-orange-400" },
  ];

  const getToken = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Authorization token is missing");
    }
    return token;
  };
  const fetchMoodData = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/journal/mood-tracker/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch mood data");
      }

      const data = await response.json();
      console.log("Fetched mood data:", data); // Debugging log
      setMoodData(data);
    } catch (error) {
      console.error("Error fetching mood data:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An error occurred while fetching mood data.");
      }
    }
    useEffect(() => {
      fetchMoodData(); // Fetch mood data on component mount
    }, []);
  };
  const fetchDrafts = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/journal/?is_draft=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch drafts");
      }

      const data = await response.json();
      setDrafts(data);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An error occurred while fetching drafts.");
      }
    }
  };



  const handleDeleteDraft = async (draftId: string | null) => {
    if (!draftId) {
      alert("Invalid draft ID");
      return;
    }

    console.log("Deleting draft with ID:", draftId);

    try {
      const token = getToken();
      const response = await fetch(`http://127.0.0.1:8000/api/journal/${draftId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete draft");
      }

      console.log("Draft deleted successfully");
      setDrafts(drafts.filter((draft) => draft.id !== draftId));
    } catch (error) {
      console.error("Error deleting draft:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An error occurred while deleting the draft.");
      }
    }
  };

  const handleSubmit = async (isDraft = false) => {
    if (!journalEntry.trim()) {
      alert("Please write something in your journal entry before submitting.");
      return;
    }
  
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You are not logged in. Please log in to save your journal entry.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const payload = {
        content: journalEntry,
        mood: mood ? { emoji: moodEmoji, label: mood, value: mood } : { emoji: "😐", label: "Neutral", value: "neutral" },
        is_draft: isDraft,
      };
  
      const response = await fetch("http://127.0.0.1:8000/api/journal/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          alert("Unauthorized: Please log in again.");
        }
        throw new Error("Failed to save journal entry");
      }
  
      const data = await response.json();
      setAiResponse("Your journal entry has been saved!");
      setJournalEntry("");
      setMood(null);

      // Remove the draft from the drafts list if it was submitted
      if (isDraft) {
        setDrafts([...drafts, data]);
    }
      if (!isDraft) {
        setDrafts(drafts.filter((draft) => draft.id !== data.id));
      }
    } catch (error) {
      console.error("Error saving journal entry:", error);
      alert("An error occurred while saving your journal entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMoodEmoji(emoji)
    // Focus back on the textarea after selecting an emoji
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const toggleSpeech = () => {
    if (window.speechSynthesis && aiResponse) {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(aiResponse)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsSpeaking(true)
      }
    }
  }

  const fetchEntriesForDate = async (selectedDate: Date) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/journal/?date=${selectedDate.toISOString().split("T")[0]}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch journal entries");
      }
  
      const data = await response.json();
      setHistoryEntries(data);
    } catch (error) {
      console.error(error);
    }
  };

  const analyzeEntry = async () => {
    if (!journalEntry.trim()) {
      alert("Please write something in your journal entry before analyzing.");
      return;
    }

    setIsAnalyzing(true); // Show loading state
    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze-journal/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ content: journalEntry }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze journal entry");
      }

      const data = await response.json();
      setAiResponse(data.analysis); // Update the AI response state
    } catch (error) {
      console.error("Error analyzing journal entry:", error);
      alert("An error occurred while analyzing the journal entry.");
    } finally {
      setIsAnalyzing(false); // Hide loading state
    }
  };
  useEffect(() => {
    fetchDrafts(); // Fetch drafts on component mount
  }, []);

  const handleEditDraft = (draft: any) => {
    setJournalEntry(draft.content);
    setMood(draft.mood?.value || null);
    setMoodEmoji(draft.mood?.emoji || null);
  };

  const getMoodColor = (mood: string): string => {
    switch (mood) {
      case "happy":
        return "bg-green-500";
      case "calm":
        return "bg-blue-400";
      case "neutral":
        return "bg-yellow-500";
      case "sad":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="write">
        <TabsList className="mb-4">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="write">
          <Card>
            <CardHeader>
              <CardTitle>Today's Entry</CardTitle>
              <CardDescription>
                Write about your day, thoughts, or feelings. Your AI companion is here to listen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{date?.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">How are you feeling?</span>
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  {moodEmoji && (
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                      <span className="text-lg" role="img" aria-hidden="true">
                        {moodEmoji}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="How are you feeling today? Share your thoughts, emotions, or experiences..."
                  className="min-h-[250px] resize-none p-4 text-base leading-relaxed focus-visible:ring-primary"
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  aria-label="Journal entry"
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {journalEntry.length} characters
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2 mt-4">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                      mood === option.value
                        ? "bg-primary/10 border-2 border-primary"
                        : "border border-border hover:bg-muted"
                    }`}
                    aria-label={`Select mood: ${option.label}`}
                  >
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {option.emoji}
                    </span>
                    <span className={`text-xs mt-1 ${mood === option.value ? "font-medium" : ""}`}>{option.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                {isSubmitting ? "Saving Draft..." : "Save Draft"}
              </Button>
              <Button onClick={() => handleSubmit(false)} disabled={!journalEntry.trim() || isSubmitting}>
                {isSubmitting ? "Processing..." : "Submit"}
                {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>

          {/* Drafts Section */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Saved Drafts</h2>
            {drafts.length > 0 ? (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <Card key={draft.id || draft.fallbackKey}> {/* Use fallbackKey if id is null */}
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{draft.created_at}</p>
                      <p className="mt-2">{draft.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="ghost" size="sm" onClick={() => handleEditDraft(draft)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDraft(draft.id || draft.fallbackKey)} // Ensure fallbackKey is used if id is null
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No drafts saved yet.</p>
            )}
          </div>

          {aiResponse && (
            <Card className="mt-6 border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </span>
                  AI Response
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="leading-relaxed">{aiResponse}</p>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label={isSpeaking ? "Stop speaking" : "Listen to response"}
                    onClick={toggleSpeech}
                  >
                    {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Helpful
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Journal History</CardTitle>
              <CardDescription>View and reflect on your past entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">Select a date to view your journal entry</p>
                  <div className="h-[200px] flex items-center justify-center border rounded-md">
                    <p className="text-muted-foreground">No entry for selected date</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
