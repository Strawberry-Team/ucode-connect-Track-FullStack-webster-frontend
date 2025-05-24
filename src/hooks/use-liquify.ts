import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useTool } from '@/context/tool-context';

export interface LiquifyHookProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  imageNodeRef: React.RefObject<Konva.Image | null>; // Ref to the image we are liquifying
  brushSize: number;
  strength: number;
  mode: 'push' | 'reconstruct';
  containerRef: React.RefObject<HTMLDivElement | null>; // For cursor offset calculations
  zoom: number;
  stagePosition: { x: number; y: number };
}

// Interface for storing pixel displacement
interface PixelDisplacement {
  x: number;
  y: number;
}

const useLiquify = ({ 
  stageRef,
  imageNodeRef,
  brushSize,
  strength,
  mode,
  containerRef,
  zoom,
  stagePosition 
}: LiquifyHookProps) => {
  const { addHistoryEntry, renderableObjects } = useTool();
  
  const isLiquifyingRef = useRef(false);
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const baseImageDataRef = useRef<ImageData | null>(null);
  const displacementMapRef = useRef<Map<string, PixelDisplacement>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const animationFrameIdRef = useRef<number | null>(null);

  const getDisplacementKey = (x: number, y: number): string => {
    return `${Math.floor(x)},${Math.floor(y)}`;
  };

  const initializeOffscreenCanvas = useCallback(() => {
    if (!imageNodeRef.current) return false;
    
    const konvaImage = imageNodeRef.current;
    const currentImage = konvaImage.image() as HTMLImageElement | HTMLCanvasElement;
    if (!currentImage) return false;
    
    if (!offscreenCanvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = konvaImage.width();
      canvas.height = konvaImage.height();
      offscreenCanvasRef.current = canvas;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      offscreenCtxRef.current = ctx;
    }
    
    if (offscreenCtxRef.current) {
      offscreenCtxRef.current.clearRect(0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
      offscreenCtxRef.current.drawImage(currentImage, 0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
      
      baseImageDataRef.current = offscreenCtxRef.current.getImageData(0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
    }
    
    displacementMapRef.current.clear();
    setIsInitialized(true);
    return true;
  }, [imageNodeRef]);

  const getMousePosOnCanvas = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !stageRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = (clientX - containerRect.left - stagePosition.x) / scale;
    const y = (clientY - containerRect.top - stagePosition.y) / scale;
    return { x, y };
  }, [containerRef, stageRef, zoom, stagePosition]);

  const getBrushStrength = useCallback((distanceFromCenter: number): number => {
    const radius = brushSize / 2;
    return Math.max(0, 1 - distanceFromCenter / radius) * (strength / 100);
  }, [brushSize, strength]);

  const renderLiquifiedImageToKonva = useCallback(() => {
    if (!offscreenCanvasRef.current || !offscreenCtxRef.current || !baseImageDataRef.current) return;
    
    const canvas = offscreenCanvasRef.current;
    const ctx = offscreenCtxRef.current;
    
    const baseImageData = baseImageDataRef.current;
    const pixels = baseImageData.data;
    const width = canvas.width;
    
    const resultData = ctx.createImageData(canvas.width, canvas.height);
    const resultPixels = resultData.data;
    
    for (let i = 0; i < resultPixels.length; i += 4) {
      resultPixels[i + 3] = 0; // Initialize with transparent
    }
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const key = getDisplacementKey(x, y);
        const displacement = displacementMapRef.current.get(key);
        
        const targetIndex = (y * width + x) * 4;

        if (displacement) {
          const sourceX = Math.round(x - displacement.x);
          const sourceY = Math.round(y - displacement.y);
          
          if (sourceX >= 0 && sourceX < canvas.width && sourceY >= 0 && sourceY < canvas.height) {
            const sourceIndex = (sourceY * width + sourceX) * 4;
            resultPixels[targetIndex] = pixels[sourceIndex];
            resultPixels[targetIndex + 1] = pixels[sourceIndex + 1];
            resultPixels[targetIndex + 2] = pixels[sourceIndex + 2];
            resultPixels[targetIndex + 3] = pixels[sourceIndex + 3];
          } else {
            // Pixel moved out of bounds, make it transparent or a default color
            resultPixels[targetIndex + 3] = 0; 
          }
        } else {
          resultPixels[targetIndex] = pixels[targetIndex];
          resultPixels[targetIndex + 1] = pixels[targetIndex + 1];
          resultPixels[targetIndex + 2] = pixels[targetIndex + 2];
          resultPixels[targetIndex + 3] = pixels[targetIndex + 3];
        }
      }
    }
    
    ctx.putImageData(resultData, 0, 0);
    
    if (imageNodeRef.current) {
      imageNodeRef.current.image(canvas);
      imageNodeRef.current.getLayer()?.batchDraw(); 
    }
    animationFrameIdRef.current = null; // Allow new frame requests
  }, [imageNodeRef]);

  const startLiquify = useCallback((konvaEvent: KonvaEventObject<MouseEvent>) => {
    if (!imageNodeRef.current || !konvaEvent.evt || !imageNodeRef.current.image()) return;
    
    if (!isInitialized || !offscreenCanvasRef.current) {
      const success = initializeOffscreenCanvas();
      if (!success) {
        console.error("Failed to initialize liquify effect");
        return;
      }
    }
    
    const mousePos = getMousePosOnCanvas(konvaEvent.evt.clientX, konvaEvent.evt.clientY);
    if (!mousePos) return;

    isLiquifyingRef.current = true;
    lastMousePositionRef.current = mousePos;
    
    // console.log(`Liquify Start: Mode=${mode}, Size=${brushSize}, Strength=${strength}`, mousePos);
  }, [imageNodeRef, isInitialized, initializeOffscreenCanvas, getMousePosOnCanvas]);

  const processLiquify = useCallback((konvaEvent: KonvaEventObject<MouseEvent>) => {
    if (!isLiquifyingRef.current || !imageNodeRef.current || !lastMousePositionRef.current || !konvaEvent.evt) return;
    if (!offscreenCanvasRef.current || !offscreenCtxRef.current) return;
    
    const currentMousePos = getMousePosOnCanvas(konvaEvent.evt.clientX, konvaEvent.evt.clientY);
    if (!currentMousePos) return;

    const dx = currentMousePos.x - lastMousePositionRef.current.x;
    const dy = currentMousePos.y - lastMousePositionRef.current.y;
    
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && mode === 'push') { // Less sensitive for push
        lastMousePositionRef.current = currentMousePos; // Update mouse position to avoid large jumps
        return;
    }

    const brushRadius = brushSize / 2;
    const processAreaX = Math.floor(currentMousePos.x - brushRadius);
    const processAreaY = Math.floor(currentMousePos.y - brushRadius);
    const processAreaWidth = Math.ceil(brushSize);
    const processAreaHeight = Math.ceil(brushSize);

    let displacementChanged = false;
    
    for (let py = 0; py < processAreaHeight; py++) {
      for (let px = 0; px < processAreaWidth; px++) {
        const pixelX = processAreaX + px;
        const pixelY = processAreaY + py;

        // Ensure pixel is within canvas bounds
        if (pixelX < 0 || pixelX >= offscreenCanvasRef.current.width || pixelY < 0 || pixelY >= offscreenCanvasRef.current.height) {
            continue;
        }
        
        const distX = pixelX - currentMousePos.x;
        const distY = pixelY - currentMousePos.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        if (distance > brushRadius) continue;
        
        const effectStrength = getBrushStrength(distance);
        const key = getDisplacementKey(pixelX, pixelY);

        if (mode === 'push') {
          const displaceX = dx * effectStrength;
          const displaceY = dy * effectStrength;
          const existingDisplacement = displacementMapRef.current.get(key) || { x: 0, y: 0 };
          const newDisplacement = {
            x: existingDisplacement.x + displaceX,
            y: existingDisplacement.y + displaceY
          };
          displacementMapRef.current.set(key, newDisplacement);
          displacementChanged = true;
        } else if (mode === 'reconstruct') {
          const existingDisplacement = displacementMapRef.current.get(key);
          if (existingDisplacement) {
            const reconstructFactor = 0.1 * effectStrength; // Slower, controlled reconstruction
            const newDisplacement = {
              x: existingDisplacement.x * (1 - reconstructFactor),
              y: existingDisplacement.y * (1 - reconstructFactor)
            };
            if (Math.abs(newDisplacement.x) < 0.1 && Math.abs(newDisplacement.y) < 0.1) {
              displacementMapRef.current.delete(key);
            } else {
              displacementMapRef.current.set(key, newDisplacement);
            }
            displacementChanged = true;
          }
        }
      }
    }
    
    if (displacementChanged && !animationFrameIdRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(renderLiquifiedImageToKonva);
    }
    
    lastMousePositionRef.current = currentMousePos;
  }, [
    imageNodeRef, 
    brushSize, 
    strength, 
    mode, 
    getMousePosOnCanvas, 
    getBrushStrength, 
    renderLiquifiedImageToKonva // Added as dependency
  ]);

  const endLiquify = useCallback(() => {
    if (!isLiquifyingRef.current) return;
    isLiquifyingRef.current = false;
    lastMousePositionRef.current = null;
    
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    // Ensure the final state is rendered
    renderLiquifiedImageToKonva();
    
    if (imageNodeRef.current?.image()) {
      addHistoryEntry({
        type: 'liquifyApplied',
        description: `liquify`,
        linesSnapshot: renderableObjects,
        metadata: {}
      });
    }
    
    // console.log("Liquify End");
  }, [mode, strength, addHistoryEntry, renderableObjects]);

  const getIsLiquifying = () => isLiquifyingRef.current;

  // Reset all liquify effects
  const resetLiquify = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    displacementMapRef.current.clear();
    baseImageDataRef.current = null;
    setIsInitialized(false); // Force reinitialization if used again
    
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return {
    startLiquify,
    processLiquify,
    endLiquify,
    getIsLiquifying,
    resetLiquify
  };
};

export default useLiquify; 