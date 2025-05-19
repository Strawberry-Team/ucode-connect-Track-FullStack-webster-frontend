import { useState, useRef, useCallback } from "react";
import type { LineData } from "@/types/canvas";
import { calculateEffectiveEraserSize, calculateEraserPressure } from "@/utils/canvas-utils";
import type { MirrorMode } from "@/context/tool-context";
import { useTool } from "@/context/tool-context";
import { Brush, Eraser } from "lucide-react";
import { toast } from "sonner";

export interface DrawingProps {
  canvasWidth: number;
  canvasHeight: number;
}

const useDrawing = ({
  canvasWidth,
  canvasHeight
}: DrawingProps) => {
  const [lines, setLines] = useState<LineData[]>([]);
  const isDrawing = useRef(false);

    const {
        color,
        secondaryColor,
        brushSize,
        eraserSize,
        opacity,
        eraserHardness,
        brushMirrorMode,
        eraserMirrorMode,
        activeTool,
        addHistoryEntry,
        addRenderableObject,
        renderableObjects,
        updateLinePoints,
        updateMultipleLinePoints,
    } = useTool();

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const { addHistoryEntry, history, currentHistoryIndex } = useTool();

    const getCurrentMirrorMode = useCallback((): MirrorMode => {
        if (activeTool?.type === 'brush') {
            return brushMirrorMode;
        }
        if (activeTool?.type === 'eraser') {
            return eraserMirrorMode;
        }
        return 'None';
    }, [activeTool, brushMirrorMode, eraserMirrorMode]);

    const getMirroredPoints = useCallback((x: number, y: number): { x: number, y: number }[] => {
    const points: { x: number, y: number }[] = [{ x, y }];
    const currentMirrorMode = getCurrentMirrorMode();

    switch (currentMirrorMode) {
      case "Vertical":
        points.push({ x: 2 * centerX - x, y });
        break;
      case "Horizontal":
        points.push({ x, y: 2 * centerY - y });
        break;
      case "Four-way":
        points.push(
          { x: 2 * centerX - x, y },
          { x, y: 2 * centerY - y },
          { x: 2 * centerX - x, y: 2 * centerY - y }
        );
        break;
      default:
        break;
    }

    return points;
  }, [centerX, centerY, getCurrentMirrorMode]);

  const currentStrokeLineIds = useRef<string[]>([]);

  const startDrawing = useCallback((
    tool: "brush" | "eraser",
    pos: { x: number; y: number },
    isRightClick: boolean = false
  ) => {
    isDrawing.current = true;
    currentStrokeLineIds.current = [];

      const mirroredInitialPoints = getMirroredPoints(pos.x, pos.y);

      mirroredInitialPoints.forEach(p => {
          const lineId = `line-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          currentStrokeLineIds.current.push(lineId);


  if (currentHistoryIndex < history.length - 1 && history.length > 0) {
      toast.info("History changed", {
          description: "You will not be able to revert to the undone changes",
          duration: 5000,
      });
  }

          if (tool === "brush") {
              const currentColor = isRightClick ? secondaryColor : color;
              addRenderableObject({
                  id: lineId,
                  tool: "brush",
                  points: [p.x, p.y, p.x, p.y],
                  color: currentColor,
                  strokeWidth: brushSize,
                  opacity: opacity / 100,
              });
          } else if (tool === "eraser") {
              const effectiveEraserSize = calculateEffectiveEraserSize(eraserSize, eraserHardness);
              const eraserPressure = calculateEraserPressure(eraserHardness);
              addRenderableObject({
                  id: lineId,
                  tool: "eraser",
                  points: [p.x, p.y, p.x, p.y],
                  color: "#ffffff",
                  strokeWidth: effectiveEraserSize,
                  opacity: eraserPressure,
              });
          }
      });
  }, [
      getMirroredPoints,
      secondaryColor,
      color,
      addRenderableObject,
      brushSize,
      opacity,
      eraserSize,
      eraserHardness
  ]);


    const continueDrawing = useCallback((pos: { x: number; y: number }) => {
        if (!isDrawing.current || currentStrokeLineIds.current.length === 0) return;

        const mirroredDrawingPoints = getMirroredPoints(pos.x, pos.y);

        if (currentStrokeLineIds.current.length === mirroredDrawingPoints.length) {
            const updates: Array<{ id: string; pointsToAdd: number[] }> = [];
            for (let i = 0; i < currentStrokeLineIds.current.length; i++) {
                const lineId = currentStrokeLineIds.current[i];
                const point = mirroredDrawingPoints[i];
                updates.push({ id: lineId, pointsToAdd: [point.x, point.y] });
            }
            updateMultipleLinePoints(updates);
        } else {
            console.error("Mismatch between current stroke IDs and mirrored points during continueDrawing.");
            if (currentStrokeLineIds.current.length > 0 && mirroredDrawingPoints.length > 0) {
                updateLinePoints(currentStrokeLineIds.current[0], [mirroredDrawingPoints[0].x, mirroredDrawingPoints[0].y]);
            }
        }
    }, [getMirroredPoints, updateMultipleLinePoints, updateLinePoints]);

    const endDrawing = useCallback(() => {
        if (isDrawing.current) {
            const currentToolType = activeTool?.type;
            let description: React.ReactNode = "Unknown action";
            let historyEntryType: 'brushStroke' | 'eraserStroke' | 'unknown' = 'unknown';

            if (currentToolType === 'brush') {
                description = <><Brush className="inline-block w-4 h-4 mr-1" /> brush</>;
                historyEntryType = 'brushStroke';
            } else if (currentToolType === 'eraser') {
                description = <><Eraser className="inline-block w-4 h-4 mr-1" /> eraser</>;
                historyEntryType = 'eraserStroke';
            }

            const snapshot = renderableObjects.map(obj => {
                if ('points' in obj) {
                    return { ...obj, points: [...obj.points] };
                }
                return { ...obj };
            });

            addHistoryEntry({ type: historyEntryType, description, linesSnapshot: snapshot });
        }
        isDrawing.current = false;
        currentStrokeLineIds.current = [];
    }, [activeTool, addHistoryEntry, renderableObjects]);

    const getIsDrawing = () => isDrawing.current;

    const clearDrawingLines = useCallback(() => {
        const filteredObjects = renderableObjects.filter(obj => !('tool' in obj));
        console.warn("'clearDrawingLines' is a placeholder. Awaiting full history/object management integration for proper line clearing without affecting other elements.");
    }, [renderableObjects]);

    return {
        getIsDrawing,
        startDrawing,
        continueDrawing,
        endDrawing,
        clearDrawingLines
    };
};

export default useDrawing; 