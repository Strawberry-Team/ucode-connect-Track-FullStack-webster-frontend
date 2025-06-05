import React from "react";
import { useTool } from "@/context/tool-context";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronDown, Droplet } from "lucide-react";
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
    renderableObjects,
  } = useTool();

  const handleResetClick = () => {
    if (resetBlurFunction) {
      resetBlurFunction();
    } else {
      console.warn("resetBlurFunction is not available");
    }
  };

  // Check if there are any imported images (custom-image type) in the project
  const hasImportedImages = renderableObjects.some(obj => 
    !('tool' in obj) && obj.type === 'custom-image'
  );

  if (!hasImportedImages) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-xs text-[#A8AAACFF] text-center">
          Add an image to the canvas to use the Blur tool.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Brush Size Slider Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-1 h-8 pl-1 pr-1 ">
            <span className="text-xs text-[#D4D4D5FF]">Blur:</span>
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

      <div className="ml-3 h-6 border-l border-[#44474AFF]"></div>

      {/* Reset Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center justify-center px-2 min-w-7 min-h-7 ml-3 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
            onClick={handleResetClick}
          >
            <span className="text-xs">Reset all</span>
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