import type React from "react"
import { useTool } from "@/context/tool-context"
import {
  Eraser,
  Type,
  Brush,
  MousePointer2,
    Shapes,
    Crop
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomTooltip, CustomTooltipContent, CustomTooltipTrigger } from "@/components/ui/custom-tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import ColorPicker from "../color-picker/color-picker"
import { useState } from "react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
const lightenColor = (hex: string, percent: number): string => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(s => s + s).join('');
  }

  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const Toolbar: React.FC = () => {
  const { 
    activeTool, 
    setActiveTool, 
    activeElement, 
    setActiveElement,
    color,
    setColor,
    secondaryColor,
    setSecondaryColor,
    swapColors,
    isCropping,
    setIsCropping,
    setCropRect,
    stageSize
  } = useTool()

  const [isPrimaryPickerOpen, setIsPrimaryPickerOpen] = useState(false)
  const [isSecondaryPickerOpen, setIsSecondaryPickerOpen] = useState(false)

  const tools = [
    { 
      id: "cursor", 
      name: "Cursor", 
      type: "cursor", 
      icon: MousePointer2, 
      description: "Select and move elements on the canvas.",
      imageUrl: "https://pixlr.com/img/tool/arrange-info.jpg"
    },
    { 
      id: "brush", 
      name: "Brush", 
      type: "brush", 
      icon: Brush, 
      description: "Draw freehand lines with a brush.",
      imageUrl: "https://pixlr.com/img/tool/draw-info.jpg"
    },
    { 
      id: "eraser", 
      name: "Eraser", 
      type: "eraser", 
      icon: Eraser, 
      description: "Erase parts of elements or drawings.",
      imageUrl: "https://pixlr.com/img/tool/eraser-info.jpg"
    },
    { 
      id: "text", 
      name: "Text", 
      type: "text", 
      icon: Type, 
      description: "Add and edit text on the canvas.",
      imageUrl: "https://pixlr.com/img/tool/text-info.jpg"
    },
    { 
      id: "shape", 
      name: "Shape", 
      type: "shape", 
      icon: Shapes, 
      description: "Draw various shapes like rectangles, circles.",
      imageUrl: "https://pixlr.com/img/tool/shape-info.jpg"
    },
    { 
      id: "crop", 
      name: "Crop", 
      type: "crop", 
      icon: Crop, 
      description: "Crop the canvas to a selected area.",
      imageUrl: "https://pixlr.com/img/tool/crop-info.jpg"
    },
  ]

  const handleToolClick = (tool: any) => {
    setActiveTool(tool)
    setActiveElement(null)

    if (tool.type === 'crop') {
      setIsCropping(true);
      if (stageSize) {
        setCropRect({ x: 0, y: 0, width: stageSize.width, height: stageSize.height });
      } else {
        setCropRect(null);
      }
    } else {
      if (isCropping) {
        setIsCropping(false);
        setCropRect(null);
      }
    }
  }

  const primaryLightBorder = lightenColor(color, 50);
  const secondaryLightBorder = lightenColor(secondaryColor, 50);

  return (
    <div className="w-15 h-full bg-[#292C31FF] border-t-2 border-t-[#44474AFF] border-r-1 border-r-[#171719FF] flex flex-col items-center py-2">
      <div className="space-y-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool?.id === tool.id;

          return (
            <div key={tool.id} className="relative">
              <CustomTooltip>
                <CustomTooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-10 h-10 group hover:bg-[#383A3EFF] ${isActive ? "bg-[#414448FF]" : ""}`}
                    onClick={() => handleToolClick(tool)}
                  >
                    <Icon 
                      className={
                        `!w-4.5 !h-4.5 ${isActive ? "text-white" : "text-[#A8AAACFF] group-hover:text-white"}`
                      }
                    />
                  </Button>
                </CustomTooltipTrigger>
                <CustomTooltipContent 
                  side="right"
                  align="start"
                  title={tool.name}
                  description={tool.description}
                  imageUrl={tool.imageUrl}
                >
                </CustomTooltipContent>
              </CustomTooltip>
            </div>
          )
        })}
      </div>

      <div className="-ml-3 pt-2">
        <div className="flex flex-col items-center space-y-2">
          <div className="relative">
            <div className="relative z-10">
              <Popover open={isPrimaryPickerOpen} onOpenChange={setIsPrimaryPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="cursor-pointer w-8 h-8 p-0 border-0 rounded-full relative block"
                    aria-label="Select primary color"
                  >
                    <div
                      className="w-full h-full rounded-full border-2"
                      style={{ backgroundColor: color, borderColor: primaryLightBorder }}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" align="start" className="w-auto p-0 bg-transparent border-0 shadow-none">
                  <ColorPicker color={color} setColor={setColor} onClose={() => setIsPrimaryPickerOpen(false)} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="absolute -bottom-4 -right-3 z-0">
              <Popover open={isSecondaryPickerOpen} onOpenChange={setIsSecondaryPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="cursor-pointer w-8 h-8 p-0 border-0 rounded-full relative block"
                    aria-label="Select secondary color"
                  >
                    <div
                      className="w-full h-full rounded-full border-2"
                      style={{ backgroundColor: secondaryColor, borderColor: secondaryLightBorder }}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" align="start" className="w-auto p-0 border-0 bg-transparent shadow-none">
                  <ColorPicker color={secondaryColor} setColor={setSecondaryColor} onClose={() => setIsSecondaryPickerOpen(false)} />
                </PopoverContent>
              </Popover>
            </div>
            
            
            <div className="absolute top-0 right-0 transform translate-x-4.5 -translate-y-1/5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-5 h-5 p-0 flex items-center justify-center rounded-none border-0 hover:bg-transparent bg-transparent" 
                    onClick={swapColors}
                  >
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 15 15" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      stroke="#ffffff" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      transform="rotate(45)"
                    >
                      <path d="M2 7.5 Q7.5 1 13 7.5" />
                      <polyline points="3 4 2 7.5 4 8.5" />
                      <polyline points="12 4 13 7.5 11 8.5" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="right"
                  align="start"
                >
                  <p>Swap colors</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Toolbar
