"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  // Common emojis for reactions
  const emojis = [
    '👍', '👎', '❤️', '😂', '😮', 
    '🎉', '👏', '🔥', '✨', '⭐', 
    '🤔', '😍', '👌', '🙌', '👀',
    '💯', '🚀', '💩', '🤣', '😭'
  ];

  return (
    <Card className="p-2 shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
      <div className="grid grid-cols-5 gap-1">
        {emojis.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </Card>
  );
}