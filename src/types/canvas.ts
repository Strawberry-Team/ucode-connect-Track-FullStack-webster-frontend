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
  }
  
  export interface LineData {
    tool: "brush" | "eraser"
    points: number[]
    color: string
    strokeWidth: number
    opacity: number
  }
  
  export interface ElementData {
    type: string
    x: number
    y: number
    width: number
    height: number
    color: string
    opacity: number
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
  