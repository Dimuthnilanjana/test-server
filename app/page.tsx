"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PenLine, Users, Sparkles } from 'lucide-react';
import ShortUniqueId from 'short-unique-id';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const createRoom = () => {
    setIsCreating(true);
    const uid = new ShortUniqueId({ length: 6 });
    const roomId = uid.randomUUID().toUpperCase();
    setTimeout(() => {
      router.push(`/room/${roomId}`);
    }, 500);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim().length === 6) {
      setIsJoining(true);
      setTimeout(() => {
        router.push(`/room/${roomCode.toUpperCase()}`);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <PenLine className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            DrawTogether
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Create or join a room to start drawing with friends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all"
              onClick={createRoom}
              disabled={isCreating}
            >
              {isCreating ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating room...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" /> Create a new room
                </div>
              )}
            </Button>
          </div>
          
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          <form onSubmit={joinRoom}>
            <div className="space-y-3">
              <Label htmlFor="roomCode">Join an existing room</Label>
              <div className="flex space-x-2">
                <Input
                  id="roomCode"
                  placeholder="Enter 6-letter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="flex-1"
                  maxLength={6}
                  pattern="[A-Za-z0-9]{6}"
                />
                <Button 
                  type="submit" 
                  disabled={roomCode.length !== 6 || isJoining}
                  className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {isJoining ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Joining...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" /> Join
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-center w-full text-gray-500">
            No signup required. Your drawings are only stored during the session.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}