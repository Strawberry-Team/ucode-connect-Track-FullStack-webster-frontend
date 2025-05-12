import type React from "react"
import { useTool } from "@/context/tool-context"
import {
  Eraser,
  Square,
  Type,
  Brush,
  MousePointer2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

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
    swapColors
  } = useTool()

  const tools = [
    { id: "cursor", name: "Cursor Tool", type: "cursor", icon: MousePointer2 },
    { id: "brush", name: "Brush Tool", type: "brush", icon: Brush },
    { id: "eraser", name: "Eraser Tool", type: "eraser", icon: Eraser },
    { id: "text", name: "Text Tool", type: "text", icon: Type },
    { id: "shape", name: "Shape Tool", type: "shape", icon: Square },
  ]

  const handleToolClick = (tool: any) => {
    setActiveTool(tool)
    setActiveElement(null)
  }

  const primaryLightBorder = lightenColor(color, 50);
  const secondaryLightBorder = lightenColor(secondaryColor, 50);

  return (
    <TooltipProvider>
      <div className="w-15 h-full bg-[#292C31FF] border-t-2 border-[#44474AFF] flex flex-col items-center py-2">
        <div className="space-y-1">
          {tools.map((tool) => {
            const Icon = tool.icon
            const isActive = activeTool?.id === tool.id

            return (
              <div key={tool.id} className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-10 h-10 group hover:bg-[#383A3EFF] ${isActive || (tool.id === "shape" && activeElement) ? "bg-[#414448FF]" : ""}`}
                      onClick={() => handleToolClick(tool)}
                    >
                      <Icon 
                        className={
                          `!w-4.5 !h-4.5 ${
                            isActive || (tool.id === "shape" && activeElement) 
                              ? "text-white" 
                              : "text-[#A8AAACFF] group-hover:text-white"
                          }`
                        }
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{tool.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )
          })}
        </div>

        <div className="-ml-3 pt-2">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div className="relative z-10">
                  <div>
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="cursor-pointer w-8 h-8 p-0 opacity-0 absolute"
                    />
                    <div 
                      className="w-8 h-8 rounded-full border-2" 
                      style={{ backgroundColor: color, borderColor: primaryLightBorder }} 
                    />
                  </div>
              </div>
              <div className="absolute -bottom-4 -right-3 z-0">
                  <div>
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="cursor-pointer w-8 h-8 p-0 opacity-0 absolute"
                    />
                    <div 
                      className="w-8 h-8 rounded-full border-2" 
                      style={{ backgroundColor: secondaryColor, borderColor: secondaryLightBorder }} 
                    />
                  </div>
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
                  <TooltipContent side="right">
                    <p>Поменять цвета местами</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default Toolbar
