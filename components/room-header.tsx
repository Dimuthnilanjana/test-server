"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { useRoom } from '@/context/room-context';
import { ArrowLeft, Copy, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RoomHeaderProps {
  roomId: string;
}

export function RoomHeader({ roomId }: RoomHeaderProps) {
  const router = useRouter();
  const { peers } = useRoom();
  
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room code copied to clipboard');
  };
  
  const handleCopyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success('Room link copied to clipboard');
  };
  
  const handleBack = () => {
    router.push('/');
  };

  return (
    <header className="p-4 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBack}
          className="mr-2 h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-bold text-lg">DrawTogether</h1>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">Room:</span>
              <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">
                {roomId}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyRoomCode}
                className="h-5 w-5"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyRoomLink}
          className="hidden md:flex"
        >
          Share Room Link
        </Button>
        
        <div className="flex items-center gap-1 bg-secondary px-2.5 py-1 rounded-full">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{peers.length + 1}</span>
        </div>
      </div>
    </header>
  );
}