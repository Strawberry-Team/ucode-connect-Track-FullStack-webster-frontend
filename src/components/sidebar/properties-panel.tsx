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
  RotateCcw,
  ChevronDown,
  Brush,
  House,
  Eraser,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import NumberInputWithPopover from "@/components/ui/number-input-with-popover"
import type { MirrorMode } from "@/context/tool-context"

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

const MirrorSelector: React.FC<{
  value: MirrorMode;
  onChange: (value: MirrorMode) => void;
}> = ({ value, onChange }) => {
  const mirrorModeLabels: Record<MirrorMode, string> = {
    "None": "No",
    "Vertical": "Vertical",
    "Horizontal": "Horizontal",
    "Four-way": "Four-way"
  };

  return (
    <div className="flex items-center space-x-2">
      <Label className="text-[14px] text-[#D4D4D5FF] pl-3">Mirror mode:</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
          <Copy size={14} className="text-[#A8AAACFF]" />
          {mirrorModeLabels[value]}
          <ChevronDown size={12} className="text-white ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0">
        {Object.entries(mirrorModeLabels).map(([mode, label]) => (
          <DropdownMenuItem
            key={mode}
            className="flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer"
            onClick={() => onChange(mode as MirrorMode)}
          >
            {value === mode && <Check size={14} className="text-blue-400" />}
            <span className={value !== mode ? "ml-5" : ""}>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const PropertiesPanel: React.FC = () => {
  const { 
    activeTool, 
    activeElement, 
    color, 
    setColor, 
    brushSize, 
    setBrushSize, 
    eraserSize,
    setEraserSize,
    opacity, 
    setOpacity,
    eraserHardness,
    setEraserHardness,
    mirrorMode,
    setMirrorMode
  } = useTool()
  
  const [brushMenuOpen, setBrushMenuOpen] = useState(false)
  const opacityInputRef = useRef<HTMLInputElement>(null);

  const [tempOpacityInput, setTempOpacityInput] = useState<string>(() => 
    typeof opacity === 'number' && !isNaN(opacity) ? String(opacity) : "1"
  );

  useEffect(() => {
    if (document.activeElement !== opacityInputRef.current) {
      if (typeof opacity === 'number' && !isNaN(opacity)) {
        setTempOpacityInput(String(opacity));
      } else {
        setTempOpacityInput("1"); 
      }
    }
  }, [opacity]);

  const renderBrushOptions = () => {
    const brushPreviewBorderColor = lightenColor(color, 50);
    return (
      <div className="flex items-center space-x-2">
        <Brush strokeWidth={1.5} className="!w-5 !h-5 text-[#A8AAACFF] mr-2"/>
        <Popover open={brushMenuOpen} onOpenChange={setBrushMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1 h-8 pl-1 pr-1">
              <div 
                className="w-5 h-5 rounded-full border-2"
                style={{ backgroundColor: color, borderColor: brushPreviewBorderColor }}
              />
              <div className="relative flex flex-col items-center mt-1">
                <span className="text-xs text-white">{brushSize}</span>
                <ChevronDown size={12} className="text-[#A8AAACFF] -mt-1" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-52 p-3 bg-[#292C31FF] border-2 shadow-md">
            <div className="flex items-center space-x-2">
              <Slider id="brush-size" min={1} max={100} step={1} value={[brushSize]} onValueChange={(value) => setBrushSize(value[0])} className="flex-1"/>
              <span className="text-xs w-10 text-right text-white">{brushSize}px</span>
            </div>
          </PopoverContent>
        </Popover>

        <NumberInputWithPopover 
          label="Opacity"
          value={opacity}
          onChange={setOpacity}
          min={1}
          max={100}
          suffix="%"
        />
        
        <MirrorSelector value={mirrorMode} onChange={setMirrorMode} />
      </div>
    )
  }

  const renderEraserOptions = () => {
    return (
      <div className="flex items-center space-x-2">
        <Eraser strokeWidth={1.5} className="!w-5 !h-5 text-[#A8AAACFF] mr-2"/>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1 h-8 pl-1 pr-1">
              <div className="relative flex flex-col items-center mt-1">
                <span className="text-xs text-white">{eraserSize}</span>
                <ChevronDown size={12} className="text-[#A8AAACFF] -mt-1" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-52 p-3 bg-[#292C31FF] border-2 shadow-md">
            <div className="flex items-center space-x-2">
              <Slider id="eraser-size" min={1} max={100} step={1} value={[eraserSize]} onValueChange={(value) => setEraserSize(value[0])} className="flex-1" />
              <span className="text-xs w-10 text-right text-white">{eraserSize}px</span>
            </div>
          </PopoverContent>
        </Popover>

        <NumberInputWithPopover 
          label="Hardness"
          value={eraserHardness}
          onChange={setEraserHardness}
          min={0}
          max={100}
          suffix="%"
        />
        
        <MirrorSelector value={mirrorMode} onChange={setMirrorMode} />
      </div>
    );
  }

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
        <div className="flex-1 min-w-0">{renderToolOptions()}</div>
      </div>
      </div>
    </div>
  )
}

export default PropertiesPanel
