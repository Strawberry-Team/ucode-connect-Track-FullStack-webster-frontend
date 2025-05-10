import { createContext, useState, useContext, type ReactNode } from "react"
import type { Tool, Element } from "@/types/canvas"

interface ToolContextType {
  activeTool: Tool | null
  setActiveTool: (tool: Tool | null) => void
  activeElement: Element | null
  setActiveElement: (element: Element | null) => void
  color: string
  setColor: (color: string) => void
  brushSize: number
  setBrushSize: (size: number) => void
  opacity: number
  setOpacity: (opacity: number) => void
  zoom: number
  setZoom: (zoom: number) => void
}

const ToolContext = createContext<ToolContextType | undefined>(undefined)

export function ToolProvider({ children }: { children: ReactNode }) {
  const [activeTool, setActiveTool] = useState<Tool | null>({ id: "brush", name: "Brush", type: "brush" })
  const [activeElement, setActiveElement] = useState<Element | null>(null)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [opacity, setOpacity] = useState(100)
  const [zoom, setZoom] = useState(100)

  return (
    <ToolContext.Provider
      value={{
        activeTool,
        setActiveTool,
        activeElement,
        setActiveElement,
        color,
        setColor,
        brushSize,
        setBrushSize,
        opacity,
        setOpacity,
        zoom,
        setZoom,
      }}
    >
      {children}
    </ToolContext.Provider>
  )
}

export function useTool() {
  const context = useContext(ToolContext)
  if (context === undefined) {
    throw new Error("useTool must be used within a ToolProvider")
  }
  return context
}
