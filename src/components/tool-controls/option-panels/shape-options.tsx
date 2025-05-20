import React, { useState, useEffect, useRef } from "react";
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
import type { ShapeType, BorderStyle, Element, Tool, ElementData } from "@/types/canvas";
import { useElementsManager } from "@/context/elements-manager-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import ColorPicker from "@/components/color-picker/color-picker";
import { Slider } from "@/components/ui/slider";

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

// interface ColorPickerProps {
//   color: string;
//   setColor: (color: string) => void;
// }

// const ColorPicker: React.FC<ColorPickerProps> = ({ color, setColor }) => {
//   const presetColors = [
//     "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
//     "#ffff00", "#00ffff", "#ff00ff", "#c0c0c0", "#808080",
//     "#800000", "#808000", "#008000", "#800080", "#008080", "#000080",
//   ];

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center space-x-2">
//         <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: color }} />
//         <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 p-0 border-0" />
//       </div>
//       <div className="grid grid-cols-8 gap-1">
//         {presetColors.map((presetColor) => (
//           <button
//             key={presetColor}
//             className="w-5 h-5 rounded border border-gray-600"
//             style={{ backgroundColor: presetColor }}
//             onClick={() => setColor(presetColor)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

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
      return <RectangleHorizontal className={className} />;
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
  onMenuWillOpen: () => void;
}> = ({ value, onChange, onMenuWillOpen }) => {
  return (
    <div className="flex items-center space-x-2">
      <Label className="text-xs text-[#D4D4D5FF] pl-3">Shape:</Label>
      <DropdownMenu onOpenChange={(isOpen) => { if (isOpen) onMenuWillOpen(); }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
            <ShapeIcon type={value} className="w-4 h-4 mr-1" />
            <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
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
                  variant="ghost"
                  className={`h-7 flex items-center justify-start text-xs hover:bg-[#3F434AFF] ${value === type ? "bg-[#3F434AFF] rounded-sm" : ""}`}
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
  onMenuWillOpen: () => void;
}> = ({ value, onChange, onMenuWillOpen }) => {
  return (
    <div className="flex items-center space-x-2">
      <Label className="text-xs text-[#D4D4D5FF] pl-3">Style:</Label>
      <DropdownMenu onOpenChange={(isOpen) => { if (isOpen) onMenuWillOpen(); }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
            <BorderStylePreview style={value} />
            <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 relative m-0">
          <ScrollArea>
            {Object.entries(borderStyleNames).map(([styleKey, styleName]) => (
              <DropdownMenuItem
                key={styleKey}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:rounded-sm hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] ${value === styleKey ? "bg-[#3F434AFF] rounded-sm text-white" : ""}`}
                onClick={() => onChange(styleKey as BorderStyle)}
              >
                <BorderStylePreview style={styleKey as BorderStyle} />
                <span className="text-white">{styleName}</span>
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

// Define a type to track current shape settings
interface ShapeSettings {
  fillColor: string;
  fillColorOpacity: number;
  borderColor: string;
  borderWidth: number;
  borderStyle: BorderStyle;
  cornerRadius: number;
  opacity: number;
  transform: {
    rotate: number;
    scaleX: number;
    scaleY: number;
  };
}

type ShapeTransformType = {
  rotate: number;
  scaleX: number;
  scaleY: number;
};

const ShapeOptions: React.FC = () => {
  const {
    setActiveElement: setContextActiveElement,
    activeTool,
    activeElement,
    fillColor,
    setFillColor,
    fillColorOpacity,
    setFillColorOpacity,
    borderColor,
    setBorderColor,
    borderWidth,
    setBorderWidth,
    borderStyle,
    setBorderStyle,
    borderColorOpacity,
    setBorderColorOpacity,
    cornerRadius,
    setCornerRadius,
    shapeType,
    setShapeType,
    shapeTransform,
    setShapeTransform,
    isAddModeActive,
    setIsAddModeActive,
    currentAddToolType,
    setCurrentAddToolType,
    setActiveTool: setContextActiveTool,
  } = useTool();

  const {
    selectedElementId,
    duplicateSelectedElement,
    removeSelectedElement,
    getElementDataFromRenderables,
    updateSelectedElementStyle,
    flipSelectedElementHorizontal,
    flipSelectedElementVertical,
    rotateSelectedElement
  } = useElementsManager();

  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [borderColorMenuOpen, setBorderColorMenuOpen] = useState(false);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [showFillColorPicker, setShowFillColorPicker] = useState(false);
  const fillColorOpacityInputRef = useRef<HTMLInputElement>(null);
  const [tempFillColorOpacityInput, setTempFillColorOpacityInput] = useState<string>(() => String(Math.round(fillColorOpacity)));
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const borderColorOpacityInputRef = useRef<HTMLInputElement>(null);
  const [tempBorderColorOpacityInput, setTempBorderColorOpacityInput] = useState<string>(() => String(Math.round(borderColorOpacity)));

  // Refs for opacity/transparent control containers
  const fillControlsRef = useRef<HTMLDivElement>(null!);
  const borderControlsRef = useRef<HTMLDivElement>(null!);

  const defaultShapes: ShapeType[] = [
    "rectangle", "square", "rounded-rectangle", "squircle", "circle",
    "line", "triangle", "pentagon", "hexagon", "star", "heart", "arrow"
  ];

  const selectedElementData = selectedElementId ? getElementDataFromRenderables().find(el => el.id === selectedElementId) : null;

  let isConsideredShapeType = false;
  if (selectedElementData) {
    // An element is considered a shape if its type is not "text".
    // This includes all ShapeType values (rectangle, circle, custom-image, etc.)
    if (selectedElementData.type !== 'text') {
      isConsideredShapeType = true;
    }
  }

  const isShapeElementSelected = selectedElementId !== null &&
    selectedElementData !== null && // Ensure element is found
    isConsideredShapeType &&        // Ensure it's a shape/image type
    (activeTool?.type === "shape" || activeTool?.type === "cursor"); // Allow if shape or cursor tool is active

  // Sync tool state with selected element
  useEffect(() => {
    if (selectedElementId !== null) {
      const elements = getElementDataFromRenderables();
      const selectedElement = elements.find(el => el.id === selectedElementId);
      // Ensure we only sync if a shape element is selected
      if (selectedElement && selectedElement.type !== "text") {
        setFillColor(selectedElement.fillColor || "#ffffff");
        setFillColorOpacity(selectedElement.fillColorOpacity !== undefined ? selectedElement.fillColorOpacity : 100);
        setBorderColor(selectedElement.borderColor || "#000000");
        setBorderColorOpacity(selectedElement.borderColorOpacity !== undefined ? selectedElement.borderColorOpacity : 100);
        setBorderWidth(selectedElement.borderWidth !== undefined ? selectedElement.borderWidth : 2);
        setBorderStyle(selectedElement.borderStyle || "solid");
        if (selectedElement.type === "rounded-rectangle") {
          setCornerRadius(selectedElement.cornerRadius || 0);
        }

        setShapeTransform({
          rotate: selectedElement.rotation || 0,
          scaleX: selectedElement.scaleX || 1,
          scaleY: selectedElement.scaleY || 1
        });

        // Check if selectedElement.type is a valid ShapeType before casting
        const knownShapeTypes: readonly ShapeType[] = ["rectangle", "square", "rounded-rectangle", "squircle", "circle", "line", "triangle", "pentagon", "hexagon", "star", "heart", "arrow", "custom-image"];
        if (knownShapeTypes.includes(selectedElement.type as ShapeType)) {
          setShapeType(selectedElement.type as ShapeType);
        }

      }
    }
  }, [selectedElementId, getElementDataFromRenderables, activeTool?.type, setFillColor, setFillColorOpacity, setBorderColor, setBorderColorOpacity, setBorderWidth, setBorderStyle, setCornerRadius, setShapeTransform, setShapeType]);

  // Update selected element when shape settings change
  useEffect(() => {
    // Update if a non-text element is selected and its properties are being changed
    if (selectedElementId && selectedElementData && selectedElementData.type !== "text") {
      const updatedStyles: Partial<ElementData> = {
        fillColor,
        fillColorOpacity,
        borderColor,
        borderColorOpacity,
        borderWidth,
        borderStyle,
        opacity: fillColorOpacity,
        rotation: shapeTransform.rotate,
        scaleX: shapeTransform.scaleX,
        scaleY: shapeTransform.scaleY
      };
      if (selectedElementData.type === "rounded-rectangle") {
        updatedStyles.cornerRadius = cornerRadius;
      }
      updateSelectedElementStyle(updatedStyles);

    }
  }, [
    fillColor,
    fillColorOpacity,
    borderColor,
    borderColorOpacity,
    borderWidth,
    borderStyle,
    cornerRadius,
    shapeTransform,
    selectedElementId, // Keep selectedElementId
    // getElementDataFromRenderables, // remove this if selectedElementData is used
    updateSelectedElementStyle,
    selectedElementData // Add this
  ]);

  const handleShapeSelect = (type: ShapeType) => {
    setShapeType(type);
    if (type === "custom-image") {
      console.log("Custom image selected, awaiting upload through ShapeSelector");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const customImageElement: Element & { src?: string, width?: number, height?: number } = {
            id: "custom-image-active",
            type: "custom-image",
            icon: FileImage,
            src: img.src,
            width: img.width,
            height: img.height,
          };
          setContextActiveElement(customImageElement as Element);
          const shapeTool: Tool = { id: "shape-tool", name: "Shape", type: "shape", icon: getShapeIcon("custom-image") };
          setContextActiveTool(shapeTool);
          setIsAddModeActive(true);
          setCurrentAddToolType("custom-image");
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddShape = () => {
    const currentShapeIcon = getShapeIcon(shapeType);

    const shapeElementTemplate: Element = {
      id: `${shapeType}-template`,
      type: shapeType,
      icon: currentShapeIcon,
      settings: {
        fillColor,
        fillColorOpacity,
        borderColor,
        borderWidth,
        borderStyle,
        borderColorOpacity,
        cornerRadius: shapeType === "rounded-rectangle" ? cornerRadius : undefined,
        opacity: fillColorOpacity
      }
    };
    setContextActiveElement(shapeElementTemplate);

    setIsAddModeActive(true);
    setCurrentAddToolType(shapeType);
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

  const handleFlipHorizontal = () => {
    if (!isShapeElementSelected) return; // Use updated condition
    const newTransform = {
      ...shapeTransform,
      scaleX: shapeTransform.scaleX * -1,
    };
    setShapeTransform(newTransform);
    if (selectedElementId) {
      flipSelectedElementHorizontal();
    }
  };

  const handleFlipVertical = () => {
    if (!isShapeElementSelected) return; // Use updated condition
    const newTransform = {
      ...shapeTransform,
      scaleY: shapeTransform.scaleY * -1,
    };
    setShapeTransform(newTransform);
    if (selectedElementId) {
      flipSelectedElementVertical();
    }
  };

  const handleRotate = (degrees: number) => {
    if (!isShapeElementSelected) return; // Use updated condition
    const newTransform = {
      ...shapeTransform,
      rotate: (shapeTransform.rotate + degrees + 360) % 360,
    };
    setShapeTransform(newTransform);
    if (selectedElementId) {
      rotateSelectedElement(degrees);
    }
  };

  const resetAllStyles = () => {
    setShapeType("rectangle");
    setFillColor("#ffffff");
    setFillColorOpacity(100);
    setTempFillColorOpacityInput("100");
    setBorderColor("#000000");
    setBorderColorOpacity(100);
    setTempBorderColorOpacityInput("100");
    setBorderWidth(2);
    setBorderStyle("solid");
    setCornerRadius(0);
    setBorderColorOpacity(100);
    setShapeTransform({
      rotate: 0,
      scaleX: 1,
      scaleY: 1
    });

    if (selectedElementId !== null) {
      updateSelectedElementStyle({
        fillColor: "#ffffff",
        fillColorOpacity: 100,
        borderColor: "#000000",
        borderWidth: 2,
        borderStyle: "solid",
        borderColorOpacity: 100,
        cornerRadius: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      });
    }
  };

  const handleFillColorOpacitySliderValueChange = (value: number[]) => {
    const newFillColorOpacity = Math.round(value[0]);
    setFillColorOpacity(newFillColorOpacity);
    setTempFillColorOpacityInput(String(newFillColorOpacity));
  };

  const handleFillColorOpacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    inputValue = inputValue.replace(/[^\d]/g, "");

    if (inputValue === "") {
      setTempFillColorOpacityInput("");
      return;
    }

    let num = parseInt(inputValue, 10);

    if (isNaN(num)) {
      setTempFillColorOpacityInput(inputValue);
      return;
    }

    if (num > 100) {
      num = 100;
      inputValue = String(100);
    }

    setTempFillColorOpacityInput(inputValue);
  };

  const handleFillColorOpacityInputBlur = () => {
    let currentNum = parseInt(tempFillColorOpacityInput, 10);

    if (isNaN(currentNum) || tempFillColorOpacityInput.trim() === "") {
      currentNum = 0; // Default to 0 if input is invalid
    }
    currentNum = Math.max(0, Math.min(100, currentNum));
    setFillColorOpacity(currentNum);
    setTempFillColorOpacityInput(String(currentNum));
  };

  const handleBorderColorOpacitySliderValueChange = (value: number[]) => {
    const newBorderColorOpacity = Math.round(value[0]);
    setBorderColorOpacity(newBorderColorOpacity);
    setTempBorderColorOpacityInput(String(newBorderColorOpacity));
  };

  const handleBorderColorOpacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    inputValue = inputValue.replace(/[^\d]/g, "");
    if (inputValue === "") {
      setTempBorderColorOpacityInput("");
      return;
    }
    let num = parseInt(inputValue, 10);
    if (isNaN(num)) {
      setTempBorderColorOpacityInput(inputValue);
      return;
    }
    if (num > 100) num = 100;
    setTempBorderColorOpacityInput(String(num));
  };

  const handleBorderColorOpacityInputBlur = () => {
    let currentNum = parseInt(tempBorderColorOpacityInput, 10);
    if (isNaN(currentNum) || tempBorderColorOpacityInput.trim() === "") currentNum = 0;
    currentNum = Math.max(0, Math.min(100, currentNum));
    setBorderColorOpacity(currentNum);
    setTempBorderColorOpacityInput(String(currentNum));
  };

  // Helper function to convert hex/rgb and opacity (0-100) to RGBA string
  const colorToRGBA = (color: string, opacityPercent: number): string => {
    if (color === 'transparent') {
      return `rgba(0,0,0,0)`; // Fully transparent
    }
    const opacity = Math.max(0, Math.min(100, opacityPercent)) / 100;
    let r = 0, g = 0, b = 0;

    if (color.startsWith('#')) {
      const hex = color.substring(1);
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    } else if (color.startsWith('rgb')) { // Basic rgb() and rgba() support
      const parts = color.match(/\d+/g);
      if (parts && parts.length >= 3) {
        r = parseInt(parts[0], 10);
        g = parseInt(parts[1], 10);
        b = parseInt(parts[2], 10);
        // Opacity from rgba() string is ignored, opacityPercent argument takes precedence
      }
    } else {
      // For named colors, this basic converter won't work without a canvas trick or a library.
      // However, for the preview, we can try to render it and let the browser handle it.
      // For a consistent RGBA preview, it's better to ensure input is hex/rgb or use a robust parser.
      console.warn("Basic colorToRGBA cannot derive RGB from named color for preview: ", color);
      // Fallback for preview: return the color itself if not transparent, opacity might not apply visually in all contexts with named colors.
      return opacity === 1 ? color : `rgba(0,0,0,${opacity})`; // Fallback to black with opacity if color is unknown and not fully opaque
    }
    return `rgba(${r},${g},${b},${opacity})`;
  };

  const renderColorPickers = () => (
    <>
      {/* Fill Color Picker */}
      <div className="relative">
        <Button
          variant="ghost"
          className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]"
          onClick={() => setShowFillColorPicker(!showFillColorPicker)}
        >
          <p className="text-xs text-[#D4D4D5FF]">Fill</p>
          <div
            className="w-5 h-5 rounded-xl border border-gray-500"
            style={{
              backgroundColor: colorToRGBA(fillColor, fillColorOpacity)
            }}
          />
        </Button>
        {showFillColorPicker && (
          <div className="absolute z-50 top-full left-0 mt-2">
            {/* Fill color opacity control */}
            <div ref={fillControlsRef} className="mt-0 p-2 bg-[#292C31FF] border border-[#44474AFF] rounded flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-[#D4D4D5FF]">Opacity:</Label>
                <div
                  className="flex items-center h-6 bg-[#202225FF] border-2 border-[#44474AFF] rounded px-1.5 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text"
                  onClick={() => fillColorOpacityInputRef.current?.focus()}
                >
                  <Input
                    ref={fillColorOpacityInputRef}
                    type="text"
                    value={tempFillColorOpacityInput}
                    onChange={handleFillColorOpacityInputChange}
                    onBlur={handleFillColorOpacityInputBlur}
                    onKeyDown={(e) => { if (e.key === 'Enter') fillColorOpacityInputRef.current?.blur(); }}
                    className="w-7 bg-transparent border-none text-xs text-white text-center focus:ring-0 p-0"
                    maxLength={3}
                  />
                  <span className="text-xs text-[#A8AAACFF]">%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Slider
                  id="fill-color-opacity-slider"
                  min={0}
                  max={100}
                  step={1}
                  value={[fillColorOpacity]}
                  onValueChange={handleFillColorOpacitySliderValueChange}
                  className="flex-grow"
                />
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2 p-1 text-xs text-white border-1 border-[#44474AFF]"
                onClick={(e) => {
                  // e.stopPropagation();
                  setFillColor('#ffffff');
                  setFillColorOpacity(0);
                  setTempFillColorOpacityInput("0");
                }}
              >
                Transparent
              </Button>
            </div>
            <ColorPicker
              color={fillColor === 'transparent' ? '#ffffff' : fillColor}
              setColor={(newColor) => {
                setFillColor(newColor);
                if (newColor === 'transparent') {
                  setFillColorOpacity(0);
                  setTempFillColorOpacityInput("0");
                }
              }}
              onClose={() => setShowFillColorPicker(false)}
              additionalRefs={[fillControlsRef]}
            />
          </div>
        )}
      </div>

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Border Color Picker */}
      <div className="relative">
        <Button
          variant="ghost"
          className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]"
          onClick={() => setShowBorderColorPicker(!showBorderColorPicker)}
        >
          <p className="text-xs text-[#D4D4D5FF]">Border</p>
          <div
            className="w-5 h-5 rounded-xl border border-gray-500"
            style={{
              backgroundColor: colorToRGBA(borderColor, borderColorOpacity)
            }}
          />
        </Button>
        {showBorderColorPicker && (
          <div className="absolute z-50 top-full left-0 mt-2">
            {/* Border color opacity control */}
            <div ref={borderControlsRef} className="mt-0 p-2 bg-[#292C31FF] border border-[#44474AFF] rounded flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-[#D4D4D5FF]">Opacity:</Label>
                <div
                  className="flex items-center h-6 bg-[#202225FF] border-2 border-[#44474AFF] rounded px-1.5 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text"
                  onClick={() => borderColorOpacityInputRef.current?.focus()}
                >
                  <Input
                    ref={borderColorOpacityInputRef}
                    type="text"
                    value={tempBorderColorOpacityInput}
                    onChange={handleBorderColorOpacityInputChange}
                    onBlur={handleBorderColorOpacityInputBlur}
                    onKeyDown={(e) => { if (e.key === 'Enter') borderColorOpacityInputRef.current?.blur(); }}
                    className="w-7 bg-transparent border-none text-xs text-white text-center focus:ring-0 p-0"
                    maxLength={3}
                  />
                  <span className="text-xs text-[#A8AAACFF]">%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Slider
                  id="text-bg-opacity-slider"
                  min={0}
                  max={100}
                  step={1}
                  value={[borderColorOpacity]}
                  onValueChange={handleBorderColorOpacitySliderValueChange}
                  className="flex-grow"
                />
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2 p-1 text-xs text-white border-1 border-[#44474AFF]"
                onClick={(e) => {
                  // e.stopPropagation();
                  setBorderColor('#ffffff');
                  setBorderColorOpacity(0);
                  setTempBorderColorOpacityInput("0");
                }}
              >
                Transparent
              </Button>
            </div>
            <ColorPicker
              color={borderColor === 'transparent' ? '#ffffff' : borderColor}
              setColor={(newColor) => {
                setBorderColor(newColor);
                if (newColor === 'transparent') {
                  setBorderColorOpacity(0);
                  setTempBorderColorOpacityInput("0");
                }
              }}
              onClose={() => setShowBorderColorPicker(false)}
              additionalRefs={[borderControlsRef]}
            />
          </div>
        )}
      </div>
    </>
  );

  const closeOtherPickers = () => {
    setShowFillColorPicker(false);
    setShowBorderColorPicker(false);
  };

  return (
    <div className="flex space-x-2 items-center h-full text-xs">
      {/* Add shape button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`flex h-7 gap-1 p-2 text-white text-xs hover:bg-[#3F434AFF] rounded ${activeTool?.type === "shape" && isAddModeActive && currentAddToolType === shapeType
                  ? "bg-[#3F434AFF] text-white"
                  : "text-[#D4D4D5FF]"
                }`}
              onClick={handleAddShape}>
              <PlusCircle size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add shape</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Duplicate button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`flex h-7 gap-1 p-2 text-xs hover:bg-[#3F434AFF] rounded ${!isShapeElementSelected ? 'opacity-50 cursor-not-allowed text-[#D4D4D5FF]' : 'text-white'
                }`}
              onClick={duplicateSelectedElement}
              disabled={!isShapeElementSelected}>
              <Copy size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Duplicate shape</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Delete button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`flex h-7 gap-1 p-2 text-xs hover:bg-[#3F434AFF] rounded ${!isShapeElementSelected ? 'opacity-50 cursor-not-allowed text-[#D4D4D5FF]' : 'text-white'
                }`}
              onClick={removeSelectedElement}
              disabled={!isShapeElementSelected}>
              <Trash2 size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete shape</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Shape selector and Image Upload handling logic */}
      <ShapeSelector
        value={shapeType}
        onChange={(type) => {
          handleShapeSelect(type);
          // if (type === "custom-image") {
          // Directly trigger the hidden file input if one exists and is managed by this component
          // For simplicity, we can rely on the DropdownMenuItem's label behavior for now
          // Or, if \`handleImageUpload\` needs to be called from here, ensure it's accessible
          // }
        }}
        onMenuWillOpen={closeOtherPickers}
      />

      {/* Shape transform */}
      <TooltipProvider>
        <DropdownMenu onOpenChange={(isOpen) => { if (isOpen) closeOtherPickers(); }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`flex items-center min-w-7 min-h-7 px-2 gap-2 text-xs text-white rounded hover:bg-[#3F434AFF] border-2 border-[#44474AFF] bg-[#1e1f22] ${!isShapeElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isShapeElementSelected}>
              <Label className="text-xs text-[#D4D4D5FF]">Transform</Label>
              <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 min-w-[100px] grid grid-cols-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className={`flex items-center justify-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none ${!isShapeElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleFlipHorizontal}
                    disabled={!isShapeElementSelected}
                  >
                    <FlipHorizontal size={14} color="white" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Flip horizontally</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className={`flex items-center justify-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none ${!isShapeElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleFlipVertical}
                    disabled={!isShapeElementSelected}
                  >
                    <FlipVertical size={14} color="white" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Flip vertically</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className={`flex items-center justify-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none ${!isShapeElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleRotate(90)} // Standard rotation increment, can be adjusted
                    disabled={!isShapeElementSelected}
                  >
                    <RotateCcw size={14} color="white" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rotate</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>

      {renderColorPickers()}

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
      <BorderStyleSelector value={borderStyle} onChange={setBorderStyle} onMenuWillOpen={closeOtherPickers} />

      {/* Corner radius (only for rounded rectangle) */}
      {(shapeType === "rounded-rectangle") && (
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

      <div className="ml-3 h-6 border-l border-[#44474AFF]"></div>
      {/* Reset All Styles button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-center px-2 min-w-7 ml-3 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
              onClick={resetAllStyles}
            >
              <span className="text-xs">Reset all</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset all shape styles</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ShapeOptions; 