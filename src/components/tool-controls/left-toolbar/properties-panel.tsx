import React from "react"
import { useTool } from "@/context/tool-context"
import { House } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  BrushOptions,
  EraserOptions,
  ShapeOptions,
  TextOptions,
  CropOptions,
  HandOptions,
  LiquifyOptions,
  BlurOptions,
  ImageTransformOptions
} from "./option-panels"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
      case "liquify":
        return <LiquifyOptions />
      case "blur":
        return <BlurOptions />
      case "image-transform":
        return <ImageTransformOptions />
      case "crop":
        return <CropOptions />
      case "hand":
        return <HandOptions />
      default:
        return null
    }
  };

  return (
    <div className="h-12 w-full bg-[#292C31FF] p-2 ">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <House
                  className="cursor-pointer !w-5 !h-5 ml-2.5 text-[#A8AAACFF] hover:text-white "
                  onClick={handleNavigateHome}
                />
              </TooltipTrigger>
              <TooltipContent side="right" align="center" sideOffset={12}>
                <p>Home page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="border-l-2 border-[#44474AFF] h-8 mx-5"></div>
          <div className="flex-1 min-w-0">{renderToolOptions()}</div>
        </div>
      </div>
    </div>
  )
}

export default PropertiesPanel
