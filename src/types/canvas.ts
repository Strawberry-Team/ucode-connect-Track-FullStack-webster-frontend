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
}

export type TextAlignment = "left" | "center" | "right" | "justify";
export type TextCase = "none" | "uppercase" | "lowercase" | "capitalize";
export type BorderStyle = "solid" | "dashed" | "dotted" | "double" | "hidden";
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
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  // Additional properties for text elements
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyles?: FontStyles;
  textCase?: TextCase;
  textAlignment?: TextAlignment;
  lineHeight?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  // Additional properties for shapes
  fillColor?: string;
  fillColorOpacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: BorderStyle;
  cornerRadius?: number;
  // General properties for transformations
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  // Additional properties for element behavior
  draggable?: boolean;
  preserveAspectRatio?: boolean;
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
