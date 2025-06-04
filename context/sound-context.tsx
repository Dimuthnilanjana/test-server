"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

type SoundType = 'draw' | 'clear' | 'emoji' | 'join' | 'undo';

interface Sound {
  play: () => void;
  stop: () => void;
}

interface SoundContextType {
  playSound: (type: SoundType) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const soundsRef = useRef<Record<SoundType, Sound | null>>({
    draw: null,
    clear: null,
    emoji: null,
    join: null,
    undo: null,
  });

  useEffect(() => {
    // Initialize sounds
    soundsRef.current = {
      draw: new Howl({
        src: ['https://assets.codepen.io/21542/pop-down.mp3'],
        volume: 0.2,
        rate: 2.0,
      }),
      clear: new Howl({
        src: ['https://assets.codepen.io/21542/pop-up.mp3'],
        volume: 0.3,
      }),
      emoji: new Howl({
        src: ['https://assets.codepen.io/21542/snap.mp3'],
        volume: 0.5,
      }),
      join: new Howl({
        src: ['https://assets.codepen.io/21542/click.mp3'],
        volume: 0.5,
      }),
      undo: new Howl({
        src: ['https://assets.codepen.io/21542/pop-down.mp3'],
        volume: 0.3,
        rate: 0.8,
      }),
    };

    // Clean up sounds on unmount
    return () => {
      Object.values(soundsRef.current).forEach((sound) => {
        if (sound) {
          sound.stop();
        }
      });
    };
  }, []);

  const playSound = (type: SoundType) => {
    if (isSoundEnabled && soundsRef.current[type]) {
      soundsRef.current[type]?.play();
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled((prev) => !prev);
  };

  return (
    <SoundContext.Provider value={{ playSound, isSoundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
}