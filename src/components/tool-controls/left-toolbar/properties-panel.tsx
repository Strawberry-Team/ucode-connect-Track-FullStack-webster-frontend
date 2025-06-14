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
  ImageTransformOptions,
  BackgroundOptions
} from "./option-panels"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const PropertiesPanel: React.FC = () => {
  const { activeTool, hasEverSelectedTool, projectName } = useTool()
  const navigate = useNavigate()

  // Get project name from URL or context, prioritizing context over URL
  const urlParams = new URLSearchParams(window.location.search)
  const projectNameFromUrl = urlParams.get('name')
  const projectIdFromUrl = urlParams.get('projectId')

  // If we have a projectId, prefer the context projectName (which comes from saved data)
  // If no projectId, use URL name for new projects
  const currentProjectName = projectName || (projectNameFromUrl && !projectIdFromUrl ? decodeURIComponent(projectNameFromUrl) : null)

  const handleNavigateHome = () => {
    navigate('/', { state: { showDashboard: true } });
  };

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
      case "background":
        return <BackgroundOptions />
      case "crop":
        return <CropOptions />
      case "hand":
        return <HandOptions />
      default:
        return null
    }
  };

  const showProjectName = !activeTool && currentProjectName;
  const showToolOptions = activeTool;

  return (
    <div className="h-12 w-full bg-[#292C31FF] p-2">
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <House
                  className="cursor-pointer !w-5 !h-5 ml-2.5 text-[#A8AAACFF] hover:text-white shrink-0"
                  onClick={handleNavigateHome}
                />
              </TooltipTrigger>
              <TooltipContent side="right" align="center" sideOffset={12}>
                <p>Home page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="border-l-2 border-[#44474AFF] h-8 mx-5"></div>


          {showToolOptions && (
            <div className="flex items-center">
              {renderToolOptions()}
            </div>
          )}
        </div>

        {showProjectName && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center text-white/80 text-sm">
            Project "<span>{currentProjectName}</span>"
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertiesPanel