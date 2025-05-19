import React from "react";
import { useTool } from "@/context/tool-context";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronDown, Droplet } from "lucide-react"; // Используем Waves как иконку по умолчанию, можно заменить
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { resetBlurFunction } from "@/components/canvas/canvas";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const BlurOptions: React.FC = () => {
  const {
    blurBrushSize,
    setBlurBrushSize,
    blurStrength,
    setBlurStrength,
    isImageReadyForLiquify, // Используем ту же проверку, что и для Liquify
  } = useTool();

  const handleResetClick = () => {
    if (resetBlurFunction) {
      resetBlurFunction();
    } else {
      console.warn("resetBlurFunction is not available");
    }
  };

  if (!isImageReadyForLiquify) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[14px] text-[#A8AAACFF] text-center">
          Add an image to the canvas to use the Blur tool.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Icon for Blur - можно заменить на более подходящую */}
      <Droplet strokeWidth={1.5} className="!w-5 !h-5 text-[#A8AAACFF] mr-2 flex-shrink-0" />

      {/* Brush Size Slider Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-1 h-8 pl-1 pr-1 ">
            <div className="relative flex flex-col items-center mt-1">
              <span className="text-xs text-white">{blurBrushSize}</span>
              <ChevronDown size={12} className="text-[#A8AAACFF] -mt-1" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-52 p-3 bg-[#292C31FF] border-2 shadow-md">
          <div className="flex items-center space-x-2">
            <Slider id="blur-size" min={1} max={200} step={1} value={[blurBrushSize]} onValueChange={(value) => setBlurBrushSize(value[0])} className="flex-1" />
            <span className="text-xs w-10 text-right text-white">{blurBrushSize}px</span>
          </div>
        </PopoverContent>
      </Popover>

      {/* Strength Slider Popover */}
      <NumberInputWithPopover
        label="Strength"
        value={blurStrength}
        onChange={setBlurStrength}
        min={1}
        max={100}
        suffix="%"
      />

      {/* Reset Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-7 w-7 bg-[#383A3EFF] hover:bg-[#414448FF] text-[#D4D4D5]"
            onClick={handleResetClick}
            aria-label="Reset Blur Effect"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reset Blur Effect</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default BlurOptions; 