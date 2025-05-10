import type React from "react"
import { useTool } from "@/context/tool-context"
import { useRef, useState, useEffect } from "react"
import { Stage, Layer, Line, Rect, Circle, Star, RegularPolygon } from "react-konva"
import type Konva from "konva"
import type { ElementData, LineData } from "@/types/canvas"

const Canvas: React.FC = () => {
  const { activeTool, activeElement, color, brushSize, opacity, zoom } = useTool()

  const [lines, setLines] = useState<LineData[]>([])
  const [elements, setElements] = useState<ElementData[]>([])
  const isDrawing = useRef(false)
  const stageRef = useRef<Konva.Stage | null>(null)
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth - 60, // Subtract toolbar width
    height: window.innerHeight - 120, // Subtract header and properties panel height
  })

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth - 60,
        height: window.innerHeight - 120,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return

    if (activeTool?.type === "brush" || activeTool?.type === "eraser") {
      isDrawing.current = true
      setLines([
        ...lines,
        {
          tool: activeTool.type,
          points: [pos.x, pos.y],
          color: activeTool.type === "eraser" ? "#ffffff" : color,
          strokeWidth: brushSize,
          opacity: opacity / 100,
        },
      ])
    } else if (activeElement) {
      setElements([
        ...elements,
        {
          type: activeElement.type,
          x: pos.x,
          y: pos.y,
          color,
          width: 100,
          height: 100,
          opacity: opacity / 100,
        },
      ])
    }
  }

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || !activeTool) return

    const stage = e.target.getStage()
    const point = stage?.getPointerPosition()
    if (!point) return

    const lastLine = lines[lines.length - 1]
    lastLine.points = lastLine.points.concat([point.x, point.y])

    setLines([...lines.slice(0, -1), lastLine])
  }

  const handleMouseUp = () => {
    isDrawing.current = false
  }

  const scale = zoom / 100

  return (
    <div className="w-full h-full bg-[#1e1e1e] overflow-auto">
      <div
        className="relative"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
        }}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {/* Checkerboard background to indicate transparency */}
            <Rect
              x={0}
              y={0}
              width={stageSize.width}
              height={stageSize.height}
              fillPatternImage={(() => {
                const patternCanvas = document.createElement("canvas")
                patternCanvas.width = 20
                patternCanvas.height = 20
                const ctx = patternCanvas.getContext("2d")
                if (ctx) {
                  ctx.fillStyle = "#ffffff"
                  ctx.fillRect(0, 0, 20, 20)
                  ctx.fillStyle = "#eeeeee"
                  ctx.fillRect(0, 0, 10, 10)
                  ctx.fillRect(10, 10, 10, 10)
                }
                const img = new Image()
                img.src = patternCanvas.toDataURL()
                return img
              })()}
            />

            {lines.map((line, i) => (
              <Line
                key={`line-${i}`}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                opacity={line.opacity}
                globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"}
              />
            ))}

            {elements.map((el, i) => {
              switch (el.type) {
                case "rectangle":
                  return (
                    <Rect
                      key={`element-${i}`}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      fill={el.color}
                      opacity={el.opacity}
                      draggable
                    />
                  )
                case "circle":
                  return (
                    <Circle
                      key={`element-${i}`}
                      x={el.x + el.width / 2}
                      y={el.y + el.height / 2}
                      radius={el.width / 2}
                      fill={el.color}
                      opacity={el.opacity}
                      draggable
                    />
                  )
                case "triangle":
                  return (
                    <RegularPolygon
                      key={`element-${i}`}
                      x={el.x + el.width / 2}
                      y={el.y + el.height / 2}
                      sides={3}
                      radius={el.width / 2}
                      fill={el.color}
                      opacity={el.opacity}
                      draggable
                    />
                  )
                case "star":
                  return (
                    <Star
                      key={`element-${i}`}
                      x={el.x + el.width / 2}
                      y={el.y + el.height / 2}
                      numPoints={5}
                      innerRadius={el.width / 4}
                      outerRadius={el.width / 2}
                      fill={el.color}
                      opacity={el.opacity}
                      draggable
                    />
                  )
                case "hexagon":
                  return (
                    <RegularPolygon
                      key={`element-${i}`}
                      x={el.x + el.width / 2}
                      y={el.y + el.height / 2}
                      sides={6}
                      radius={el.width / 2}
                      fill={el.color}
                      opacity={el.opacity}
                      draggable
                    />
                  )
                case "diamond":
                  return (
                    <RegularPolygon
                      key={`element-${i}`}
                      x={el.x + el.width / 2}
                      y={el.y + el.height / 2}
                      sides={4}
                      radius={el.width / 2}
                      rotation={45}
                      fill={el.color}
                      opacity={el.opacity}
                      draggable
                    />
                  )
                default:
                  return (
                    <Circle
                      key={`element-${i}`}
                      x={el.x + el.width / 2}
                      y={el.y + el.height / 2}
                      radius={el.width / 2}
                      fill={el.color}
                      opacity={el.opacity}
                      draggable
                    />
                  )
              }
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}

export default Canvas
