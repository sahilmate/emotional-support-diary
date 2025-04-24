"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile } from "lucide-react"

type Emoji = {
  emoji: string
  name: string
  category: string
}

type EmojiPickerProps = {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Common emotion emojis grouped by category
  const emojis: Emoji[] = [
    // Happy
    { emoji: "😊", name: "Smiling Face with Smiling Eyes", category: "happy" },
    { emoji: "😄", name: "Grinning Face with Smiling Eyes", category: "happy" },
    { emoji: "😁", name: "Beaming Face with Smiling Eyes", category: "happy" },
    { emoji: "😀", name: "Grinning Face", category: "happy" },
    { emoji: "🥰", name: "Smiling Face with Hearts", category: "happy" },
    { emoji: "😍", name: "Smiling Face with Heart-Eyes", category: "happy" },

    // Calm/Relaxed
    { emoji: "😌", name: "Relieved Face", category: "calm" },
    { emoji: "😇", name: "Smiling Face with Halo", category: "calm" },
    { emoji: "🧘", name: "Person in Lotus Position", category: "calm" },
    { emoji: "😴", name: "Sleeping Face", category: "calm" },

    // Neutral
    { emoji: "😐", name: "Neutral Face", category: "neutral" },
    { emoji: "😶", name: "Face Without Mouth", category: "neutral" },
    { emoji: "🤔", name: "Thinking Face", category: "neutral" },
    { emoji: "😑", name: "Expressionless Face", category: "neutral" },

    // Sad
    { emoji: "😔", name: "Pensive Face", category: "sad" },
    { emoji: "😢", name: "Crying Face", category: "sad" },
    { emoji: "😭", name: "Loudly Crying Face", category: "sad" },
    { emoji: "😞", name: "Disappointed Face", category: "sad" },
    { emoji: "😥", name: "Sad but Relieved Face", category: "sad" },

    // Angry
    { emoji: "😠", name: "Angry Face", category: "angry" },
    { emoji: "😡", name: "Pouting Face", category: "angry" },
    { emoji: "🤬", name: "Face with Symbols on Mouth", category: "angry" },
    { emoji: "😤", name: "Face with Steam From Nose", category: "angry" },

    // Anxious/Worried
    { emoji: "😰", name: "Anxious Face with Sweat", category: "anxious" },
    { emoji: "😨", name: "Fearful Face", category: "anxious" },
    { emoji: "😧", name: "Anguished Face", category: "anxious" },
    { emoji: "😬", name: "Grimacing Face", category: "anxious" },
    { emoji: "😳", name: "Flushed Face", category: "anxious" },
  ]

  const categories = [
    { id: "happy", name: "Happy" },
    { id: "calm", name: "Calm" },
    { id: "neutral", name: "Neutral" },
    { id: "sad", name: "Sad" },
    { id: "angry", name: "Angry" },
    { id: "anxious", name: "Anxious" },
  ]

  const filteredEmojis = searchTerm
    ? emojis.filter(
        (emoji) =>
          emoji.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emoji.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : emojis

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open emoji picker">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Search emotions..."
            className="w-full p-2 text-sm border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-6 gap-1 p-3 max-h-[300px] overflow-y-auto">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={index}
              className="flex items-center justify-center p-2 text-xl hover:bg-muted rounded-md transition-colors"
              onClick={() => onEmojiSelect(emoji.emoji)}
              title={emoji.name}
              aria-label={emoji.name}
            >
              {emoji.emoji}
            </button>
          ))}
        </div>
        {!searchTerm && (
          <div className="p-3 border-t">
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  onClick={() => setSearchTerm(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

