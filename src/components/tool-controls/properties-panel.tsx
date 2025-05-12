import React from "react"
import { useTool } from "@/context/tool-context"
import { House } from "lucide-react"
import { 
  BrushOptions, 
  EraserOptions, 
  ShapeOptions, 
  TextOptions 
} from "./option-panels"

const PropertiesPanel: React.FC = () => {
  const { activeTool, activeElement } = useTool()

  const renderToolOptions = () => {
    if (activeTool?.id === "brush") {
      return <BrushOptions />
    } else if (activeTool?.id === "eraser") {
      return <EraserOptions />
    } else if (activeTool?.id === "text") {
      return <TextOptions />
    } else if (activeElement || activeTool?.id === "shape") {
      return <ShapeOptions />
    }

    return null
  }

  return (
    <div className="h-12 w-full bg-[#292C31FF] p-2">
      <div className="flex justify-between items-center">
      <div className="flex items-center">
        <House className="cursor-pointer !w-5 !h-5 ml-2.5 text-[#A8AAACFF] hover:text-white"/>
        <div className="border-l-2 border-[#44474AFF] h-8 mx-5"></div>
        <div className="flex-1 min-w-0">{renderToolOptions()}</div>
      </div>
      </div>
    </div>
  )
}

export default PropertiesPanel
