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
    tool: string
    points: number[]
    color: string
    strokeWidth: number
    opacity?: number
  }
  
  export interface ElementData {
    type: string
    x: number
    y: number
    color: string
    width: number
    height: number
    opacity?: number
  }
  