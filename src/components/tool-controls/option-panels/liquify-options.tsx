import React from "react";
import { useTool } from "@/context/tool-context";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Waves, RotateCcw, ChevronDown, Check } from "lucide-react";
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { resetLiquifyFunction } from "@/components/canvas/canvas";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

const LiquifyOptions: React.FC = () => {
  const {
    liquifyBrushSize,
    setLiquifyBrushSize,
    liquifyStrength,
    setLiquifyStrength,
    liquifyMode,
    setLiquifyMode,
    isImageReadyForLiquify,
  } = useTool();

  const handleResetClick = () => {
    if (resetLiquifyFunction) {
      resetLiquifyFunction();
    } else {
      console.warn("resetLiquifyFunction is not available");
    }
  };

  const liquifyModeLabels = {
    push: "Push",
    reconstruct: "Reconstruct",
  };

  if (!isImageReadyForLiquify) {
    return (
      <div className="flex items-center justify-center h-full ">
        <span className="text-[14px] text-[#A8AAACFF] text-center">
          Add an image to the canvas to use the Liquify tool.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Waves strokeWidth={1.5} className="!w-5 !h-5 text-[#A8AAACFF] mr-2 flex-shrink-0" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-1 h-8 pl-1 pr-1 ">
            <div className="relative flex flex-col items-center mt-1">
              <span className="text-xs text-white">{liquifyBrushSize}</span>
              <ChevronDown size={12} className="text-[#A8AAACFF] -mt-1" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-52 p-3 bg-[#292C31FF] border-2 shadow-md">
          <div className="flex items-center space-x-2">
            <Slider id="liquify-size" min={1} max={100} step={1} value={[liquifyBrushSize]} onValueChange={(value) => setLiquifyBrushSize(value[0])} className="flex-1" />
            <span className="text-xs w-10 text-right text-white">{liquifyBrushSize}px</span>
          </div>
        </PopoverContent>
      </Popover>

      {/* Mode Selector - Dropdown */}
      <div className="flex items-center space-x-2">
        <Label className="text-xs text-[#D4D4D5FF] pl-3">Method:</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
              {liquifyModeLabels[liquifyMode]}
              <ChevronDown size={12} className="text-white ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0">
            {Object.entries(liquifyModeLabels).map(([mode, label]) => (
              <DropdownMenuItem
                key={mode}
                className="flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer"
                onClick={() => setLiquifyMode(mode as 'push' | 'reconstruct')}
              >
                {liquifyMode === mode && <Check size={14} className="text-blue-400" />}
                <span className={liquifyMode !== mode ? "ml-5" : ""}>{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Strength Slider Popover */}
      <NumberInputWithPopover
        label="Strength"
        value={liquifyStrength}
        onChange={setLiquifyStrength}
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
            aria-label="Reset Liquify Effect"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reset Liquify Effect</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default LiquifyOptions; 