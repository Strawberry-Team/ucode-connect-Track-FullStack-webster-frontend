import { useState, useRef, useCallback } from "react";
import type { LineData, RenderableObject } from "@/types/canvas";
import { calculateEffectiveEraserSize, calculateEraserPressure } from "@/utils/canvas-utils";
import type { MirrorMode } from "@/context/tool-context";
import { useTool } from "@/context/tool-context";
import { Brush, Eraser } from "lucide-react";
import { toast } from "sonner";
import { MoveIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from 'react';

export interface DrawingProps {
  canvasWidth: number;
  canvasHeight: number;
}

const useDrawing = ({
  canvasWidth,
  canvasHeight
}: DrawingProps) => {
  // const [lines, setLines] = useState<LineData[]>([]);
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
        addRenderableObject,
        renderableObjects,
        updateLinePoints,
        updateMultipleLinePoints,
        setRenderableObjects,
    } = useTool();

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const { addHistoryEntry, history, currentHistoryIndex, setLastDrawingEndTime } = useTool();

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
      eraserHardness,
      currentHistoryIndex,
      history
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
        setRenderableObjects(filteredObjects);
    }, [renderableObjects, setRenderableObjects]);

    const prepareLineForTransform = useCallback((lineId: string) => {
        (setRenderableObjects as Dispatch<SetStateAction<RenderableObject[]>>)((prev: RenderableObject[]) => {
            const lineIndex = prev.findIndex(obj => obj.id === lineId && 'tool' in obj && (obj.tool === 'brush' || obj.tool === 'eraser'));
            if (lineIndex === -1) return prev;

            const lineToPrepare = prev[lineIndex] as LineData & { x?: number, y?: number, rotation?: number, scaleX?: number, scaleY?: number, offsetX?: number, offsetY?: number };
            
            if (lineToPrepare.offsetX !== undefined && lineToPrepare.offsetY !== undefined) {
                return prev;
            }

            const points = lineToPrepare.points;
            if (points.length < 2) return prev;

            let minX = points[0], maxX = points[0];
            let minY = points[1], maxY = points[1];
            for (let i = 2; i < points.length; i += 2) {
                minX = Math.min(minX, points[i]);
                maxX = Math.max(maxX, points[i]);
                minY = Math.min(minY, points[i+1]);
                maxY = Math.max(maxY, points[i+1]);
            }

            const bbox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
            
            const newOffsetX = bbox.width / 2;
            const newOffsetY = bbox.height / 2;
            
            const newX = bbox.x + newOffsetX;
            const newY = bbox.y + newOffsetY;

            const newPoints = points.map((val, index) => {
                return index % 2 === 0 ? val - bbox.x : val - bbox.y;
            });

            const updatedLine = {
                ...lineToPrepare,
                points: newPoints,
                x: newX,
                y: newY,
                offsetX: newOffsetX,
                offsetY: newOffsetY,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
            };
            
            const newRenderableObjects = [...prev];
            newRenderableObjects[lineIndex] = updatedLine;
            return newRenderableObjects;
        });
    }, [setRenderableObjects]);

    const updateLineTransform = useCallback((lineId: string, newAttrs: { x: number, y: number, rotation: number, scaleX: number, scaleY: number }) => {
        (setRenderableObjects as Dispatch<SetStateAction<RenderableObject[]>>)((prev: RenderableObject[]) => 
            prev.map(obj => {
                if (obj.id === lineId && 'tool' in obj && (obj.tool === 'brush' || obj.tool === 'eraser')) {
                    const lineToUpdate = obj as LineData & { x?: number, y?: number, rotation?: number, scaleX?: number, scaleY?: number, offsetX?: number, offsetY?: number };
                    return { 
                        ...lineToUpdate, 
                        x: newAttrs.x,
                        y: newAttrs.y,
                        rotation: newAttrs.rotation,
                        scaleX: newAttrs.scaleX,
                        scaleY: newAttrs.scaleY,
                    };
                }
                return obj;
            })
        );

        const snapshot = renderableObjects.map(obj => ({...obj}));
        addHistoryEntry({
            type: 'elementModified',
            description: <> <MoveIcon className="inline-block w-4 h-4 mr-1" /> Line transformed</>,
            linesSnapshot: snapshot,
        });

    }, [setRenderableObjects, addHistoryEntry, renderableObjects]);

    const updateLinePositionAndHistory = useCallback((lineId: string, newX: number, newY: number) => {
        (setRenderableObjects as Dispatch<SetStateAction<RenderableObject[]>>)((prev: RenderableObject[]) =>
            prev.map(obj => {
                if (obj.id === lineId && 'tool' in obj && (obj.tool === 'brush' || obj.tool === 'eraser')) {
                    const lineToUpdate = obj as LineData & { x?: number, y?: number, offsetX?: number, offsetY?: number };
                    // Ensure offsetX and offsetY are defined, meaning prepareLineForTransform has been called
                    if (lineToUpdate.offsetX === undefined || lineToUpdate.offsetY === undefined) {
                        console.warn("updateLinePositionAndHistory called on a line not prepared for transform.");
                        return obj; // Return original object if not prepared
                    }
                    return {
                        ...lineToUpdate,
                        x: newX,
                        y: newY,
                    };
                }
                return obj;
            })
        );

        // Add history entry for the drag operation
        // Creating a snapshot for history. Ensure this logic is robust.
        // It might be better to get the updated state of renderableObjects for the snapshot.
        // For now, let's assume renderableObjects is updated by the time this runs or use a callback approach if needed.
        // To ensure the snapshot is current, we might need to rethink how snapshots are taken or pass the updated list.
        // For simplicity, using the current `renderableObjects` state. This might capture the state *before* this specific update fully propagates.
        // Consider using the result of the setRenderableObjects callback if a more accurate snapshot is needed immediately.
        
        // A more robust way to get the snapshot would be to do it after the state update:
        // 1. Update state.
        // 2. In a useEffect that listens to renderableObjects, or via a callback from setRenderableObjects, create the history entry.
        // However, to keep it within this callback for now:
        const currentSnapshot = renderableObjects.map(obj => {
            if ('points' in obj) {
                return { ...obj, points: [...obj.points] };
            }
            return { ...obj };
        });

        addHistoryEntry({
            type: 'elementModified', // Or a more specific 'lineMoved' type if desired
            description: <> <MoveIcon className="inline-block w-4 h-4 mr-1" /> Line moved</>,
            linesSnapshot: currentSnapshot,
        });

    }, [setRenderableObjects, addHistoryEntry, renderableObjects]);

    return {
        getIsDrawing,
        startDrawing,
        continueDrawing,
        endDrawing,
        clearDrawingLines,
        prepareLineForTransform,
        updateLineTransform,
        updateLinePositionAndHistory,
    };
};

export default useDrawing; 