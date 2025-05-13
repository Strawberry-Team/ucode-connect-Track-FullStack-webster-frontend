import type React from "react";
import { useTool } from "@/context/tool-context";
import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import Konva from "konva";
import {
  createCheckerboardPattern,
  calculateCanvasSize
} from "@/utils/canvas-utils.ts";
import { useDrawing, useElementsManagement, useCropping } from "@/hooks";
import ScrollBar from "@/components/ui/scroll-bar";
import BrushCursor from "@/components/canvas/tools/brush-cursor";
import EraserCursor from "@/components/canvas/tools/eraser-cursor";
import ElementRenderer from "@/components/canvas/tools/element-renderer";
import CropTool from "@/components/canvas/tools/crop-tool";
import { formatDimensionDisplay } from "@/utils/format-utils";

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
    brushMirrorMode,
    eraserMirrorMode,
    setIsCropping,
    cropRect,
    setCropRect,
    stageSize: contextStageSize,
    setStageSize: setContextStageSize,
    selectedAspectRatio,
    setSelectedAspectRatio,
    triggerApplyCrop,
    isCanvasManuallyResized,
    setIsCanvasManuallyResized
  } = useTool();

  const drawingManager = useDrawing({
    color,
    secondaryColor,
    brushSize,
    eraserSize,
    opacity,
    eraserOpacity,
    eraserHardness,
    brushMirrorMode,
    eraserMirrorMode,
    activeToolType: activeTool?.type ?? null,
    canvasWidth: contextStageSize?.width ?? 0,
    canvasHeight: contextStageSize?.height ?? 0
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
  const [isHoveringZoomControls, setIsHoveringZoomControls] = useState(false);
  const zoomControlsRef = useRef<HTMLDivElement>(null);
  const zoomStep = 20;

  const croppingManager = useCropping({
    cropRect,
    setCropRect,
    stageSize: contextStageSize,
    setStageSize: setContextStageSize,
    selectedAspectRatio,
    setSelectedAspectRatio,
    setIsCropping,
    setIsCanvasManuallyResized,
    lines: drawingManager.lines,
    setLines: drawingManager.setLines,
    elements: elementsManager.elements,
    setElements: elementsManager.setElements,
    containerRef: containerRef as React.RefObject<HTMLDivElement | null>,
    zoom,
    setStagePosition
  });

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
    const updateContainerSizeAndStage = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
      if (!isCanvasManuallyResized) {
        const newCalculatedStageSize = calculateCanvasSize();
        if (!contextStageSize ||
            contextStageSize.width !== newCalculatedStageSize.width ||
            contextStageSize.height !== newCalculatedStageSize.height) {
          setContextStageSize(newCalculatedStageSize);
        }
      }
    };

    updateContainerSizeAndStage();
    window.addEventListener("resize", updateContainerSizeAndStage);
    return () => window.removeEventListener("resize", updateContainerSizeAndStage);
  }, [isCanvasManuallyResized, setContextStageSize]);

  const contentWidth = contextStageSize ? contextStageSize.width * (zoom / 100) : 0;
  const contentHeight = contextStageSize ? contextStageSize.height * (zoom / 100) : 0;

  useEffect(() => {
    if (contextStageSize && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const scaleValue = zoom / 100;

      const scaledContentWidth = contextStageSize.width * scaleValue;
      const scaledContentHeight = contextStageSize.height * scaleValue;

      let newX = stagePosition.x;
      let newY = stagePosition.y;

      if (scaledContentWidth <= containerWidth) {
        newX = (containerWidth - scaledContentWidth) / 2;
      } else {
        newX = Math.max(containerWidth - scaledContentWidth, Math.min(0, stagePosition.x));
      }

      if (scaledContentHeight <= containerHeight) {
        newY = (containerHeight - scaledContentHeight) / 2;
      } else {
        newY = Math.max(containerHeight - scaledContentHeight, Math.min(0, stagePosition.y));
      }

      if (newX !== stagePosition.x || newY !== stagePosition.y) {
        setStagePosition({ x: newX, y: newY });
      }
    }
  }, [contextStageSize, containerSize.width, containerSize.height, zoom]);

  const handleScroll = (direction: "horizontal" | "vertical", newPosition: number) => {
    setStagePosition((prev: { x: number, y: number }) => ({
      x: direction === "horizontal" ? -newPosition : prev.x,
      y: direction === "vertical" ? -newPosition : prev.y
    }));
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!containerRef.current || !stageRef.current || !contextStageSize) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentScale = zoom / 100;
    const scaleBy = 1.1;
    const newScaleDirection = e.deltaY < 0 ? currentScale * scaleBy : currentScale / scaleBy;
    const boundedScale = Math.min(Math.max(newScaleDirection, 0.1), 5);
    const newZoom = Math.round(boundedScale * 100);

    if (newZoom === zoom) return;

    const { width: currentContainerWidth, height: currentContainerHeight } = containerSize;

    const newContentWidth = contextStageSize.width * boundedScale;
    const newContentHeight = contextStageSize.height * boundedScale;

    const scrollbarsWillBeVisible =
        newContentWidth > currentContainerWidth || newContentHeight > currentContainerHeight;

    let newPosition;

    if (scrollbarsWillBeVisible) {
      const mouseXInContainer = e.clientX - containerRect.left;
      const mouseYInContainer = e.clientY - containerRect.top;

      const canvasPointBefore = {
        x: (mouseXInContainer - stagePosition.x) / currentScale,
        y: (mouseYInContainer - stagePosition.y) / currentScale,
      };

      newPosition = {
        x: mouseXInContainer - canvasPointBefore.x * boundedScale,
        y: mouseYInContainer - canvasPointBefore.y * boundedScale,
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
    const newZoom = 100;
    setZoom(newZoom);

    if (!containerRef.current || !contextStageSize) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const scaleValue = newZoom / 100;

    const scaledContentWidth = contextStageSize.width * scaleValue;
    const scaledContentHeight = contextStageSize.height * scaleValue;

    let newX, newY;

    if (scaledContentWidth <= containerWidth) {
      newX = (containerWidth - scaledContentWidth) / 2;
    } else {
      newX = 0;
    }

    if (scaledContentHeight <= containerHeight) {
      newY = (containerHeight - scaledContentHeight) / 2;
    } else {
      newY = 0;
    }

    setStagePosition({ x: newX, y: newY });
  };

  const handleZoomButtonClick = (zoomChange: number) => {
    if (!containerRef.current || !stageRef.current || !contextStageSize) return;

    const currentScale = zoom / 100;

    const containerCenterX = containerSize.width / 2;
    const containerCenterY = containerSize.height / 2;

    const canvasPointBefore = {
      x: (containerCenterX - stagePosition.x) / currentScale,
      y: (containerCenterY - stagePosition.y) / currentScale,
    };

    const newZoom = Math.min(Math.max(zoom + zoomChange, 10), 500);
    if (newZoom === zoom) return;
    const newScale = newZoom / 100;

    const newPosition = {
      x: containerCenterX - canvasPointBefore.x * newScale,
      y: containerCenterY - canvasPointBefore.y * newScale,
    };

    setZoom(newZoom);
    setStagePosition(newPosition);
  };

  const handleZoomInClick = () => handleZoomButtonClick(zoomStep);
  const handleZoomOutClick = () => handleZoomButtonClick(-zoomStep);

  const handleMouseMoveOnContainer = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !stageRef.current ) return;

    const isOverZoomCtrl = zoomControlsRef.current && zoomControlsRef.current.contains(e.target as Node);
    if (isOverZoomCtrl) {
      if (!isHoveringZoomControls) setIsHoveringZoomControls(true);
      if (containerRef.current) containerRef.current.style.cursor = 'default';
      setShowBrushCursor(false);
      setShowEraserCursor(false);
      return;
    }
    if (isHoveringZoomControls) setIsHoveringZoomControls(false);

    const containerRect = containerRef.current.getBoundingClientRect();
    const scale = zoom / 100;

    const mouseX = (e.clientX - containerRect.left - stagePosition.x) / scale;
    const mouseY = (e.clientY - containerRect.top - stagePosition.y) / scale;

    setCursorPosition({ x: mouseX, y: mouseY });

    if (activeTool?.type === 'brush') {
      if (containerRef.current) containerRef.current.style.cursor = "none";
      setShowBrushCursor(true);
      setShowEraserCursor(false);
    } else if (activeTool?.type === 'eraser') {
      if (containerRef.current) containerRef.current.style.cursor = "none";
      setShowBrushCursor(false);
      setShowEraserCursor(true);
    } else {
      if (containerRef.current) containerRef.current.style.cursor = "default";
      setShowBrushCursor(false);
      setShowEraserCursor(false);
    }

    if (isDragging.current) {
      if (e.buttons === 4) {
        const dx = e.clientX - lastMousePosition.current.x;
        const dy = e.clientY - lastMousePosition.current.y;
        setStagePosition({
          x: stagePosition.x + dx,
          y: stagePosition.y + dy,
        });
      } else if ((activeTool?.type === 'brush' || activeTool?.type === 'eraser') &&
          (e.buttons === 1 || e.buttons === 2) &&
          drawingManager.getIsDrawing()) {
        drawingManager.continueDrawing({ x: mouseX, y: mouseY });
      }
    }
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseLeave = () => {
    if (containerRef.current) containerRef.current.style.cursor = 'default';
    if (drawingManager.getIsDrawing()) {
      drawingManager.endDrawing();
    }
    setShowBrushCursor(false);
    setShowEraserCursor(false);
    setCursorPosition(null);
    isDragging.current = false;
    setIsHoveringZoomControls(false);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!containerRef.current || !stageRef.current) return;
    const evt = e.evt;

    if (evt.button === 1) {
      isDragging.current = true;
      return;
    }

    if (activeTool?.type === 'brush' || activeTool?.type === 'eraser') {
      const stage = stageRef.current;
      const position = stage.getPointerPosition();

      if (position) {
        isDragging.current = true;
        const isRightClick = evt.button === 2;

        if (activeTool?.type === 'brush') {
          drawingManager.startDrawing('brush', position, isRightClick);
        } else if (activeTool?.type === 'eraser') {
          drawingManager.startDrawing('eraser', position);
        }
      }
    } else if (activeTool?.type === 'shape') {
      const stage = stageRef.current;
      const position = stage.getPointerPosition();

      if (position && activeElement) {
        elementsManager.addElement(activeElement.type, position, evt.button === 2);
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent> | React.MouseEvent<HTMLDivElement>) => {
    if ('evt' in e) {
      const stage = stageRef.current;
      const position = stage?.getPointerPosition();

      if (position && isDragging.current && drawingManager.getIsDrawing()) {
        drawingManager.continueDrawing(position);
      }
    }
  };

  const handleMouseUp = () => {
    if (drawingManager.getIsDrawing()) {
      drawingManager.endDrawing();
    }
    isDragging.current = false;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const scale = zoom / 100;

  useEffect(() => {
    if (triggerApplyCrop) {
      croppingManager.applyCrop();
    }
  }, [triggerApplyCrop, croppingManager]);

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
              width: contextStageSize?.width ?? 0,
              height: contextStageSize?.height ?? 0,
              position: "absolute",
              left: stagePosition.x,
              top: stagePosition.y,
            }}
        >
          {((activeTool?.type === 'brush' && brushMirrorMode !== 'None') ||
              (activeTool?.type === 'eraser' && eraserMirrorMode !== 'None')) && (
              <div
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    width: contextStageSize?.width ?? 0,
                    height: contextStageSize?.height ?? 0,
                    zIndex: 500
                  }}
              >
                {((activeTool?.type === 'brush' && (brushMirrorMode === 'Vertical' || brushMirrorMode === 'Four-way')) ||
                    (activeTool?.type === 'eraser' && (eraserMirrorMode === 'Vertical' || eraserMirrorMode === 'Four-way'))) && (
                    <div
                        className="absolute top-0 bottom-0 border-dashed border-l border-white/40"
                        style={{
                          left: (contextStageSize?.width ?? 0) / 2,
                          height: "100%",
                        }}
                    />
                )}
                {((activeTool?.type === 'brush' && (brushMirrorMode === 'Horizontal' || brushMirrorMode === 'Four-way')) ||
                    (activeTool?.type === 'eraser' && (eraserMirrorMode === 'Horizontal' || eraserMirrorMode === 'Four-way'))) && (
                    <div
                        className="absolute left-0 right-0 border-dashed border-t border-white/40"
                        style={{
                          top: (contextStageSize?.height ?? 0) / 2,
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
              width={contextStageSize?.width ?? 0}
              height={contextStageSize?.height ?? 0}
              onMouseDown={handleMouseDown}
              onMousemove={handleMouseMove}
              onMouseup={handleMouseUp}
              ref={stageRef}
          >
            <Layer>
              <Rect
                  x={0}
                  y={0}
                  width={contextStageSize?.width ?? 0}
                  height={contextStageSize?.height ?? 0}
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
              <CropTool
                  stageSize={contextStageSize}
                  scale={scale}
                  cropRectRef={croppingManager.cropRectRef as any}
                  transformerRef={croppingManager.transformerRef as any}
                  handleCropRectDragEnd={croppingManager.handleCropRectDragEnd}
                  handleCropRectTransformEnd={croppingManager.handleCropRectTransformEnd}
              />
            </Layer>
          </Stage>
        </div>
        <div
            ref={zoomControlsRef}
            className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md select-none flex items-center gap-2"
            style={{ zIndex: 1000 }}
        >
        <span>
          {(contextStageSize ? formatDimensionDisplay(contextStageSize.width) : "0")} x {(contextStageSize ? formatDimensionDisplay(contextStageSize.height) : "0")} |
          <button
              onClick={handleZoomOutClick}
              className="cursor-pointer px-1.5 ml-1 mr-1 hover:bg-white/20 rounded"
              aria-label="Уменьшить масштаб"
              tabIndex={0}
          >
            -
          </button>
          {zoom}%
          <button
              onClick={handleZoomInClick}
              className="cursor-pointer px-1 ml-1 hover:bg-white/20 rounded"
              aria-label="Увеличить масштаб"
              tabIndex={0}
          >
            +
          </button>
        </span>
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