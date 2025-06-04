"use client";

import React, { useEffect, useRef, useState } from 'react';
import { DrawingToolbar } from './drawing-toolbar';
import { useRoom } from '@/context/room-context';
import { useSound } from '@/context/sound-context';
import { RoomHeader } from './room-header';
import { EmojiPicker } from './emoji-picker';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const [fabricInstance, setFabricInstance] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<string>('brush');
  const [brushColor, setBrushColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [emojis, setEmojis] = useState<{id: string, emoji: string, x: number, y: number, opacity: number}[]>([]);
  
  const { roomId, drawingActions, addDrawingAction, initialized } = useRoom();
  const { playSound } = useSound();

  // Load Fabric.js
  useEffect(() => {
    const loadFabric = async () => {
      try {
        const { fabric } = await import('fabric');
        setFabricInstance(fabric);
      } catch (error) {
        console.error('Failed to load Fabric.js:', error);
      }
    };
    
    loadFabric();
  }, []);

  // Setup canvas
  useEffect(() => {
    if (!canvasRef.current || !initialized || !fabricInstance) return;

    const canvas = new fabricInstance.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: window.innerWidth,
      height: window.innerHeight - 120, // Account for header and toolbar
    });

    fabricCanvasRef.current = canvas;

    // Configure default brush
    const freeDrawingBrush = canvas.freeDrawingBrush;
    freeDrawingBrush.color = brushColor;
    freeDrawingBrush.width = brushSize;
    
    // Handle window resize
    const handleResize = () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight - 120);
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    // Handle drawing events
    canvas.on('path:created', (e) => {
      const path = e.path?.toJSON();
      if (path) {
        addDrawingAction({
          type: 'path',
          data: { path, tool: activeTool, color: brushColor, size: brushSize }
        });
        
        if (activeTool === 'brush') {
          playSound('draw');
        }
      }
    });

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [initialized, brushColor, brushSize, activeTool, addDrawingAction, playSound, fabricInstance]);

  // Process incoming drawing actions
  useEffect(() => {
    if (!fabricCanvasRef.current || !fabricInstance) return;
    
    const canvas = fabricCanvasRef.current;
    
    // Handle the latest drawing action
    if (drawingActions.length > 0) {
      const latestAction = drawingActions[drawingActions.length - 1];
      
      if (latestAction.type === 'path') {
        fabricInstance.util.enlivenObjects([latestAction.data.path], (objects) => {
          if (objects.length > 0) {
            canvas.add(objects[0]);
          }
        });
      } else if (latestAction.type === 'clear') {
        canvas.clear();
        playSound('clear');
      } else if (latestAction.type === 'undo') {
        const objects = canvas.getObjects();
        if (objects.length > 0) {
          canvas.remove(objects[objects.length - 1]);
          playSound('undo');
        }
      } else if (latestAction.type === 'emoji') {
        const { emoji, x, y } = latestAction.data;
        addEmoji(emoji, x, y);
        playSound('emoji');
      }
      
      canvas.renderAll();
    }
  }, [drawingActions, playSound, fabricInstance]);

  // Update brush properties when they change
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    if (activeTool === 'brush' || activeTool === 'pencil') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    } else {
      canvas.isDrawingMode = false;
    }
    
  }, [activeTool, brushColor, brushSize]);

  // Handle emoji animations
  useEffect(() => {
    if (emojis.length === 0) return;
    
    const animationFrame = requestAnimationFrame(() => {
      setEmojis(prev => 
        prev.map(emoji => ({
          ...emoji,
          y: emoji.y - 1, // Move up
          opacity: emoji.opacity - 0.01 // Fade out
        })).filter(emoji => emoji.opacity > 0) // Remove completely faded emojis
      );
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [emojis]);

  // Add emoji to the canvas
  const addEmoji = (emoji: string, x?: number, y?: number) => {
    const canvasX = x ?? Math.random() * window.innerWidth;
    const canvasY = y ?? Math.random() * (window.innerHeight - 120) + 60;
    
    const newEmoji = {
      id: Math.random().toString(36).substring(2, 9),
      emoji,
      x: canvasX,
      y: canvasY,
      opacity: 1
    };
    
    setEmojis(prev => [...prev, newEmoji]);
    
    // Share emoji action with peers
    addDrawingAction({
      type: 'emoji',
      data: { emoji, x: canvasX, y: canvasY }
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    addEmoji(emoji);
    setShowEmojiPicker(false);
    playSound('emoji');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 overflow-hidden">
      <RoomHeader roomId={roomId} />
      
      <main className="flex-1 relative">
        {/* Canvas */}
        <canvas 
          ref={canvasRef} 
          className="touch-none border-t border-gray-200 dark:border-gray-800"
        />
        
        {/* Emoji reactions */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {emojis.map((emojiObj) => (
            <div 
              key={emojiObj.id}
              className="absolute text-2xl transition-transform"
              style={{
                left: `${emojiObj.x}px`,
                top: `${emojiObj.y}px`,
                opacity: emojiObj.opacity,
                transform: `scale(${1 + (1 - emojiObj.opacity)})`, // Grow as it fades
              }}
            >
              {emojiObj.emoji}
            </div>
          ))}
        </div>
        
        {/* Emoji Picker */}
        <div className={cn(
          "absolute bottom-24 right-4 md:right-8 transition-opacity",
          showEmojiPicker ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>
        
        {/* Quick Emoji Button */}
        <Button 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="absolute bottom-4 right-4 md:right-8 rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          size="icon"
          variant="default"
        >
          <span className="text-xl">🎉</span>
        </Button>
      </main>

      <DrawingToolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
      />
    </div>
  );
}