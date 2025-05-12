import React, { createContext, useContext, useState } from "react"
import type { Tool, Element, ToolSettings } from "@/types/canvas"

export type MirrorMode = "None" | "Vertical" | "Horizontal" | "Four-way";

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
  brushMirrorMode: MirrorMode
  setBrushMirrorMode: (mode: MirrorMode) => void
  eraserMirrorMode: MirrorMode
  setEraserMirrorMode: (mode: MirrorMode) => void
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

  const swapColors = () => {
    const tempColor = color
    setColor(secondaryColor)
    setSecondaryColor(tempColor)
  }

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
        brushMirrorMode,
        setBrushMirrorMode,
        eraserMirrorMode,
        setEraserMirrorMode
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
