import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useTool } from '@/context/tool-context';

export interface BlurHookProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  imageNodeRef: React.RefObject<Konva.Image | null>; // Ref to the image we are blurring
  brushSize: number;
  strength: number; // Strength of the blur (e.g., blur radius or iteration count)
  containerRef: React.RefObject<HTMLDivElement | null>; // For cursor offset calculations
  zoom: number;
  stagePosition: { x: number; y: number };
}

const useBlur = ({
  stageRef,
  imageNodeRef,
  brushSize,
  strength,
  containerRef,
  zoom,
  stagePosition,
}: BlurHookProps) => {
  const { addHistoryEntry, renderableObjects } = useTool();
  
  const isBlurringRef = useRef(false);
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize offscreen canvas and context with the original image
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
    }
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

  // Applies blur to a region of the offscreen canvas and updates Konva image
  const applyBlurToRegion = useCallback((centerX: number, centerY: number) => {
    if (!offscreenCtxRef.current || !offscreenCanvasRef.current || !imageNodeRef.current) return;

    const ctx = offscreenCtxRef.current;
    const canvas = offscreenCanvasRef.current;
    const konvaImageNode = imageNodeRef.current;
    
    const radius = brushSize / 2;
    const blurAmount = Math.max(1, Math.floor(strength / 10)); // Scale strength to blur radius/iterations
    const hardness = 100 - strength; // Invert strength to get hardness (0-100)

    // Define the area to apply blur (bounding box of the brush)
    const dirtyRectX = Math.max(0, Math.floor(centerX - radius - blurAmount));
    const dirtyRectY = Math.max(0, Math.floor(centerY - radius - blurAmount));
    const dirtyRectWidth = Math.min(canvas.width - dirtyRectX, Math.ceil(brushSize + blurAmount * 2));
    const dirtyRectHeight = Math.min(canvas.height - dirtyRectY, Math.ceil(brushSize + blurAmount * 2));

    if (dirtyRectWidth <= 0 || dirtyRectHeight <= 0) return; // Nothing to blur

    // Create a temporary canvas for the blur operation to avoid read-modify-write on the same canvas data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = dirtyRectWidth;
    tempCanvas.height = dirtyRectHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if(!tempCtx) return;

    // Draw the portion of the *current* offscreen canvas to the temp canvas
    tempCtx.drawImage(canvas, dirtyRectX, dirtyRectY, dirtyRectWidth, dirtyRectHeight, 0, 0, dirtyRectWidth, dirtyRectHeight);
    
    // Apply Gaussian blur
    tempCtx.filter = `blur(${blurAmount}px)`;
    tempCtx.drawImage(tempCanvas, 0, 0);
    tempCtx.filter = 'none'; // Reset filter

  
    ctx.save();
    ctx.globalAlpha = (100 - hardness) / 100;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(tempCanvas, 0, 0, dirtyRectWidth, dirtyRectHeight, 
                  dirtyRectX, dirtyRectY, dirtyRectWidth, dirtyRectHeight);
    
    ctx.restore();

    // Update the Konva Image node
    konvaImageNode.image(canvas); // Update with the modified offscreen canvas
    konvaImageNode.getLayer()?.batchDraw();
  }, [brushSize, strength, imageNodeRef]);

  const startBlurring = useCallback((konvaEvent: KonvaEventObject<MouseEvent>) => {
    if (!imageNodeRef.current || !konvaEvent.evt || !imageNodeRef.current.image()) return;

    if (!isInitialized) {
      const success = initializeOffscreenCanvas();
      if (!success) {
        console.error("Failed to initialize blur effect");
        return;
      }
    }

    const mousePos = getMousePosOnCanvas(konvaEvent.evt.clientX, konvaEvent.evt.clientY);
    if (!mousePos) return;

    isBlurringRef.current = true;
    lastMousePositionRef.current = mousePos;
    applyBlurToRegion(mousePos.x, mousePos.y); // Apply blur at the start point
  }, [imageNodeRef, isInitialized, initializeOffscreenCanvas, getMousePosOnCanvas, applyBlurToRegion]);

  const processBlurring = useCallback((konvaEvent: KonvaEventObject<MouseEvent>) => {
    if (!isBlurringRef.current || !imageNodeRef.current || !lastMousePositionRef.current || !konvaEvent.evt) return;
    
    const currentMousePos = getMousePosOnCanvas(konvaEvent.evt.clientX, konvaEvent.evt.clientY);
    if (!currentMousePos) return;

    // Interpolate points between last and current mouse position for smoother blur
    const dist = Math.sqrt(
      Math.pow(currentMousePos.x - lastMousePositionRef.current.x, 2) +
      Math.pow(currentMousePos.y - lastMousePositionRef.current.y, 2)
    );
    const stepSize = brushSize / 4; // Apply blur at smaller intervals than brush size

    if (dist > stepSize) {
      const steps = Math.floor(dist / stepSize);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const interpX = lastMousePositionRef.current.x + (currentMousePos.x - lastMousePositionRef.current.x) * t;
        const interpY = lastMousePositionRef.current.y + (currentMousePos.y - lastMousePositionRef.current.y) * t;
        applyBlurToRegion(interpX, interpY);
      }
    } else {
        applyBlurToRegion(currentMousePos.x, currentMousePos.y);
    }
    
    lastMousePositionRef.current = currentMousePos;
    // No need for requestAnimationFrame here if applyBlurToRegion handles drawing
  }, [imageNodeRef, brushSize, getMousePosOnCanvas, applyBlurToRegion]);

  const endBlurring = useCallback(() => {
    if (!isBlurringRef.current) return;
    isBlurringRef.current = false;
    
    if (imageNodeRef.current?.image()) {
      addHistoryEntry({
        type: 'blurApplied',
        description: `blur`, 
        linesSnapshot: renderableObjects,
        metadata: {}
      });
    }
  }, [strength, addHistoryEntry, renderableObjects]);

  const getIsBlurring = () => isBlurringRef.current;

  const resetBlur = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
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
    startBlurring,
    processBlurring,
    endBlurring,
    getIsBlurring,
    resetBlur,
  };
};

export default useBlur; 