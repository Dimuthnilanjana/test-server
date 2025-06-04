"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HexColorPicker } from "react-colorful";
import { useRoom } from '@/context/room-context';
import { useSound } from '@/context/sound-context';
import {
  Paintbrush,
  Eraser,
  Undo2,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface DrawingToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;
}

export function DrawingToolbar({
  activeTool,
  setActiveTool,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  isDrawing,
  setIsDrawing,
}: DrawingToolbarProps) {
  const [openColorPicker, setOpenColorPicker] = useState(false);
  
  const { clearDrawingActions, undoLastAction } = useRoom();
  const { playSound, isSoundEnabled, toggleSound } = useSound();

  const predefinedColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#800000', '#008080', '#000080', '#FFC0CB'
  ];

  const handleToolChange = (tool: string) => {
    setActiveTool(tool);
    playSound('draw');
    
    if (tool === 'eraser') {
      // For eraser, we change to white color but keep previous color saved
      setBrushColor('#FFFFFF');
    }
  };

  const handleClear = () => {
    clearDrawingActions();
    playSound('clear');
  };

  const handleUndo = () => {
    undoLastAction();
    playSound('undo');
  };

  return (
    <div className="p-2 border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center space-x-2">
        <Tabs value={activeTool} onValueChange={handleToolChange} className="w-auto">
          <TabsList className="grid grid-cols-2 h-9">
            <TabsTrigger value="brush" className="px-3">
              <Paintbrush className="h-4 w-4 mr-1" /> Brush
            </TabsTrigger>
            <TabsTrigger value="eraser" className="px-3">
              <Eraser className="h-4 w-4 mr-1" /> Eraser
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={handleUndo}
            className="h-9 w-9"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={handleClear}
            className="h-9 w-9 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1 whitespace-nowrap">Size:</span>
          <Slider
            className="w-24"
            min={1}
            max={50}
            step={1}
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
          />
        </div>

        <Popover open={openColorPicker} onOpenChange={setOpenColorPicker}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-9 w-9 p-0 border-2" 
              style={{ 
                backgroundColor: brushColor,
                borderColor: brushColor === '#FFFFFF' ? '#e2e8f0' : brushColor
              }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <HexColorPicker color={brushColor} onChange={setBrushColor} />
              <div className="flex flex-wrap gap-1 mt-2">
                {predefinedColors.map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    className="h-6 w-6 p-0 rounded-sm border"
                    style={{ 
                      backgroundColor: color,
                      borderColor: color === '#FFFFFF' ? '#e2e8f0' : color 
                    }}
                    onClick={() => setBrushColor(color)}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSound}
          className="h-9 w-9 text-gray-500"
          aria-label={isSoundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {isSoundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}