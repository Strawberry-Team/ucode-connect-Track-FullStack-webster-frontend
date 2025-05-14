import React, { createContext, useContext, useState } from "react"
import type { Tool, Element, ToolSettings, FontStyles, TextAlignment, TextCase, BorderStyle } from "@/types/canvas"

export type MirrorMode = "None" | "Vertical" | "Horizontal" | "Four-way";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InitialImage {
  src: string;
  width: number;
  height: number;
  file: File;
}

interface ToolContextValue {
  activeTool: Tool | null
  setActiveTool: (tool: Tool | null) => void
  activeElement: Element | null
  setActiveElement: (element: Element | null) => void
  color: string
  setColor: (color: string) => void
  secondaryColor: string
  setSecondaryColor: (color: string) => void
  swapColors: () => void
  brushSize: number
  setBrushSize: (size: number) => void
  eraserSize: number
  setEraserSize: (size: number) => void
  opacity: number
  setOpacity: (opacity: number) => void
  eraserOpacity: number
  setEraserOpacity: (opacity: number) => void
  eraserHardness: number
  setEraserHardness: (hardness: number) => void
  zoom: number
  setZoom: (zoom: number) => void
  toolSettings: ToolSettings

  // Additional parameters for text
  fontSize: number
  setFontSize: (size: number) => void
  fontFamily: string
  setFontFamily: (family: string) => void
  fontStyles: FontStyles
  setFontStyles: (styles: FontStyles) => void
  textCase: TextCase
  setTextCase: (textCase: TextCase) => void
  textAlignment: TextAlignment
  setTextAlignment: (alignment: TextAlignment) => void
  lineHeight: number
  setLineHeight: (height: number) => void
  backgroundColor: string
  setBackgroundColor: (color: string) => void
  backgroundOpacity: number
  setBackgroundOpacity: (opacity: number) => void
  // Additional parameters for shapes
  borderColor: string
  setBorderColor: (color: string) => void
  borderWidth: number
  setBorderWidth: (width: number) => void
  borderStyle: BorderStyle
  setBorderStyle: (style: BorderStyle) => void
  cornerRadius: number
  setCornerRadius: (radius: number) => void

  brushMirrorMode: MirrorMode
  setBrushMirrorMode: (mode: MirrorMode) => void
  eraserMirrorMode: MirrorMode
  setEraserMirrorMode: (mode: MirrorMode) => void

  isCropping: boolean;
  setIsCropping: (isCropping: boolean) => void;
  cropRect: Rect | null;
  setCropRect: (rect: Rect | null) => void;
  stageSize: { width: number; height: number } | null;
  setStageSize: (size: { width: number; height: number } | null) => void;
  selectedAspectRatio: string;
  setSelectedAspectRatio: (aspectRatio: string) => void;
  triggerApplyCrop: boolean;
  setTriggerApplyCrop: () => void;
  isCanvasManuallyResized: boolean;
  setIsCanvasManuallyResized: (isResized: boolean) => void;

  initialImage: InitialImage | null;
  setInitialImage: (image: InitialImage | null) => void;
}

const ToolContext = createContext<ToolContextValue | undefined>(undefined)

export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [activeElement, setActiveElement] = useState<Element | null>(null)
  const [color, setColor] = useState("#000000")
  const [secondaryColor, setSecondaryColor] = useState("#ffffff")
  const [brushSize, setBrushSize] = useState(20)
  const [eraserSize, setEraserSize] = useState(20)
  const [opacity, setOpacity] = useState(100)
  const [eraserOpacity, setEraserOpacity] = useState(100)
  const [eraserHardness, setEraserHardness] = useState(100)
  const [zoom, setZoom] = useState(100)
  const [brushMirrorMode, setBrushMirrorMode] = useState<MirrorMode>("None")
  const [eraserMirrorMode, setEraserMirrorMode] = useState<MirrorMode>("None")

  // Crop related state
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number } | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("custom");
  const [triggerApplyCrop, setTriggerApplyCropState] = useState<boolean>(false);
  const [isCanvasManuallyResized, setIsCanvasManuallyResized] = useState<boolean>(false);
  const [initialImage, setInitialImage] = useState<InitialImage | null>(null);

  //  States for text
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontStyles, setFontStyles] = useState<FontStyles>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false
  })
  const [textCase, setTextCase] = useState<TextCase>("none")
  const [textAlignment, setTextAlignment] = useState<TextAlignment>("center")
  const [lineHeight, setLineHeight] = useState(1)
  const [backgroundColor, setBackgroundColor] = useState("transparent")
  const [backgroundOpacity, setBackgroundOpacity] = useState(100)

  // States for shapes
  const [borderColor, setBorderColor] = useState("#000000")
  const [borderWidth, setBorderWidth] = useState(2)
  const [borderStyle, setBorderStyle] = useState<BorderStyle>("solid")
  const [cornerRadius, setCornerRadius] = useState(0)

  const swapColors = () => {
    const tempColor = color
    setColor(secondaryColor)
    setSecondaryColor(tempColor)
  }

  const handleSetTriggerApplyCrop = () => {
    setTriggerApplyCropState(true);
    // Automatically reset the trigger after a short delay or after processing
    // This depends on how you want to handle the trigger consumption
    setTimeout(() => setTriggerApplyCropState(false), 100);
  };

  const toolSettings: ToolSettings = {
    brush: {
      size: brushSize,
      opacity: opacity,
      color: color
    },
    eraser: {
      size: eraserSize,
      opacity: eraserOpacity,
      hardness: eraserHardness
    }
  }

  return (
    <ToolContext.Provider
      value={{
        activeTool,
        setActiveTool,
        activeElement,
        setActiveElement,
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
        setZoom,
        toolSettings,

        // Additional parameters for text
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        fontStyles,
        setFontStyles,
        textCase,
        setTextCase,
        textAlignment,
        setTextAlignment,
        lineHeight,
        setLineHeight,
        backgroundColor,
        setBackgroundColor,
        backgroundOpacity,
        setBackgroundOpacity,

        // Additional parameters for shapes
        borderColor,
        setBorderColor,
        borderWidth,
        setBorderWidth,
        borderStyle,
        setBorderStyle,
        cornerRadius,
        setCornerRadius,

        brushMirrorMode,
        setBrushMirrorMode,
        eraserMirrorMode,
        setEraserMirrorMode,
        isCropping,
        setIsCropping,
        cropRect,
        setCropRect,
        stageSize,
        setStageSize,
        selectedAspectRatio,
        setSelectedAspectRatio,
        triggerApplyCrop,
        setTriggerApplyCrop: handleSetTriggerApplyCrop,
        isCanvasManuallyResized,
        setIsCanvasManuallyResized,
        initialImage,
        setInitialImage,
      }}
    >
      {children}
    </ToolContext.Provider>
  )
}

export const useTool = () => {
  const context = useContext(ToolContext)
  if (context === undefined) {
    throw new Error("useTool must be used within a ToolProvider")
  }
  return context
}
