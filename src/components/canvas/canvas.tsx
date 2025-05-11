import type React from "react";
import { useTool } from "@/context/tool-context";
import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Rect, Circle, Star, RegularPolygon } from "react-konva";
import type Konva from "konva";
import type { ElementData, LineData } from "@/types/canvas";
import BrushCursor from "./BrushCursor";
import EraserCursor from "./EraserCursor";
import { 
  createCheckerboardPattern, 
  calculateCanvasSize, 
  calculateEffectiveEraserSize,
  calculateEraserPressure
} from "@/utils/canvasUtils";

// Компонент кастомной полосы прокрутки
const ScrollBar: React.FC<{
  orientation: "horizontal" | "vertical";
  containerSize: number;
  contentSize: number;
  position: number;
  onScroll: (newPosition: number) => void;
}> = ({ orientation, containerSize, contentSize, position, onScroll }) => {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startDragPos = useRef(0);
  const startScrollPos = useRef(0);

  // Размер полосы прокрутки относительно содержимого
  const thumbSize = Math.max(20, containerSize * (containerSize / contentSize));
  
  // Позиция полосы прокрутки
  const thumbPosition = Math.min(
    containerSize - thumbSize,
    Math.max(0, position * (containerSize / contentSize))
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    if (orientation === "horizontal") {
      startDragPos.current = e.clientX;
    } else {
      startDragPos.current = e.clientY;
    }
    startScrollPos.current = thumbPosition;
    
    // Добавляем обработчики на документ
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    let delta;
    if (orientation === "horizontal") {
      delta = e.clientX - startDragPos.current;
    } else {
      delta = e.clientY - startDragPos.current;
    }
    
    const ratio = contentSize / containerSize;
    const newScrollPos = Math.max(0, Math.min(
      contentSize - containerSize,
      startScrollPos.current + delta * ratio
    ));
    
    onScroll(-newScrollPos);
    
    e.preventDefault();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Очистка обработчиков при размонтировании
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const isVisible = contentSize > containerSize;

  if (!isVisible) return null;

  const style: React.CSSProperties = orientation === "horizontal"
    ? {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "12px",
        backgroundColor: "rgba(30, 30, 30, 0.6)",
      }
    : {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "12px",
        backgroundColor: "rgba(30, 30, 30, 0.6)",
      };

  const thumbStyle: React.CSSProperties = orientation === "horizontal"
    ? {
        position: "absolute",
        left: `${thumbPosition}px`,
        top: "2px",
        width: `${thumbSize}px`,
        height: "8px",
        backgroundColor: "rgba(150, 150, 150, 0.7)",
        borderRadius: "4px",
        cursor: "pointer",
      }
    : {
        position: "absolute",
        top: `${thumbPosition}px`,
        left: "2px",
        width: "8px",
        height: `${thumbSize}px`,
        backgroundColor: "rgba(150, 150, 150, 0.7)",
        borderRadius: "4px",
        cursor: "pointer",
      };

  return (
    <div ref={scrollbarRef} style={style}>
      <div
        style={thumbStyle}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

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
    setZoom
  } = useTool();

  const [lines, setLines] = useState<LineData[]>([]);
  const [elements, setElements] = useState<ElementData[]>([]);
  const isDrawing = useRef(false);
  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [showBrushCursor, setShowBrushCursor] = useState(false);
  const [showEraserCursor, setShowEraserCursor] = useState(false);
  const [stageSize, setStageSize] = useState(calculateCanvasSize());
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Обновляем размеры контейнера при изменении размера окна
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

  // Вычисляем эффективные размеры контента для прокрутки
  const contentWidth = stageSize.width * (zoom / 100);
  const contentHeight = stageSize.height * (zoom / 100);

  useEffect(() => {
    const handleResize = () => {
      setStageSize(calculateCanvasSize());
      centerCanvas();
    };

    // Perform initial setup when component mounts
    setStageSize(calculateCanvasSize()); // Ensure stage size is set based on initial conditions
    centerCanvas(); // Then center the canvas

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Dependency array remains empty to run once on mount and clean up on unmount

  // Центрирование холста при инициализации и изменении масштаба
  // useEffect(() => {
  //   centerCanvas();
  // }, [zoom]); // THIS useEffect was causing the issue, so it's removed.

  // Функция для центрирования холста
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

  // Обработка полосы прокрутки
  const handleScroll = (direction: "horizontal" | "vertical", newPosition: number) => {
    setStagePosition((prev: { x: number, y: number }) => ({
      x: direction === "horizontal" ? newPosition : prev.x,
      y: direction === "vertical" ? newPosition : prev.y
    }));
  };

  // Функция для надежного масштабирования относительно курсора
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

    // Получаем текущие размеры контейнера из состояния
    const { width: currentContainerWidth, height: currentContainerHeight } = containerSize;

    // Рассчитываем новые размеры контента холста после масштабирования
    const newContentWidth = stageSize.width * boundedScale;
    const newContentHeight = stageSize.height * boundedScale;

    // Определяем, будут ли видны полосы прокрутки после масштабирования
    const scrollbarsWillBeVisible =
      newContentWidth > currentContainerWidth || newContentHeight > currentContainerHeight;

    let newPosition;

    if (scrollbarsWillBeVisible) {
      // Масштабирование относительно курсора мыши (когда полосы прокрутки видны)
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
      // Масштабирование по центру (когда полосы прокрутки не видны)
      newPosition = {
        x: (currentContainerWidth - newContentWidth) / 2,
        y: (currentContainerHeight - newContentHeight) / 2,
      };
    }

    setZoom(newZoom);
    setStagePosition(newPosition);
  };

  // Функция для центрирования холста по двойному клику
  const handleDoubleClick = () => {
    centerCanvas();
  };

  const handleMouseMoveOnContainer = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current && activeTool?.type === "cursor") {
      handleMouseMove(e); // Для перетаскивания холста
    }

    if (!containerRef.current) return;
    const container = containerRef.current;

    const containerRect = container.getBoundingClientRect();
    const scaleCompensation = zoom / 100;

    // Координаты мыши относительно контейнера
    const mouseXInContainer = e.clientX - containerRect.left;
    const mouseYInContainer = e.clientY - containerRect.top;

    // Координаты мыши относительно холста Konva (с учетом смещения и масштаба)
    const xOnCanvas = (mouseXInContainer - stagePosition.x) / scaleCompensation;
    const yOnCanvas = (mouseYInContainer - stagePosition.y) / scaleCompensation;

    // Проверка, находится ли курсор над активной областью холста Konva
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
        container.style.cursor = "default"; // или другой курсор для других инструментов
        setShowBrushCursor(false);
        setShowEraserCursor(false);
      }
    } else {
      // Курсор внутри контейнера, но вне холста Konva
      container.style.cursor = "default"; // Показываем системный курсор
      setShowBrushCursor(false);
      setShowEraserCursor(false);
      // setCursorPosition(null); // Можно раскомментировать, если Brush/EraserCursor не должны хранить позицию вне холста
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.cursor = "default"; // Восстанавливаем курсор при выходе из контейнера
    }
    setShowBrushCursor(false);
    setShowEraserCursor(false);
    // setCursorPosition(null); // Аналогично, можно раскомментировать
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    // Если активен инструмент курсора, начинаем перетаскивание
    if (activeTool?.type === "cursor") {
      isDragging.current = true;
      lastMousePosition.current = { x: e.evt.clientX, y: e.evt.clientY };
      return;
    }

    // Определяем текущий цвет в зависимости от кнопки мыши
    const currentColor = e.evt.button === 2 ? secondaryColor : color;

    if (activeTool?.type === "brush") {
      isDrawing.current = true;
      setLines([
        ...lines,
        {
          tool: "brush",
          points: [pos.x, pos.y, pos.x, pos.y],
          color: currentColor,
          strokeWidth: brushSize,
          opacity: opacity / 100,
        },
      ]);
    } else if (activeTool?.type === "eraser") {
      isDrawing.current = true;
      
      // Используем утилиты для расчета эффективного размера и давления ластика
      const effectiveEraserSize = calculateEffectiveEraserSize(eraserSize, eraserHardness);
      const eraserPressure = calculateEraserPressure(eraserHardness);
      
      setLines([
        ...lines,
        {
          tool: "eraser",
          points: [pos.x, pos.y, pos.x, pos.y],
          color: "#ffffff",
          strokeWidth: effectiveEraserSize,
          opacity: eraserPressure,
        },
      ]);
    } else if (activeElement) {
      setElements([
        ...elements,
        {
          type: activeElement.type,
          x: pos.x,
          y: pos.y,
          color: currentColor,
          width: 100,
          height: 100,
          opacity: opacity / 100,
        },
      ]);
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

    if (isDrawing.current && !isDragging.current && 'target' in e) {
      const target = e.target as any;
      if (target && typeof target.getStage === 'function') {
        const stage = target.getStage();
        const point = stage?.getPointerPosition();
        if (!point) return;

        const lastLine = lines[lines.length - 1];
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        setLines([...lines.slice(0, -1), lastLine]);
      }
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
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
            {lines.map((line, i) => (
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
                  );
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
                  );
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
                  );
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
                  );
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
                  );
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
                  );
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
                  );
              }
            })}
          </Layer>
        </Stage>
      </div>
      {/* Информация о холсте и масштабе */}
      <div
        className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md select-none"
        style={{ zIndex: 1000 }} // Убедимся, что поверх всего
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