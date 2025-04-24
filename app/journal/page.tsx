"use client";

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import EnhancedJournal from "./enhanced-journal"
import { Smile, Frown, Meh } from "lucide-react"
import AuthGuard from "@/components/auth-guard";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// Define the type for mood data
type Mood = {
  date?: string; // Optional because some entries use `date`
  created_at?: string; // Add `created_at` as an optional field
  mood: {
    emoji: string;
    label: string;
    value: string;
  };
  is_draft?: boolean; // Optional field for draft entries
};


type MoodData = Mood[];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getMoodColor = (mood: string): string => {
  console.log("Getting color for mood:", mood); // Debugging log
  switch (mood) {
    case "happy":
      return "bg-green-500"; // Green for happy
    case "calm":
      return "bg-blue-400"; // Blue for calm
    case "neutral":
      return "bg-yellow-500"; // Yellow for neutral
    case "sad":
      return "bg-indigo-400"; // Indigo for sad
    case "angry":
      return "bg-red-500"; // Red for angry
    case "anxious":
      return "bg-orange-400"; // Orange for anxious
    default:
      return "bg-muted"; // Default muted color for undefined or unexpected values
  }
};

const getCurrentWeekDates = () => {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

  console.log("Start of Week:", startOfWeek);
  console.log("End of Week:", endOfWeek);

  return { startOfWeek, endOfWeek };
};

const isDateInCurrentWeek = (date: string) => {
  const { startOfWeek, endOfWeek } = getCurrentWeekDates();
  const parsedDate = new Date(date);

  console.log("Checking date:", parsedDate, "Start:", startOfWeek, "End:", endOfWeek);

  return parsedDate >= startOfWeek && parsedDate <= endOfWeek;
};

const extractDate = (isoDate: string | null | undefined) => {
  if (!isoDate) {
    console.warn("Invalid date value:", isoDate);
    return null; // Return null for invalid dates
  }
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    console.warn("Invalid date format:", isoDate);
    return null; // Return null for invalid date formats
  }
  return date.toISOString().split('T')[0]; // Extract only the date part
};

export default function JournalPage() {
  const [prompts, setPrompts] = useState([
    { question: "What made you smile today?", answer: "" },
    { question: "What's one thing you're grateful for right now?", answer: "" },
    { question: "How did you practice self-care today?", answer: "" },
    { question: "What's something you're looking forward to?", answer: "" },
  ]);

  const handlePromptAnswerChange = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index].answer = value;
    setPrompts(newPrompts);
  };

  const saveReflectionAnswers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/journal/reflection-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(prompts),
      });
      if (response.ok) {
        alert("Reflection answers saved successfully!");
      } else {
        alert("Failed to save reflection answers.");
      }
    } catch (error) {
      console.error("Error saving reflection answers:", error);
      alert("An error occurred while saving reflection answers.");
    }
  };

  const [moodData, setMoodData] = useState<MoodData>([]); // Use the defined type for mood data

  // Fetch mood data when the page loads
  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/journal/mood-tracker/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch mood data");
        }

        const data = await response.json();
        setMoodData(data); // Update the mood data state
      } catch (error) {
        console.error(error);
      }
    };

    fetchMoodData();
  }, []);

  const filteredMoodData = moodData?.filter((mood: Mood) => {
    // Use `created_at` or fallback to `date`
    const moodDate = mood.created_at
      ? extractDate(mood.created_at)
      : mood.date;

    // Skip entries with invalid dates
    if (!moodDate) return false;

    // Exclude drafts
    if (mood.is_draft) return false;

    // Check if the date is in the current week
    const isInWeek = isDateInCurrentWeek(moodDate);
    console.log("Mood date:", moodDate, "Is in current week:", isInWeek);
    return isInWeek;
  });

  console.log("Filtered Mood Data:", filteredMoodData);

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-6">Your Journal</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <EnhancedJournal />
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Reflection Prompts</CardTitle>
                  <CardDescription>Questions to inspire deeper self-reflection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {prompts.map((prompt, index) => (
                    <div key={index} className="rounded-lg bg-muted p-3">
                      <p className="text-sm">{prompt.question}</p>
                      <Textarea
                        placeholder="Write your answer here..."
                        value={prompt.answer}
                        onChange={(e) => handlePromptAnswerChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button onClick={saveReflectionAnswers}>Save Answers</Button>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Tracker</CardTitle>
                  <CardDescription>Track your emotional patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex flex-col items-center justify-center gap-4">
                    <div className="w-full h-20 rounded-md flex items-end px-2">
                      {(() => {
                        const normalizeDate = (date: Date) => {
                          return new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        };

                        const getCurrentWeekDates = () => {
                          const now = new Date();
                          const startOfWeek = normalizeDate(new Date(now.setDate(now.getDate() - now.getDay()))); // Sunday
                          const endOfWeek = normalizeDate(new Date(startOfWeek));
                          endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

                          console.log("Start of Week:", startOfWeek);
                          console.log("End of Week:", endOfWeek);

                          return { startOfWeek, endOfWeek };
                        };

                        const isDateInCurrentWeek = (date: string) => {
                          const { startOfWeek, endOfWeek } = getCurrentWeekDates();
                          const parsedDate = normalizeDate(new Date(date));

                          console.log("Checking date:", parsedDate, "Start:", startOfWeek, "End:", endOfWeek);

                          return parsedDate >= startOfWeek && parsedDate <= endOfWeek;
                        };

                        const filteredMoodData = moodData?.filter((mood: Mood) => {
                          // Ensure `mood.date` is defined
                          if (!mood.date) {
                            console.warn("Skipping entry with undefined date:", mood);
                            return false;
                          }
                        
                          // Check if the date is in the current week
                          const isInWeek = isDateInCurrentWeek(mood.date);
                          console.log("Mood date:", mood.date, "Is in current week:", isInWeek);
                          return isInWeek;
                        });

                        console.log("Filtered Mood Data:", filteredMoodData);

                        const getWeekDates = () => {
                          const { startOfWeek } = getCurrentWeekDates();
                          const weekDates = [];
                          for (let i = 0; i < 7; i++) {
                            const d = new Date(startOfWeek);
                            d.setDate(d.getDate() + i);
                            weekDates.push(d.toISOString().split("T")[0]); // Format as YYYY-MM-DD
                          }
                          return weekDates;
                        };

                        const weekDates = getWeekDates();

                        const weekMoodData = weekDates.map((dateStr) => {
                          const dayMood = filteredMoodData.find((m: Mood) => m.date === dateStr);
                          return {
                            date: dateStr,
                            mood: dayMood ? dayMood.mood : null,
                          };
                        });

                        return daysOfWeek.map((day, index) => {
                          const { mood } = weekMoodData[index] || { mood: null };
                          const moodValue = mood ? mood.value.toLowerCase() : "";
                          const colorClass = moodValue ? getMoodColor(moodValue) : "bg-muted";
                          const heightClass = mood ? "h-16" : "h-4";
                          const finalClass = `w-1/7 ${heightClass} ${colorClass} rounded-sm mx-1`;

                          console.log(`Final class for ${day}:`, finalClass);

                          return (
                            <div
                              key={day}
                              className={finalClass}
                            ></div>
                          );
                        });
                      })()}
                    </div>
                    <div className="flex justify-between w-full px-2 text-xs text-muted-foreground">
                      {daysOfWeek.map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}