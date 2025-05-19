import type React from "react";
import { useTool } from "@/context/tool-context";
import { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line as KonvaLine, Rect, Image as KonvaImage } from "react-konva";
import Konva from "konva";
import {
  createCheckerboardPattern,
} from "@/utils/canvas-utils.ts";
import { useDrawing, useElementsManagement, useCropping } from "@/hooks";
import ScrollBar from "@/components/ui/scroll-bar";
import BrushCursor from "@/components/canvas/tools/brush-cursor";
import EraserCursor from "@/components/canvas/tools/eraser-cursor";
import ElementRenderer from "@/components/canvas/tools/element-renderer";
import CropTool from "@/components/canvas/tools/crop-tool";
import { formatDimensionDisplay } from "@/utils/format-utils";
import type { RenderableObject, LineData, ElementData, ShapeType, Tool, FontStyles } from "@/types/canvas";

const Canvas: React.FC = () => {
  const toolContext = useTool();
  const {
    activeTool,
    setActiveTool: setContextActiveTool,
    activeElement,
    isAddModeActive,
    currentAddToolType,
    setIsAddModeActive,
    setCurrentAddToolType,
    renderableObjects,
    setRenderableObjects,
    fontSize: defaultFontSize,
    fontFamily: defaultFontFamily,
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
    setIsCanvasManuallyResized,
    initialImage,
    setInitialImage,
    cursorPositionOnCanvas,
    setCursorPositionOnCanvas,
    setMiniMapDataURL,
    setVisibleCanvasRectOnMiniMap,
    registerStagePositionUpdater,
    registerRenderableObjectsRestorer,
  } = toolContext;

  const drawingManager = useDrawing({
    canvasWidth: contextStageSize?.width ?? 0,
    canvasHeight: contextStageSize?.height ?? 0
  });

  const elementsManager = useElementsManagement({
    color: color,
    secondaryColor: secondaryColor,
    opacity: opacity,
    fontSize: defaultFontSize,
    fontFamily: defaultFontFamily,
  });

  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBrushCursor, setShowBrushCursor] = useState(false);
  const [showEraserCursor, setShowEraserCursor] = useState(false);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isHoveringUiElement, setIsHoveringUiElement] = useState(false);
  const zoomControlsRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarRef = useRef<HTMLDivElement>(null);
  const verticalScrollbarRef = useRef<HTMLDivElement>(null);
  const zoomStep = 20;

  const croppingManager = useCropping({
    cropRect: cropRect,
    setCropRect: setCropRect,
    stageSize: contextStageSize,
    setStageSize: setContextStageSize,
    selectedAspectRatio: selectedAspectRatio,
    setSelectedAspectRatio: setSelectedAspectRatio,
    setIsCropping: setIsCropping,
    setIsCanvasManuallyResized: setIsCanvasManuallyResized,
    lines: renderableObjects.filter(obj => 'tool' in obj) as LineData[],
    setLines: (newLines) => {
      const elements = renderableObjects.filter(obj => !('tool' in obj)) as ElementData[];
      setRenderableObjects([...elements, ...newLines]);
    },
    elements: renderableObjects.filter(obj => !('tool' in obj)) as ElementData[],
    setElements: (newElements) => {
      const lines = renderableObjects.filter(obj => 'tool' in obj) as LineData[];
      setRenderableObjects([...lines, ...newElements]);
    },
    containerRef: containerRef as React.RefObject<HTMLDivElement | null>,
    zoom: zoom,
    setStagePosition
  });

  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  const contentWidth = contextStageSize ? contextStageSize.width * (zoom / 100) : 0;
  const contentHeight = contextStageSize ? contextStageSize.height * (zoom / 100) : 0;

  useEffect(() => {
    if (initialImage && initialImage.src) {
      const img = new window.Image();
      img.src = initialImage.src;
      img.onload = () => {
        setBackgroundImage(img);
        setTimeout(() => {
          setInitialImage(null);
        }, 0);
      };
      img.onerror = () => {
        console.error("The initial image for the canvas could not be loaded.");
        setBackgroundImage(null);
        setInitialImage(null);
      };
    }
  }, [initialImage, setInitialImage]);

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
    const updateSizes = () => {
      let currentContainerWidth = 0;
      let currentContainerHeight = 0;

      if (containerRef.current) {
        currentContainerWidth = containerRef.current.clientWidth;
        currentContainerHeight = containerRef.current.clientHeight;
        setContainerSize({
          width: currentContainerWidth,
          height: currentContainerHeight
        });
      }

      if (!contextStageSize && !isCanvasManuallyResized && currentContainerWidth > 0 && currentContainerHeight > 0) {
        setContextStageSize({ width: currentContainerWidth, height: currentContainerHeight });
      }
    };

    updateSizes();

    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [contextStageSize, isCanvasManuallyResized, setContextStageSize]);

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
  }, [contextStageSize, containerSize.width, containerSize.height, zoom, stagePosition, setStagePosition]);

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
    const scrollbarsWillBeVisible = newContentWidth > currentContainerWidth || newContentHeight > currentContainerHeight;
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
    let newX = (scaledContentWidth <= containerWidth) ? (containerWidth - scaledContentWidth) / 2 : 0;
    let newY = (scaledContentHeight <= containerHeight) ? (containerHeight - scaledContentHeight) / 2 : 0;
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
    if (!containerRef.current) return;
    const isOverZoomCtrl = zoomControlsRef.current && zoomControlsRef.current.contains(e.target as Node);
    const isOverHorizontalScroll = horizontalScrollbarRef.current && horizontalScrollbarRef.current.contains(e.target as Node);
    const isOverVerticalScroll = verticalScrollbarRef.current && verticalScrollbarRef.current.contains(e.target as Node);
    if (isOverZoomCtrl || isOverHorizontalScroll || isOverVerticalScroll) {
      if (!isHoveringUiElement) setIsHoveringUiElement(true);
      if (containerRef.current) containerRef.current.style.cursor = 'default';
      setShowBrushCursor(false);
      setShowEraserCursor(false);
      return;
    }
    if (isHoveringUiElement) setIsHoveringUiElement(false);
    const containerRect = containerRef.current.getBoundingClientRect();
    const currentScale = zoom / 100;
    const mouseX = (e.clientX - containerRect.left - stagePosition.x) / currentScale;
    const mouseY = (e.clientY - containerRect.top - stagePosition.y) / currentScale;
    setCursorPositionOnCanvas({ x: mouseX, y: mouseY });
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
      if (e.buttons === 4 && activeTool?.type !== 'brush' && activeTool?.type !== 'eraser') {
        const dx = e.clientX - lastMousePosition.current.x;
        const dy = e.clientY - lastMousePosition.current.y;
        const currentContentWidth = contextStageSize ? contextStageSize.width * currentScale : 0;
        const currentContentHeight = contextStageSize ? contextStageSize.height * currentScale : 0;
        setStagePosition((prev) => ({
          x: Math.max(Math.min(0, prev.x + dx), containerSize.width - currentContentWidth),
          y: Math.max(Math.min(0, prev.y + dy), containerSize.height - currentContentHeight),
        }));
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
    setCursorPositionOnCanvas(null);
    isDragging.current = false;
    setIsHoveringUiElement(false);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!containerRef.current || !stageRef.current) return;
    const evt = e.evt;
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();

    if (!pointerPosition) return;

    if (isAddModeActive && currentAddToolType && activeTool) {
      let creationType: ShapeType | "text" | "custom-image" | null = null;

      if (activeTool.type === "text" && currentAddToolType === "text") {
        creationType = "text";
      } else if (activeTool.type === "shape") {
        if (currentAddToolType !== "brush" && currentAddToolType !== "eraser" && currentAddToolType !== "text"){
            creationType = currentAddToolType as ShapeType | "custom-image";
        }
      }

      if (creationType) {
        let settingsForElement: Partial<ElementData> = {};
        if (activeElement) { 
            if (creationType === "text" && activeElement.type === "text") {
                settingsForElement.text = "Type here"; 
            } else if (creationType === "custom-image" && activeElement.type === "custom-image") {
                const imageElement = activeElement as ElementData & { src?: string, width?: number, height?: number };
                settingsForElement.src = imageElement.src;
                settingsForElement.width = imageElement.width;
                settingsForElement.height = imageElement.height;
            }
        }
        elementsManager.addElement(creationType, pointerPosition, evt.button === 2, undefined, settingsForElement);
        setIsAddModeActive(false); 
        setCurrentAddToolType(null);
        return; 
      }
    }

    if (activeTool?.type === 'brush' || activeTool?.type === 'eraser') {
      isDragging.current = true;
      const isRightClick = evt.button === 2;
      if (activeTool?.type === 'brush') {
        drawingManager.startDrawing('brush', pointerPosition, isRightClick);
      } else if (activeTool?.type === 'eraser') {
        drawingManager.startDrawing('eraser', pointerPosition);
      }
      return; 
    }

    const target = e.target;
    const clickedOnStageBackground = target === stageRef.current || target.name() === "background";

    if (clickedOnStageBackground) {
      if (elementsManager.selectedElementId) {
        elementsManager.setSelectedElementId(null); 
      }
      if (evt.button === 1) { 
        isDragging.current = true; 
      }
      return;
    }

    if (evt.button === 1) { 
        isDragging.current = true; 
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
    if (isDragging.current) { 
        isDragging.current = false;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const currentDisplayScale = zoom / 100;

  useEffect(() => {
    if (triggerApplyCrop) {
      croppingManager.applyCrop();
    }
  }, [triggerApplyCrop, croppingManager]);

  const handleSetStagePositionFromMiniMap = useCallback((coords: { x: number, y: number }, type: 'center' | 'drag') => {
    if (!stageRef.current || !contextStageSize || !containerRef.current) return;
    const currentScale = zoom / 100;
    const { width: stageWidth, height: stageHeight } = contextStageSize;
    const { clientWidth: containerWidth, clientHeight: containerHeight } = containerRef.current;
    let newStageX = stagePosition.x;
    let newStageY = stagePosition.y;
    if (type === 'center') {
      const targetCanvasX = coords.x * stageWidth;
      const targetCanvasY = coords.y * stageHeight;
      newStageX = containerWidth / 2 - targetCanvasX * currentScale;
      newStageY = containerHeight / 2 - targetCanvasY * currentScale;
    } else if (type === 'drag') {
      newStageX = -coords.x * stageWidth * currentScale;
      newStageY = -coords.y * stageHeight * currentScale;
    }
    const scaledContentWidth = stageWidth * currentScale;
    const scaledContentHeight = stageHeight * currentScale;
    if (scaledContentWidth > containerWidth) {
      newStageX = Math.max(containerWidth - scaledContentWidth, Math.min(0, newStageX));
    } else {
      newStageX = (containerWidth - scaledContentWidth) / 2;
    }
    if (scaledContentHeight > containerHeight) {
      newStageY = Math.max(containerHeight - scaledContentHeight, Math.min(0, newStageY));
    } else {
      newStageY = (containerHeight - scaledContentHeight) / 2;
    }
    setStagePosition({ x: newStageX, y: newStageY });
  }, [contextStageSize, zoom, stagePosition, containerSize.width, containerSize.height, setStagePosition]);

  useEffect(() => {
    if (registerStagePositionUpdater) {
      registerStagePositionUpdater(handleSetStagePositionFromMiniMap);
    }
  }, [registerStagePositionUpdater, handleSetStagePositionFromMiniMap]);

  useEffect(() => {
    if (registerRenderableObjectsRestorer) {
      registerRenderableObjectsRestorer(setRenderableObjects);
    }
  }, [registerRenderableObjectsRestorer, setRenderableObjects]);

  useEffect(() => {
    if (stageRef.current && contextStageSize && containerRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 0.1 });
      setMiniMapDataURL(dataURL);
      const canvasWidth = contextStageSize.width;
      const canvasHeight = contextStageSize.height;
      const viewPortWidth = containerRef.current.clientWidth;
      const viewPortHeight = containerRef.current.clientHeight;
      const visibleXOnCanvas = -stagePosition.x / currentDisplayScale;
      const visibleYOnCanvas = -stagePosition.y / currentDisplayScale;
      const visibleWidthOnCanvas = viewPortWidth / currentDisplayScale;
      const visibleHeightOnCanvas = viewPortHeight / currentDisplayScale;
      const relX = Math.max(0, Math.min(1, visibleXOnCanvas / canvasWidth));
      const relY = Math.max(0, Math.min(1, visibleYOnCanvas / canvasHeight));
      const relWidth = Math.max(0, Math.min(1, visibleWidthOnCanvas / canvasWidth));
      const relHeight = Math.max(0, Math.min(1, visibleHeightOnCanvas / canvasHeight));
      setVisibleCanvasRectOnMiniMap({
        x: relX, y: relY, width: relWidth, height: relHeight,
      });
    } else {
      setMiniMapDataURL(null);
      setVisibleCanvasRectOnMiniMap(null);
    }
  }, [
    renderableObjects, 
    backgroundImage,
    zoom,
    stagePosition,
    contextStageSize,
    containerSize,
    setMiniMapDataURL,
    setVisibleCanvasRectOnMiniMap,
    currentDisplayScale
  ]);

  return (
      <div
          className="w-full h-full bg-[#171719FF] overflow-hidden relative"
          ref={containerRef}
          onMouseMove={handleMouseMoveOnContainer}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseDown={(e) => {
            // Middle mouse button click on container for panning is handled by onWheel or main onMouseDown logic
          }}
          onContextMenu={handleContextMenu}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
      >
        <div
            className="relative"
            style={{
              transform: `scale(${currentDisplayScale})`,
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
              position={cursorPositionOnCanvas}
          />
          <EraserCursor
              size={eraserSize}
              isVisible={showEraserCursor}
              position={cursorPositionOnCanvas}
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
                  name="background"
                  x={0}
                  y={0}
                  width={contextStageSize?.width ?? 0}
                  height={contextStageSize?.height ?? 0}
                  fillPatternImage={createCheckerboardPattern(7, "#1D2023FF", "#2D2F34FF")}
              />
                {backgroundImage && contextStageSize && (
                    <KonvaImage
                        image={backgroundImage}
                        x={0}
                        y={0}
                        width={contextStageSize.width}
                        height={contextStageSize.height}
                        listening={false}
                    />
                )}
            </Layer>
            <Layer perfectDrawEnabled={false}>
              {renderableObjects.map((obj, index) => {
                if ('tool' in obj) {
                  const line = obj as LineData;
                  return (
                    <KonvaLine
                      key={line.id}
                      points={line.points}
                      stroke={line.tool === "eraser" ? "#ffffff" : line.color}
                      strokeWidth={line.strokeWidth}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      opacity={line.opacity}
                      globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"}
                      listening={false}
                  />
                  );
                } else {
                  const element = obj as ElementData;
                  return (
                  <ElementRenderer
                      key={element.id}
                      element={element}
                      onDragEnd={(id, newX, newY) => elementsManager.handleDragEnd(id, newX, newY)}
                      onClick={(id, KonvaE) => elementsManager.handleElementClick(id, KonvaE)}
                      onTextEdit={(id, newText) => elementsManager.updateTextElement(id, newText)}
                      onTransform={(id, attrs) => elementsManager.updateElement(id, attrs as Partial<ElementData>)}
                      isSelected={element.id === elementsManager.selectedElementId}
                  />
                  );
                }
              })}
              <CropTool
                  stageSize={contextStageSize}
                  scale={currentDisplayScale}
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
        <div ref={horizontalScrollbarRef}>
          <ScrollBar
              orientation="horizontal"
              containerSize={containerSize.width}
              contentSize={contentWidth}
              position={-stagePosition.x}
              onScroll={(newPos) => handleScroll("horizontal", newPos)}
          />
        </div>
        <div ref={verticalScrollbarRef}>
          <ScrollBar
              orientation="vertical"
              containerSize={containerSize.height}
              contentSize={contentHeight}
              position={-stagePosition.y}
              onScroll={(newPos) => handleScroll("vertical", newPos)}
          />
        </div>
      </div>
  );
};

export default Canvas;