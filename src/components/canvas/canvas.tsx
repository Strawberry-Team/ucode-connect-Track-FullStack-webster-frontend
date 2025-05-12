import type React from "react";
import { useTool } from "@/context/tool-context";
import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import type Konva from "konva";
import { 
  createCheckerboardPattern, 
  calculateCanvasSize
} from "@/utils/canvas-utils.ts";
import useDrawing from "@/hooks/use-drawing.ts";
import useElementsManagement from "@/hooks/use-elements-management.ts";
import ScrollBar from "@/components/ui/scroll-bar";
import BrushCursor from "@/components/canvas/tools/brush-cursor";
import EraserCursor from "@/components/canvas/tools/eraser-cursor";
import ElementRenderer from "@/components/canvas/tools/element-renderer";

const Canvas: React.FC = () => {
  const { 
    activeTool, 
    activeElement, 
    color, 
    secondaryColor,
    brushSize, 
    eraserSize,
    opacity, 
    eraserOpacity,
    eraserHardness,
    zoom,
    setZoom,
    mirrorMode
  } = useTool();

  const [stageSize, setStageSize] = useState(calculateCanvasSize());

  const drawingManager = useDrawing({
    color,
    secondaryColor,
    brushSize,
    eraserSize,
    opacity,
    eraserOpacity,
    eraserHardness,
    mirrorMode,
    canvasWidth: stageSize.width,
    canvasHeight: stageSize.height
  });

  const elementsManager = useElementsManagement({
    color,
    secondaryColor,
    opacity
  });

  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [showBrushCursor, setShowBrushCursor] = useState(false);
  const [showEraserCursor, setShowEraserCursor] = useState(false);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        elementsManager.removeSelectedElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [elementsManager]);

  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  const contentWidth = stageSize.width * (zoom / 100);
  const contentHeight = stageSize.height * (zoom / 100);

  useEffect(() => {
    const handleResize = () => {
      setStageSize(calculateCanvasSize());
      centerCanvas();
    };

    setStageSize(calculateCanvasSize());
    centerCanvas();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const centerCanvas = () => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const scaleValue = zoom / 100;
    
    const x = (containerWidth - stageSize.width * scaleValue) / 2;
    const y = (containerHeight - stageSize.height * scaleValue) / 2;
    
    setStagePosition({ 
      x: Math.max(0, x),
      y: Math.max(0, y)
    });
  };

  const handleScroll = (direction: "horizontal" | "vertical", newPosition: number) => {
    setStagePosition((prev: { x: number, y: number }) => ({
      x: direction === "horizontal" ? newPosition : prev.x,
      y: direction === "vertical" ? newPosition : prev.y
    }));
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!containerRef.current || !stageRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentScale = zoom / 100;
    const scaleBy = 1.1;
    const newScaleDirection = e.deltaY < 0 ? currentScale * scaleBy : currentScale / scaleBy;
    const boundedScale = Math.min(Math.max(newScaleDirection, 0.1), 5);
    const newZoom = Math.round(boundedScale * 100);

    if (newZoom === zoom) return;

    const { width: currentContainerWidth, height: currentContainerHeight } = containerSize;

    const newContentWidth = stageSize.width * boundedScale;
    const newContentHeight = stageSize.height * boundedScale;

    const scrollbarsWillBeVisible =
      newContentWidth > currentContainerWidth || newContentHeight > currentContainerHeight;

    let newPosition;

    if (scrollbarsWillBeVisible) {
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      const canvasPointBefore = {
        x: (mouseX - stagePosition.x) / currentScale,
        y: (mouseY - stagePosition.y) / currentScale,
      };

      newPosition = {
        x: mouseX - canvasPointBefore.x * boundedScale,
        y: mouseY - canvasPointBefore.y * boundedScale,
      };
    } else {
      newPosition = {
        x: (currentContainerWidth - newContentWidth) / 2,
        y: (currentContainerHeight - newContentHeight) / 2,
      };
    }

    setZoom(newZoom);
    setStagePosition(newPosition);
  };

  const handleDoubleClick = () => {
    centerCanvas();
  };

  const handleMouseMoveOnContainer = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current && activeTool?.type === "cursor") {
      handleMouseMove(e);
    }

    if (!containerRef.current) return;
    const container = containerRef.current;

    const containerRect = container.getBoundingClientRect();
    const scaleCompensation = zoom / 100;

    const mouseXInContainer = e.clientX - containerRect.left;
    const mouseYInContainer = e.clientY - containerRect.top;

    const xOnCanvas = (mouseXInContainer - stagePosition.x) / scaleCompensation;
    const yOnCanvas = (mouseYInContainer - stagePosition.y) / scaleCompensation;

    const isOverCanvas =
      mouseXInContainer >= stagePosition.x &&
      mouseXInContainer <= stagePosition.x + stageSize.width * scaleCompensation &&
      mouseYInContainer >= stagePosition.y &&
      mouseYInContainer <= stagePosition.y + stageSize.height * scaleCompensation;

    if (isOverCanvas) {
      setCursorPosition({ x: xOnCanvas, y: yOnCanvas });
      if (activeTool?.type === "brush") {
        container.style.cursor = "none";
        setShowBrushCursor(true);
        setShowEraserCursor(false);
      } else if (activeTool?.type === "eraser") {
        container.style.cursor = "none";
        setShowBrushCursor(false);
        setShowEraserCursor(true);
      } else {
        container.style.cursor = "default";
        setShowBrushCursor(false);
        setShowEraserCursor(false);
      }
    } else {
      container.style.cursor = "default";
      setShowBrushCursor(false);
      setShowEraserCursor(false);
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.cursor = "default";
    }
    setShowBrushCursor(false);
    setShowEraserCursor(false);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (activeTool?.type === "cursor") {
      const targetIsStage = e.target === e.target.getStage();
      
      if (targetIsStage) {
        isDragging.current = true;
        lastMousePosition.current = { x: e.evt.clientX, y: e.evt.clientY };
      }
      return;
    }

    elementsManager.setSelectedElementIndex(null);

    const isRightClick = e.evt.button === 2;

    if (activeTool?.type === "brush") {
      drawingManager.startDrawing("brush", pos, isRightClick);
    } else if (activeTool?.type === "eraser") {
      drawingManager.startDrawing("eraser", pos);
    } else if (activeElement) {
      elementsManager.addElement(activeElement.type, pos, isRightClick);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent> | React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current && activeTool?.type === "cursor" && 'clientX' in e) {
      const deltaX = e.clientX - lastMousePosition.current.x;
      const deltaY = e.clientY - lastMousePosition.current.y;
      
      setStagePosition((prev: { x: number, y: number }) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (drawingManager.getIsDrawing() && !isDragging.current && 'target' in e) {
      const target = e.target as any;
      if (target && typeof target.getStage === 'function') {
        const stage = target.getStage();
        const point = stage?.getPointerPosition();
        if (!point) return;
        
        drawingManager.continueDrawing(point);
      }
    }
  };

  const handleMouseUp = () => {
    drawingManager.endDrawing();
    isDragging.current = false;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const scale = zoom / 100;

  return (
    <div
      className="w-full h-full bg-[#171719FF] overflow-hidden relative"
      ref={containerRef}
      onMouseMove={handleMouseMoveOnContainer}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseDown={(e) => activeTool?.type === "cursor" && handleMouseDown({ evt: e } as any)}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="relative"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          width: stageSize.width,
          height: stageSize.height,
          position: "absolute",
          left: stagePosition.x,
          top: stagePosition.y,
        }}
      >
        {mirrorMode !== "None" && (
          <div
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: stageSize.width,
              height: stageSize.height,
              zIndex: 500
            }}
          >
            {(mirrorMode === "Vertical" || mirrorMode === "Four-way") && (
              <div
                className="absolute top-0 bottom-0 border-dashed border-l border-white/40"
                style={{
                  left: stageSize.width / 2,
                  height: "100%",
                }}
              />
            )}
            {(mirrorMode === "Horizontal" || mirrorMode === "Four-way") && (
              <div
                className="absolute left-0 right-0 border-dashed border-t border-white/40"
                style={{
                  top: stageSize.height / 2,
                  width: "100%",
                }}
              />
            )}
          </div>
        )}
      
        <BrushCursor 
          brushSize={brushSize}
          color={color}
          opacity={opacity}
          isVisible={showBrushCursor}
          position={cursorPosition}
        />
        <EraserCursor 
          size={eraserSize}
          isVisible={showEraserCursor}
          position={cursorPosition}
        />
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              width={stageSize.width}
              height={stageSize.height}
              fillPatternImage={createCheckerboardPattern(7, "#1D2023FF", "#2D2F34FF")}
            />
          </Layer>
          <Layer>
            {drawingManager.lines.map((line, i) => (
              <Line
                key={`line-${i}`}
                points={line.points}
                stroke={line.tool === "eraser" ? "#ffffff" : line.color}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                opacity={line.opacity}
                globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"}
              />
            ))}
            {elementsManager.renderElements().map(({ key, element, index }) => (
              <ElementRenderer 
                key={key}
                element={element}
                index={index}
                onDragEnd={elementsManager.handleDragEnd}
                onClick={elementsManager.handleElementClick}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <div
        className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md select-none"
        style={{ zIndex: 1000 }}
      >
        {stageSize.width} x {stageSize.height} | {zoom}%
      </div>
      <ScrollBar 
        orientation="horizontal"
        containerSize={containerSize.width}
        contentSize={contentWidth}
        position={-stagePosition.x}
        onScroll={(newPos) => handleScroll("horizontal", newPos)}
      />
      <ScrollBar 
        orientation="vertical"
        containerSize={containerSize.height}
        contentSize={contentHeight}
        position={-stagePosition.y}
        onScroll={(newPos) => handleScroll("vertical", newPos)}
      />
    </div>
  );
};

export default Canvas;