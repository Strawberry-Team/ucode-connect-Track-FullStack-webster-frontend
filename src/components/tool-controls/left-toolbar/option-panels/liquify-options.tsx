import React from "react";
import { useTool } from "@/context/tool-context";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  ChevronDown,
  Move,
  Zap,
  Minimize2,
  Maximize2,
  Diamond,
  Undo2,
  Scissors,
  RotateCw,
  RotateCcw as TwirlLeft,
  Image as ImageIcon,
  MousePointerClick,
  Repeat
} from "lucide-react";
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { resetLiquifyFunction } from "@/components/canvas/canvas";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ElementData } from "@/types/canvas";

// Adding styles for scrollbar (same as text-options)
const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 8px;
    background-color: #292C31;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #44474A;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-track {
    background-color: #292C31;
    border-radius: 4px;
  }
`;

const LiquifyOptions: React.FC = () => {
  const {
    liquifyBrushSize,
    setLiquifyBrushSize,
    liquifyStrength,
    setLiquifyStrength,
    liquifyMode,
    setLiquifyMode,
    liquifyTwirlDirection,
    setLiquifyTwirlDirection,
    renderableObjects,
    selectedLiquifyImageId,
    setSelectedLiquifyImageId,
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
    pinch: "Pinch",
    expand: "Expand",
    crystals: "Crystals",
    edge: "Edge",
    twirl: "Twirl",
    reconstruct: "Reconstruct",
  };

  const liquifyModeIcons = {
    push: Move,
    twirl: Zap,
    pinch: Minimize2,
    expand: Maximize2,
    crystals: Diamond,
    edge: Scissors,
    reconstruct: Undo2,
  };

  // Get all available images from renderableObjects
  const availableImages = renderableObjects.filter(obj => 
    !('tool' in obj) && obj.type === 'custom-image'
  ) as ElementData[];

  const handleSelectImage = (imageId: string) => {
    setSelectedLiquifyImageId(imageId);
  };

  const handleSelectDifferentImage = () => {
    setSelectedLiquifyImageId(null);
  };

  const selectedImage = availableImages.find(img => img.id === selectedLiquifyImageId);

  // If no images available
  if (availableImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-xs text-[#A8AAACFF] text-center">
          Add an image to the canvas to use the <b>Liquify</b> tool.
        </span>
      </div>
    );
  }

  // If no image selected, show image selection
  if (!selectedLiquifyImageId || !selectedImage) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-xs text-[#A8AAACFF] ml-1">
          Select an image object to start liquifying.
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center h-7 px-3 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
              <ImageIcon size={14} />
              Select Image
              <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 relative m-0"
          >
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            <ScrollArea className="h-[200px] w-[250px]">
              <div className="p-1">
                {availableImages.map((image) => (
                  <DropdownMenuItem
                    key={image.id}
                    className="flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer"
                    onClick={() => handleSelectImage(image.id)}
                  >
                    <ImageIcon size={14} />
                    <div className="flex flex-col items-start">
                      <span className="text-xs">{image.fileName || `Image ${image.id.slice(-6)}`}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Selected Image Indicator */}
      <div className="flex items-center space-x-4">
        <Label className="text-xs text-[#D4D4D5FF]">Selected:</Label>
        <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
          <ImageIcon size={14} />
          <div className="flex flex-col items-start">
            <span className="text-xs">{selectedImage?.fileName || `Image ${selectedImage?.id.slice(-6)}`}</span>
          </div>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
              onClick={handleSelectDifferentImage}
            >
              <Repeat size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select Different Image</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="ml-3 h-6 border-l border-[#44474AFF]"></div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-1 h-8 ml-3 ">
            <span className="text-xs text-[#D4D4D5FF]">Size:</span>
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

      {/* Mode Selector */}
      <div className="flex items-center space-x-2">
        <Label className="text-xs text-[#D4D4D5FF] pl-3">Method:</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
              {React.createElement(liquifyModeIcons[liquifyMode], { size: 14 })}
              {liquifyModeLabels[liquifyMode]}
              <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 relative m-0"
          >
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            <ScrollArea className="h-[200px] w-[180px]">
              <div className="p-1">
                {Object.entries(liquifyModeLabels).map(([mode, label]) => {
                  const IconComponent = liquifyModeIcons[mode as keyof typeof liquifyModeIcons];
                  return (
                    <DropdownMenuItem
                      key={mode}
                      className={`flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer ${liquifyMode === mode ? "bg-[#3F434AFF] rounded-sm" : ""}`}
                      onClick={() => setLiquifyMode(mode as typeof liquifyMode)}
                    >
                      <IconComponent size={14} />
                      <span>{label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Twirl Direction Selector (only visible when Twirl mode is active) */}
      {liquifyMode === 'twirl' && (
        <div className="flex items-center space-x-2">
          <Label className="text-xs text-[#D4D4D5FF] pl-3">Direction:</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
                {liquifyTwirlDirection === 'left' ? <TwirlLeft size={14} /> : <RotateCw size={14} />}
                {liquifyTwirlDirection === 'left' ? 'Left' : 'Right'}
                <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 relative m-0"
            >
              <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
              <ScrollArea className="h-[80px] w-[120px]">
                <div className="p-1">
                  <DropdownMenuItem
                    className={`flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer ${liquifyTwirlDirection === 'left' ? "bg-[#3F434AFF] rounded-sm" : ""}`}
                    onClick={() => setLiquifyTwirlDirection('left')}
                  >
                    <TwirlLeft size={14} />
                    <span>Left</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer ${liquifyTwirlDirection === 'right' ? "bg-[#3F434AFF] rounded-sm" : ""}`}
                    onClick={() => setLiquifyTwirlDirection('right')}
                  >
                    <RotateCw size={14} />
                    <span>Right</span>
                  </DropdownMenuItem>
                </div>
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Strength Slider Popover */}
      <NumberInputWithPopover
        label="Strength"
        value={liquifyStrength}
        onChange={setLiquifyStrength}
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
            <RotateCcw size={14} />
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