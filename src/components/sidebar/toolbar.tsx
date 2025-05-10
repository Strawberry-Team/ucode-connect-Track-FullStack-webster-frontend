import type React from "react"
import { useTool } from "@/context/tool-context"
import {
  Paintbrush,
  Eraser,
  Square,
  Circle,
  Triangle,
  Star,
  Hexagon,
  Diamond,
  Heart,
  Moon,
  Cloud,
  Type,
  Hand,
  MoveHorizontal,
  Crop,
  Pipette,
  Wand,
  Lasso,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool, activeElement, setActiveElement } = useTool()

  const tools = [
    { id: "move", name: "Move Tool", type: "move", icon: MoveHorizontal },
    { id: "lasso", name: "Lasso Tool", type: "lasso", icon: Lasso },
    { id: "wand", name: "Magic Wand", type: "wand", icon: Wand },
    { id: "crop", name: "Crop Tool", type: "crop", icon: Crop },
    { id: "pipette", name: "Eyedropper", type: "pipette", icon: Pipette },
    { id: "brush", name: "Brush Tool", type: "brush", icon: Paintbrush },
    { id: "eraser", name: "Eraser Tool", type: "eraser", icon: Eraser },
    { id: "text", name: "Text Tool", type: "text", icon: Type },
    { id: "shape", name: "Shape Tool", type: "shape", icon: Square },
    { id: "hand", name: "Hand Tool", type: "hand", icon: Hand },
  ]

  const shapes = [
    { id: "rectangle", type: "rectangle", icon: Square },
    { id: "circle", type: "circle", icon: Circle },
    { id: "triangle", type: "triangle", icon: Triangle },
    { id: "star", type: "star", icon: Star },
    { id: "hexagon", type: "hexagon", icon: Hexagon },
    { id: "diamond", type: "diamond", icon: Diamond },
    { id: "heart", type: "heart", icon: Heart },
    { id: "moon", type: "moon", icon: Moon },
    { id: "cloud", type: "cloud", icon: Cloud },
  ]

  const handleToolClick = (tool: any) => {
    setActiveTool(tool)
    setActiveElement(null)
  }

  const handleShapeClick = (shape: any) => {
    setActiveElement(shape)
    setActiveTool(null)
  }

  return (
    <TooltipProvider>
      <div className="w-[60px] bg-[#2a2a2a] border-r border-[#1a1a1a] flex flex-col items-center py-2">
        <div className="space-y-1">
          {tools.map((tool) => {
            const Icon = tool.icon
            const isActive = activeTool?.id === tool.id

            return (
              <div key={tool.id} className="relative">
                {tool.id === "shape" && activeElement && (
                  <div className="absolute left-10 top-0 bg-[#2a2a2a] border border-[#1a1a1a] rounded p-1 z-10 w-[120px]">
                    <div className="grid grid-cols-3 gap-1">
                      {shapes.map((shape) => {
                        const ShapeIcon = shape.icon
                        return (
                          <Tooltip key={shape.id}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                className={`w-8 h-8 ${activeElement?.id === shape.id ? "bg-[#3a3a3a]" : ""}`}
                                onClick={() => handleShapeClick(shape)}
                              >
                                <ShapeIcon size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{shape.id.charAt(0).toUpperCase() + shape.id.slice(1)}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </div>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-10 h-10 ${isActive || (tool.id === "shape" && activeElement) ? "bg-[#3a3a3a]" : ""}`}
                      onClick={() => handleToolClick(tool)}
                    >
                      <Icon size={20} />
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
      </div>
    </TooltipProvider>
  )
}

export default Toolbar
