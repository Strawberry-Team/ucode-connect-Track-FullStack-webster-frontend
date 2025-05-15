import React from "react"
import { useTool } from "@/context/tool-context"
import { House } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { 
  BrushOptions, 
  EraserOptions, 
  ShapeOptions, 
  TextOptions,
  CropOptions
} from "./option-panels"

const PropertiesPanel: React.FC = () => {
  const { activeTool } = useTool()
  const navigate = useNavigate()

  const handleNavigateHome = () => {
    navigate('/')
  }

  const renderToolOptions = () => {
    switch (activeTool?.id) {
      case "brush":
        return <BrushOptions />
      case "eraser":
        return <EraserOptions />
      case "text":
        return <TextOptions />
      case "shape":
        return <ShapeOptions />
      case "crop":
        return <CropOptions />
      default:
        return null
    }
  };

  return (
    <div className="h-12 w-full bg-[#292C31FF] p-2 ">
      <div className="flex justify-between items-center">
      <div className="flex items-center">
        <House
          className="cursor-pointer !w-5 !h-5 ml-2.5 text-[#A8AAACFF] hover:text-white"
          onClick={handleNavigateHome}
        />
        <div className="border-l-2 border-[#44474AFF] h-8 mx-5"></div>
        <div className="flex-1 min-w-0">{renderToolOptions()}</div>
      </div>
      </div>
    </div>
  )
}

export default PropertiesPanel
