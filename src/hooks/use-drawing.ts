import { useState, useRef } from "react";
import type { LineData } from "@/types/canvas";
import { calculateEffectiveEraserSize, calculateEraserPressure } from "@/utils/canvas-utils";
import type { MirrorMode } from "@/context/tool-context";

export interface DrawingProps {
  color: string;
  secondaryColor: string;
  brushSize: number;
  eraserSize: number;
  opacity: number;
  eraserOpacity: number;
  eraserHardness: number;
  brushMirrorMode: MirrorMode;
  eraserMirrorMode: MirrorMode;
  activeToolType: string | null;
  canvasWidth: number;
  canvasHeight: number;
}

const useDrawing = ({
  color,
  secondaryColor,
  brushSize,
  eraserSize,
  opacity,
  eraserHardness,
  brushMirrorMode,
  eraserMirrorMode,
  activeToolType,
  canvasWidth,
  canvasHeight
}: DrawingProps) => {
  const [lines, setLines] = useState<LineData[]>([]);
  const isDrawing = useRef(false);
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const getCurrentMirrorMode = (): MirrorMode => {
    if (activeToolType === 'brush') {
      return brushMirrorMode;
    }
    if (activeToolType === 'eraser') {
      return eraserMirrorMode;
    }
    return 'None';
  };

  const getMirroredPoints = (x: number, y: number): { x: number, y: number }[] => {
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
  };

  const startDrawing = (
    tool: "brush" | "eraser",
    pos: { x: number; y: number },
    isRightClick: boolean = false
  ) => {
    isDrawing.current = true;

    const currentMirrorMode = getCurrentMirrorMode();

    if (tool === "brush") {
      const currentColor = isRightClick ? secondaryColor : color;
      
      const newLines: LineData[] = [];
      
      newLines.push({
        tool: "brush",
        points: [pos.x, pos.y, pos.x, pos.y],
        color: currentColor,
        strokeWidth: brushSize,
        opacity: opacity / 100,
      });
      
      if (currentMirrorMode !== "None") {
        const mirroredPoints = getMirroredPoints(pos.x, pos.y);
        
        for (let i = 1; i < mirroredPoints.length; i++) {
          const mirrorPos = mirroredPoints[i];
          newLines.push({
            tool: "brush",
            points: [mirrorPos.x, mirrorPos.y, mirrorPos.x, mirrorPos.y],
            color: currentColor,
            strokeWidth: brushSize,
            opacity: opacity / 100,
          });
        }
      }
      
      setLines([...lines, ...newLines]);
      
    } else if (tool === "eraser") {
      const effectiveEraserSize = calculateEffectiveEraserSize(eraserSize, eraserHardness);
      const eraserPressure = calculateEraserPressure(eraserHardness);
      
      const newLines: LineData[] = [];
      
      newLines.push({
        tool: "eraser",
        points: [pos.x, pos.y, pos.x, pos.y],
        color: "#ffffff",
        strokeWidth: effectiveEraserSize,
        opacity: eraserPressure,
      });
      
      if (currentMirrorMode !== "None") {
        const mirroredPoints = getMirroredPoints(pos.x, pos.y);
        
        for (let i = 1; i < mirroredPoints.length; i++) {
          const mirrorPos = mirroredPoints[i];
          newLines.push({
            tool: "eraser",
            points: [mirrorPos.x, mirrorPos.y, mirrorPos.x, mirrorPos.y],
            color: "#ffffff",
            strokeWidth: effectiveEraserSize,
            opacity: eraserPressure,
          });
        }
      }
      
      setLines([...lines, ...newLines]);
    }
  };

  const continueDrawing = (pos: { x: number; y: number }) => {
    if (!isDrawing.current) return;

    const currentMirrorMode = getCurrentMirrorMode();
    let linesToUpdate = 1;
    if (currentMirrorMode === "Vertical" || currentMirrorMode === "Horizontal") {
      linesToUpdate = 2;
    } else if (currentMirrorMode === "Four-way") {
      linesToUpdate = 4;
    }

    const updatedLines = [...lines.slice(0, -linesToUpdate)];
    
    const linesToModify = lines.slice(-linesToUpdate);
    
    const mainLine = linesToModify[0];
    mainLine.points = mainLine.points.concat([pos.x, pos.y]);
    updatedLines.push(mainLine);
    
    if (currentMirrorMode !== "None" && linesToModify.length > 1) {
      const mirroredPoints = getMirroredPoints(pos.x, pos.y);
      
      for (let i = 1; i < linesToModify.length; i++) {
        const mirrorLine = linesToModify[i];
        const mirrorPos = mirroredPoints[i];
        mirrorLine.points = mirrorLine.points.concat([mirrorPos.x, mirrorPos.y]);
        updatedLines.push(mirrorLine);
      }
    }
    
    setLines(updatedLines);
  };

  const endDrawing = () => {
    isDrawing.current = false;
  };

  const getIsDrawing = () => isDrawing.current;

  return {
    lines,
    setLines,
    getIsDrawing,
    startDrawing,
    continueDrawing,
    endDrawing
  };
};

export default useDrawing; 