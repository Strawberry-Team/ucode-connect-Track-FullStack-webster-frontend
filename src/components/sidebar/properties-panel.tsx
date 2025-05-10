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
} from "lucide-react"
import { Button } from "@/components/ui/button"

const PropertiesPanel: React.FC = () => {
  const { activeTool, activeElement, color, setColor, brushSize, setBrushSize, opacity, setOpacity, zoom, setZoom } =
    useTool()

  if (!activeTool && !activeElement) {
    return null
  }

  const renderBrushOptions = () => (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <Label htmlFor="brush-size" className="text-xs">
          Size
        </Label>
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
          <span className="text-xs w-8 text-right">{brushSize}px</span>
        </div>
      </div>

      <div className="flex-1">
        <Label htmlFor="opacity" className="text-xs">
          Opacity
        </Label>
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

      <div>
        <Label htmlFor="color" className="text-xs">
          Color
        </Label>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: color }} />
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border-0"
          />
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
    if (activeTool?.id === "brush" || activeTool?.id === "eraser") {
      return renderBrushOptions()
    } else if (activeTool?.id === "text") {
      return renderTextOptions()
    } else if (activeElement || activeTool?.id === "shape") {
      return renderShapeOptions()
    }

    return null
  }

  return (
    <div className="bg-[#2a2a2a] border-b border-[#1a1a1a] p-2">
      <div className="flex justify-between items-center">
        <div className="flex-1">{renderToolOptions()}</div>

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
