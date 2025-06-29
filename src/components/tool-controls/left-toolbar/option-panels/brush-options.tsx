import React, { useState } from "react";
import { useTool } from "@/context/tool-context";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import { MirrorSelector, lightenColor } from "./common";
import { TooltipContent } from "@/components/ui/tooltip";
import { TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";

const BrushOptions: React.FC = () => {
  const {
    color,
    brushSize,
    setBrushSize,
    opacity,
    setOpacity,
    brushMirrorMode,
    setBrushMirrorMode,
    isBrushTransformModeActive,
    setBrushTransformModeActive,
    setSelectedLineId
  } = useTool();

  const [brushMenuOpen, setBrushMenuOpen] = useState(false);
  const brushPreviewBorderColor = lightenColor(color, 50);

  return (
    <div className="flex items-center space-x-2">
      <Popover open={brushMenuOpen} onOpenChange={setBrushMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-1 h-8 pl-1 pr-1">
            <span className="text-xs text-[#D4D4D5FF]">Brush:</span>
            <div
              className="w-5 h-5 rounded-full border-2"
              style={{ backgroundColor: color, borderColor: brushPreviewBorderColor }}
            />
            <div className="relative flex flex-col items-center mt-1">
              <span className="text-xs text-white">{brushSize}</span>
              <ChevronDown size={12} className="text-[#A8AAACFF] -mt-1" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-52 p-3 bg-[#292C31FF] border-2 shadow-md">
          <div className="flex items-center space-x-2">
            <Slider id="brush-size" min={1} max={100} step={1} value={[brushSize]} onValueChange={(value) => setBrushSize(value[0])} className="flex-1" />
            <span className="text-xs w-10 text-right text-white">{brushSize}px</span>
          </div>
        </PopoverContent>
      </Popover>

      <NumberInputWithPopover
        label="Opacity"
        value={opacity}
        onChange={setOpacity}
        min={1}
        max={100}
        suffix="%"
      />

      <div className="ml-3 h-6 border-l border-[#44474AFF]"></div>

      <MirrorSelector value={brushMirrorMode} onChange={setBrushMirrorMode} />

      {/* Transform Mode button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`flex items-center justify-center px-2 min-w-7 min-h-7 ml-3 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]
                ${isBrushTransformModeActive ? 'bg-[#3F434AFF] shadow-inner text-white' : 'bg-[#1e1f22]'}`}
              onClick={() => {
                const newMode = !isBrushTransformModeActive;
                setBrushTransformModeActive(newMode);
                if (!newMode) {
                  setSelectedLineId(null);
                }
              }}
            >
              <span className="text-xs">Transform</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rotate, scale, or move drawn object</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default BrushOptions; 