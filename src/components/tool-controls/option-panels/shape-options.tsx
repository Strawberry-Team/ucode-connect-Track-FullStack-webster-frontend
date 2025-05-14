import React, { useState, useEffect } from "react";
import { useTool } from "@/context/tool-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  RotateCcw,
  Square,
  ChevronDown,
  Circle,
  Image as ImageIcon,
  FileUp,
  MousePointerSquareDashed,
  RectangleHorizontal,
  Eclipse,
  Triangle as TriangleIcon,
  Pentagon,
  Hexagon,
  Star,
  Heart,
  ArrowRight,
  Minus,
  Check,
  FileImage,
  SquareRoundCorner,
  FlipHorizontal,
  FlipVertical,
  Squircle,
  Trash2,
  Copy,
  PlusCircle,
  Type
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import { lightenColor } from "./common";
import { TooltipContent, TooltipTrigger, Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import type { ShapeType, BorderStyle, Element } from "@/types/canvas";
import { useElementsManager } from "@/context/elements-manager-context";
import { ScrollArea } from "@/components/ui/scroll-area";

// Adding styles for scrollbar
const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 8px;
    background-color: #292C31;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #44474A;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-track {
    background-color: #292C31;
    border-radius: 4px;
  }
`;

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, setColor }) => {
  const presetColors = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#00ffff", "#ff00ff", "#c0c0c0", "#808080",
    "#800000", "#808000", "#008000", "#800080", "#008080", "#000080",
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: color }} />
        <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 p-0 border-0" />
      </div>
      <div className="grid grid-cols-8 gap-1">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            className="w-5 h-5 rounded border border-gray-600"
            style={{ backgroundColor: presetColor }}
            onClick={() => setColor(presetColor)}
          />
        ))}
      </div>
    </div>
  );
};

// Component for displaying a line style example
const BorderStylePreview: React.FC<{ style: BorderStyle }> = ({ style }) => {
  const borderStyle = style === 'solid' ? 'border-solid' :
    style === 'dashed' ? 'border-dashed' :
      style === 'dotted' ? 'border-dotted' :
        style === 'hidden' ? 'border-hidden' :
          style === 'double' ? 'border-double' : 'border-solid'; // Fallback to solid for other types

  return (
    <div className="w-8 h-0 border-t-2 border-white" style={{
      borderStyle: borderStyle === 'border-solid' ? 'solid' :
        borderStyle === 'border-dashed' ? 'dashed' :
          borderStyle === 'border-dotted' ? 'dotted' :
            borderStyle === 'border-double' ? 'double' :
              borderStyle === 'border-hidden' ? 'hidden' : 'solid',
    }} />
  );
};

const ShapeIcon: React.FC<{ type: ShapeType; className?: string }> = ({ type, className = "w-5 h-5" }) => {
  switch (type) {
    case "rectangle":
      return <RectangleHorizontal className={className} />;
    case "square":
      return <Square className={className} />;
    case "rounded-rectangle":
      return <SquareRoundCorner className={className} />;
    case "squircle":
      return <Squircle className={className} />;
    case "circle":
      return <Circle className={className} />;
    case "line":
      return <Minus className={className} />;
    case "triangle":
      return <TriangleIcon className={className} />;
    case "pentagon":
      return <Pentagon className={className} />;
    case "hexagon":
      return <Hexagon className={className} />;
    case "star":
      return <Star className={className} />;
    case "heart":
      return <Heart className={className} />;
    case "arrow":
      return <ArrowRight className={className} />;
    case "custom-image":
      return <FileImage className={className} />;
    default:
      return <Square className={className} />;
  }
};

// Names of shapes for display
const shapeNames: Record<ShapeType, string> = {
  "rectangle": "Rectangle",
  "square": "Square",
  "rounded-rectangle": "Rounded Rect",
  "squircle": "Squircle",
  "circle": "Circle",
  "line": "Line",
  "triangle": "Triangle",
  "pentagon": "Pentagon",
  "hexagon": "Hexagon",
  "star": "Star",
  "heart": "Heart",
  "arrow": "Arrow",
  "custom-image": "Custom Image",
};

// Names of border styles for display
const borderStyleNames: Record<BorderStyle, string> = {
  "solid": "Solid",
  "dashed": "Dashed",
  "dotted": "Dotted",
  "double": "Double",
  "hidden": "Hidden"
};

// Component for selecting a shape
const ShapeSelector: React.FC<{
  value: ShapeType;
  onChange: (value: ShapeType) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Label className="text-xs text-[#D4D4D5FF] pl-3">Shape:</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
            <ShapeIcon type={value} className="w-4 h-4 mr-1" />
            {/* <span>{shapeNames[value]}</span> */}
            <ChevronDown size={12} className="text-white" strokeWidth={1.5}/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 relative m-0"
        >
          <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
          <ScrollArea className="h-[110px]">
            <div className="grid grid-cols-4 gap-1 p-2">
              {(Object.keys(shapeNames) as ShapeType[]).filter(s => s !== "custom-image").map((type) => (
                <Button
                  key={type}
                  variant={value === type ? "secondary" : "ghost"}
                  className="h-7 flex items-center justify-start text-xs"
                  onClick={() => onChange(type)}
                >
                  <ShapeIcon type={type} className="w-5 h-5 mx-2" />
                  {/* {shapeNames[type]} */}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="sticky bottom-0 bg-[#292C31FF] pt-1 border-t border-[#44474AFF] mt-0">
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer">
              <label className="flex items-center w-full cursor-pointer">
                <FileUp size={14} className="mx-2" color="white" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log("Uploading image:", file.name);
                      onChange("custom-image");
                    }
                  }}
                />
              </label>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Component for selecting a border style
const BorderStyleSelector: React.FC<{
  value: BorderStyle;
  onChange: (value: BorderStyle) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Label className="text-xs text-[#D4D4D5FF] pl-3">Style:</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
            <BorderStylePreview style={value} />
            <span>{borderStyleNames[value]}</span>
            <ChevronDown size={12} className="text-white" strokeWidth={1.5}/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 relative m-0">
          <ScrollArea>
            {Object.entries(borderStyleNames).map(([styleKey, styleName]) => (
              <DropdownMenuItem
                key={styleKey}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#3F434AFF] cursor-pointer "
                onClick={() => onChange(styleKey as BorderStyle)}
              >
                <BorderStylePreview style={styleKey as BorderStyle} />
                <span>{styleName}</span>
                {value === styleKey && <Check size={14} className="ml-auto text-blue-400" />}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Declare type for global window object with Konva
declare global {
  interface Window {
    Konva?: any;
  }
}

const ShapeOptions: React.FC = () => {
  const {
    setActiveElement,
    activeElement,
    color,
    setColor,
    borderColor,
    setBorderColor,
    borderWidth,
    setBorderWidth,
    borderStyle,
    setBorderStyle,
    cornerRadius,
    setCornerRadius,
    opacity,
    setOpacity
  } = useTool();

  const { selectedElementIndex, duplicateSelectedElement, removeSelectedElement, flipSelectedElementHorizontal, flipSelectedElementVertical, rotateSelectedElement } = useElementsManager();

  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [borderColorMenuOpen, setBorderColorMenuOpen] = useState(false);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);

  const defaultShapes: ShapeType[] = [
    "rectangle", "square", "rounded-rectangle", "squircle", "circle",
    "line", "triangle", "pentagon", "hexagon", "star", "heart", "arrow"
  ];

  const handleShapeSelect = (type: ShapeType) => {
    const shapeElement: Element = {
      id: type,
      type,
      icon: getShapeIcon(type)
    };
    setActiveElement(shapeElement);
    setShapeMenuOpen(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          // Set custom image as active element
          const customImageElement: Element = {
            id: "custom-image",
            type: "custom-image",
            icon: FileImage
          };
          setActiveElement(customImageElement);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const getShapeIcon = (type: ShapeType) => {
    switch (type) {
      case "rectangle": return RectangleHorizontal;
      case "square": return Square;
      case "rounded-rectangle": return SquareRoundCorner;
      case "squircle": return Squircle;
      case "circle": return Circle;
      case "line": return Minus;
      case "triangle": return TriangleIcon;
      case "pentagon": return Pentagon;
      case "hexagon": return Hexagon;
      case "star": return Star;
      case "heart": return Heart;
      case "arrow": return ArrowRight;
      case "custom-image": return FileImage;
      default: return Square;
    }
  };

  // Handle opacity change
  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(Math.min(100, Math.max(0, newOpacity)));
  };

  const handleAddShape = () => {
    // Default to rectangle if no shape is selected
    handleShapeSelect("rectangle");
  };

  return (
    <div className="flex space-x-2 items-center h-full text-xs">
      {/* Add shape button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-7 gap-1 p-2 text-white text-xs hover:bg-[#3F434AFF] rounded"
            onClick={handleAddShape}>
            <PlusCircle size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add shape</p>
        </TooltipContent>
      </Tooltip>

      {/* Duplicate button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={`flex h-7 gap-1 p-2 text-white text-xs hover:bg-[#3F434AFF] rounded ${selectedElementIndex === null ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={duplicateSelectedElement}
            disabled={selectedElementIndex === null}>
            <Copy size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Duplicate shape</p>
        </TooltipContent>
      </Tooltip>

      {/* Delete button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={`flex h-7 gap-1 p-2 text-white text-xs hover:bg-[#3F434AFF] rounded ${selectedElementIndex === null ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={removeSelectedElement}
            disabled={selectedElementIndex === null}>
            <Trash2 size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete shape</p>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Shape selector */}
      <ShapeSelector value={activeElement?.type as ShapeType || "rectangle"} onChange={handleShapeSelect} />

      {/* Fill color
      <Popover open={colorMenuOpen} onOpenChange={setColorMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]">
            <div className="w-5 h-5 rounded-xl border border-gray-500" style={{ backgroundColor: color }} />
            <span>Fill</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-[#292C31FF] border-2 border-[#44474AFF]">
          <ColorPicker color={color} setColor={setColor} />
        </PopoverContent>
      </Popover> */}

      {/* Fill color picker */}
      <Popover open={colorMenuOpen} onOpenChange={setColorMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]">
          <p className="text-xs text-[#D4D4D5FF]">Fill</p>
            <div className="w-5 h-5 rounded-xl border border-gray-500" style={{ backgroundColor: color === 'transparent' ? '#ffffff' : color }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-[#292C31FF] border-2 border-[#44474AFF]">
          <div className="space-y-5">

            {/* Fill color opacity slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-[#D4D4D5FF]">Opacity:</Label>
                <span className="text-xs text-[#D4D4D5FF]">{opacity}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity ?? 100}
                  onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
                  className="h-1.5 w-full p-0 m-0"
                />
              </div>
            </div>

            {/* Transparent option */}
            <Button
              variant="ghost"
              className="text-xs text-white rounded hover:bg-[#3F434AFF] w-full h-7 border-2 border-[#44474AFF]"
              onClick={() => setColor('transparent')}
            >
              Transparent background
            </Button>

            <ColorPicker color={color === 'transparent' ? '#ffffff' : color} setColor={setColor} />
          </div>
        </PopoverContent>
      </Popover>

      {/* Opacity
      <NumberInputWithPopover 
        label="Opacity" 
        value={opacity} 
        onChange={handleOpacityChange} 
        min={0} 
        max={100} 
        step={1} 
        suffix="%" 
      /> */}

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Border color */}
      <Popover open={borderColorMenuOpen} onOpenChange={setBorderColorMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]">
            <p className="text-xs text-[#D4D4D5FF]">Border</p>
            <div className="w-5 h-5 rounded-xl border border-gray-500" style={{ backgroundColor: borderColor }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-[#292C31FF] border-2 border-[#44474AFF]">
          <ColorPicker color={borderColor} setColor={setBorderColor} />
        </PopoverContent>
      </Popover>

      {/* Border width */}
      <NumberInputWithPopover
        label="Width"
        value={borderWidth}
        onChange={setBorderWidth}
        min={0}
        max={20}
        step={1}
        suffix="px"
      />

      {/* Border style */}
      <BorderStyleSelector value={borderStyle} onChange={setBorderStyle} />

      {/* Corner radius (only for rounded rectangle) */}
      {(activeElement?.type === "rounded-rectangle") && (
        <NumberInputWithPopover
          label="Radius"
          value={cornerRadius}
          onChange={setCornerRadius}
          min={0}
          max={50}
          step={1}
          suffix="px"
        />
      )}

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Text alignment */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={`flex items-center h-7 px-2 gap-2 text-xs text-white rounded hover:bg-[#3F434AFF] ${selectedElementIndex !== null ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Label className="text-xs text-[#D4D4D5FF]">Transform</Label>
            {/* <Type size={14} /> */}
            <ChevronDown size={12} className="text-white" strokeWidth={1.5}/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 min-w-[100px] grid grid-cols-3">

          {/* Transform controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              
              <DropdownMenuItem
                className={`flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none ${selectedElementIndex !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={flipSelectedElementHorizontal}
                disabled={selectedElementIndex !== null}>
                <FlipHorizontal size={14} color="white" />
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip horizontally</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                className={`flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none ${selectedElementIndex !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={flipSelectedElementVertical}
                disabled={selectedElementIndex !== null}>
                <FlipVertical size={14} color="white" />
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip vertically</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                className={`flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none ${selectedElementIndex !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => rotateSelectedElement(90)}
                disabled={selectedElementIndex !== null}>
                <RotateCcw size={14} color="white" />
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rotate</p>
            </TooltipContent>
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Upload custom image
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-8 h-7 p-0 hover:bg-[#3F434AFF]" 
            onClick={() => document.getElementById('upload-image')?.click()}>
            <FileUp size={14} />
            <input 
              id="upload-image" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload} 
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload image</p>
        </TooltipContent>
      </Tooltip> */}
    </div>
  );
};

export default ShapeOptions; 