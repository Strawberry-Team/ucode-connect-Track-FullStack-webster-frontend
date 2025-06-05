export interface Tool {
  id: string
  name: string
  type: string
  icon?: any
}

export interface Element {
  id: string
  type: string
  icon?: any
  settings?: Record<string, any>
  text?: {
    color: string
    backgroundColor: string
    backgroundOpacity: number
    // textColor?: string
    // textBgColor?: string
    // textBgOpacity: number
    fontSize: number
    fontFamily: string
    fontStyles: FontStyles
    textCase: TextCase
    lineHeight: number
    textAlignment: TextAlignment
  }
}

export interface LineData {
  tool: "brush" | "eraser"
  points: number[]
  color: string
  strokeWidth: number
  opacity: number
  id: string
}

export type TextAlignment = "left" | "center" | "right" | "justify";
export type TextCase = "none" | "uppercase" | "lowercase" | "capitalize";
export type BorderStyle = "solid" | "dashed" | "dotted" | "double" | "hidden";
export type MirrorMode = "None" | "Vertical" | "Horizontal" | "Four-way";
export type ShapeType =
  | "rectangle"
  | "square"
  | "rounded-rectangle"
  | "squircle"
  | "circle"
  | "line"
  | "triangle"
  | "pentagon"
  | "hexagon"
  | "star"
  | "heart"
  | "arrow"
  | "custom-image";

export interface FontStyles {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

export interface ElementData {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  color: string
  opacity: number
  text?: string
  textColor?: string
  textBgColor?: string
  textBgOpacity?: number
  textBgOpacityInput?: string
  fontSize?: number
  fontFamily?: string
  fontStyles?: FontStyles
  textCase?: TextCase
  textAlignment?: TextAlignment
  lineHeight?: number
  backgroundColor?: string
  backgroundOpacity?: number
  fillColor?: string
  fillColorOpacity?: number
  borderColor?: string
  borderWidth?: number
  borderStyle?: BorderStyle
  borderColorOpacity?: number
  cornerRadius?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  draggable?: boolean
  preserveAspectRatio?: boolean
  src?: string
  fileName?: string // Add fileName field for images
  textColorOpacity?: number
}

export interface ToolSettings {
  brush: {
    size: number
    opacity: number
    color: string
  }
  eraser: {
    size: number
    opacity: number
    hardness: number
  }
}

// Define a union type for all renderable objects
export type RenderableObject = LineData | ElementData;
