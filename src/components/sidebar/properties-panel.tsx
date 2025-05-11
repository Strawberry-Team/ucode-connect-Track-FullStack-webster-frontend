import type React from "react"
import { useTool } from "@/context/tool-context"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Square,
  Minus,
  Plus,
  RotateCcw,
  ChevronDown,
  Brush,
  House,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const PropertiesPanel: React.FC = () => {
  const { 
    activeTool, 
    activeElement, 
    color, 
    setColor, 
    secondaryColor,
    setSecondaryColor,
    swapColors,
    brushSize, 
    setBrushSize, 
    eraserSize,
    setEraserSize,
    opacity, 
    setOpacity,
    eraserOpacity,
    setEraserOpacity,
    eraserHardness,
    setEraserHardness,
    zoom, 
    setZoom 
  } = useTool()
  
  const [brushMenuOpen, setBrushMenuOpen] = useState(false)

  if (!activeTool && !activeElement) {
    return null
  }

  const renderBrushOptions = () => (
    <div className="flex items-center space-x-4">
      <Popover open={brushMenuOpen} onOpenChange={setBrushMenuOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center space-x-1">
            <Brush strokeWidth={1.5} className="!w-5 !h-5 text-[#A8AAACFF]"/>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-1 h-8 pl-2 pr-1 border-gray-600"
            >
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: color }} 
              />
              <div className="relative inline-flex items-center -mt-2">
                <span className="text-xs">{brushSize}</span>
                <ChevronDown size={14} className="absolute left-1/2 transform -translate-x-1/2 translate-y-full -mt-2"/>
              </div>
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-[#2a2a2a] border-[#1a1a1a]">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Slider
                  id="brush-size"
                  min={1}
                  max={100}
                  step={1}
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-right text-white">{brushSize}px</span>
              </div>
            </div>
            
            
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-80 flex-1 ml-4">
        
        <div className="flex items-center space-x-2">
          <Slider
            id="opacity"
            min={1}
            max={100}
            step={1}
            value={[opacity]}
            onValueChange={(value) => setOpacity(value[0])}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{opacity}%</span>
        </div>
      </div>
    </div>
  )

  const renderEraserOptions = () => (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <Label htmlFor="eraser-size" className="text-xs">
          Size
        </Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="eraser-size"
            min={1}
            max={100}
            step={1}
            value={[eraserSize]}
            onValueChange={(value) => setEraserSize(value[0])}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{eraserSize}px</span>
        </div>
      </div>

      <div className="flex-1">
        <Label htmlFor="eraser-opacity" className="text-xs">
          Opacity
        </Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="eraser-opacity"
            min={1}
            max={100}
            step={1}
            value={[eraserOpacity]}
            onValueChange={(value) => setEraserOpacity(value[0])}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{eraserOpacity}%</span>
        </div>
      </div>

      <div className="flex-1">
        <Label htmlFor="eraser-hardness" className="text-xs">
          Hardness
        </Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="eraser-hardness"
            min={0}
            max={100}
            step={1}
            value={[eraserHardness]}
            onValueChange={(value) => setEraserHardness(value[0])}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{eraserHardness}%</span>
        </div>
      </div>
    </div>
  )

  const renderShapeOptions = () => (
    <div className="flex items-center space-x-4">
      <div>
        <Label htmlFor="shape-color" className="text-xs">
          Fill
        </Label>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: color }} />
          <Input
            id="shape-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border-0"
          />
        </div>
      </div>

      <div className="flex-1">
        <Label htmlFor="shape-opacity" className="text-xs">
          Opacity
        </Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="shape-opacity"
            min={1}
            max={100}
            step={1}
            value={[opacity]}
            onValueChange={(value) => setOpacity(value[0])}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{opacity}%</span>
        </div>
      </div>

      <div>
        <Label className="text-xs">Transform</Label>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" className="w-8 h-8">
            <RotateCcw size={14} />
          </Button>
          <Button variant="ghost" className="w-8 h-8">
            <Square size={14} />
          </Button>
        </div>
      </div>
    </div>
  )

  const renderTextOptions = () => (
    <div className="flex items-center space-x-4">
      <div>
        <Label htmlFor="text-color" className="text-xs">
          Color
        </Label>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: color }} />
          <Input
            id="text-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border-0"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Font</Label>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" className="w-8 h-8">
            <Bold size={14} />
          </Button>
          <Button variant="ghost" className="w-8 h-8">
            <Italic size={14} />
          </Button>
          <Button variant="ghost" className="w-8 h-8">
            <Underline size={14} />
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-xs">Align</Label>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" className="w-8 h-8">
            <AlignLeft size={14} />
          </Button>
          <Button variant="ghost" className="w-8 h-8">
            <AlignCenter size={14} />
          </Button>
          <Button variant="ghost" className="w-8 h-8">
            <AlignRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  )

  const renderToolOptions = () => {
    if (activeTool?.id === "brush") {
      return renderBrushOptions()
    } else if (activeTool?.id === "eraser") {
      return renderEraserOptions()
    } else if (activeTool?.id === "text") {
      return renderTextOptions()
    } else if (activeElement || activeTool?.id === "shape") {
      return renderShapeOptions()
    }

    return null
  }

  return (
    <div className="h-12 w-full bg-[#292C31FF] p-2">
      <div className="flex justify-between items-center">
      <div className="flex items-center">
        <House className="cursor-pointer !w-5 !h-5 ml-2.5 text-[#A8AAACFF] hover:text-white"/>
        <div className="border-l-2 border-[#44474AFF] h-8 mx-5"></div>
        <div className="flex-1">{renderToolOptions()}</div>
      </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button variant="ghost" className="w-8 h-8" onClick={() => setZoom(Math.max(10, zoom - 10))}>
            <Minus size={14} />
          </Button>

          <div className="flex items-center space-x-1">
            <Input
              type="number"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-16 h-8 text-xs"
            />
            <span className="text-xs">%</span>
          </div>

          <Button variant="ghost" className="w-8 h-8" onClick={() => setZoom(Math.min(500, zoom + 10))}>
            <Plus size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PropertiesPanel
