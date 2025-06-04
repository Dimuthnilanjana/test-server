"use client";

import React, { useEffect, useState } from 'react';
import { DrawingCanvas } from '@/components/drawing-canvas';
import { RoomProvider } from '@/context/room-context';
import { SoundProvider } from '@/context/sound-context';
import { Loader } from '@/components/ui/loader';

interface RoomPageProps {
  params: {
    id: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const roomId = params.id.toUpperCase();

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
        <Loader size="lg" text="Setting up your drawing room..." />
      </div>
    );
  }

  return (
    <SoundProvider>
      <RoomProvider roomId={roomId}>
        <DrawingCanvas />
      </RoomProvider>
    </SoundProvider>
  );
}