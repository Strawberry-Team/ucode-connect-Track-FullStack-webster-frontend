import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useTool } from '@/context/tool-context';

export interface BlurHookProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  selectedImageId: string | null; // ID of the selected image to blur
  brushSize: number;
  strength: number; // Strength of the blur (e.g., blur radius or iteration count)
  containerRef: React.RefObject<HTMLDivElement | null>; // For cursor offset calculations
  zoom: number;
  stagePosition: { x: number; y: number };
}

const useBlur = ({
  stageRef,
  selectedImageId,
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
  const originalImageDataRef = useRef<ImageData | null>(null);
  const originalImageRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);

  // Helper function to get the selected image node
  const getSelectedImageNode = (): Konva.Image | null => {
    if (!selectedImageId || !stageRef.current) return null;
    
    // Find the image node by its ID in the stage
    const nodes = stageRef.current.find('Image');
    for (const node of nodes) {
      if (node.id() === selectedImageId) {
        return node as Konva.Image;
      }
    }
    return null;
  };

  // Initialize offscreen canvas and context with the original image
  const initializeOffscreenCanvas = useCallback(() => {
    const imageNode = getSelectedImageNode();
    if (!imageNode) return false;
    
    const konvaImage = imageNode;
    const currentImage = konvaImage.image() as HTMLImageElement | HTMLCanvasElement;
    if (!currentImage) return false;

    // Store original image reference if not already stored
    if (!originalImageRef.current) {
      originalImageRef.current = currentImage;
    }

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
      // Always use original image for initialization, not current modified image
      const imageToUse = originalImageRef.current || currentImage;
      offscreenCtxRef.current.clearRect(0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
      offscreenCtxRef.current.drawImage(imageToUse, 0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
      
      // Store original image data for reset functionality
      originalImageDataRef.current = offscreenCtxRef.current.getImageData(0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
    }
    setIsInitialized(true);
    return true;
  }, [selectedImageId, stageRef]);

  const getMousePosOnCanvas = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !stageRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = (clientX - containerRect.left - stagePosition.x) / scale;
    const y = (clientY - containerRect.top - stagePosition.y) / scale;
    return { x, y };
  }, [containerRef, stageRef, zoom, stagePosition]);

  // Convert canvas coordinates to image-local coordinates
  const getMousePosOnImage = useCallback((canvasX: number, canvasY: number) => {
    const imageNode = getSelectedImageNode();
    if (!imageNode) return null;
    
    // Get image transform properties
    const imageX = imageNode.x();
    const imageY = imageNode.y();
    const imageWidth = imageNode.width();
    const imageHeight = imageNode.height();
    const imageScaleX = imageNode.scaleX();
    const imageScaleY = imageNode.scaleY();
    const imageRotation = imageNode.rotation(); // In radians
    const imageOffsetX = imageNode.offsetX();
    const imageOffsetY = imageNode.offsetY();

    // Transform canvas coordinates to image coordinates
    // First, translate relative to image position
    let localX = canvasX - imageX;
    let localY = canvasY - imageY;

    // Apply rotation (if any) - reverse rotation
    if (imageRotation !== 0) {
      const cos = Math.cos(-imageRotation);
      const sin = Math.sin(-imageRotation);
      const rotatedX = localX * cos - localY * sin;
      const rotatedY = localX * sin + localY * cos;
      localX = rotatedX;
      localY = rotatedY;
    }

    // Apply scale transformation - reverse scale
    localX = localX / imageScaleX;
    localY = localY / imageScaleY;

    // Apply offset
    localX += imageOffsetX;
    localY += imageOffsetY;

    // Check if the point is within image bounds
    if (localX < 0 || localX >= imageWidth || localY < 0 || localY >= imageHeight) {
      return null; // Outside image bounds
    }

    return { x: localX, y: localY };
  }, [selectedImageId, stageRef]);

  // Applies blur to a region of the offscreen canvas and updates Konva image
  const applyBlurToRegion = useCallback((centerX: number, centerY: number) => {
    const imageNode = getSelectedImageNode();
    if (!offscreenCtxRef.current || !offscreenCanvasRef.current || !imageNode) return;

    const ctx = offscreenCtxRef.current;
    const canvas = offscreenCanvasRef.current;
    const konvaImageNode = imageNode;
    
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
  }, [brushSize, strength, selectedImageId, stageRef]);

  const startBlurring = useCallback((konvaEvent: KonvaEventObject<MouseEvent>) => {
    const imageNode = getSelectedImageNode();
    if (!imageNode || !konvaEvent.evt || !imageNode.image()) return;

    if (!isInitialized) {
      const success = initializeOffscreenCanvas();
      if (!success) {
        console.error("Failed to initialize blur effect");
        return;
      }
    }

    const canvasPos = getMousePosOnCanvas(konvaEvent.evt.clientX, konvaEvent.evt.clientY);
    if (!canvasPos) return;

    const imagePos = getMousePosOnImage(canvasPos.x, canvasPos.y);
    if (!imagePos) return; // Outside image bounds

    isBlurringRef.current = true;
    lastMousePositionRef.current = imagePos;
    applyBlurToRegion(imagePos.x, imagePos.y); // Apply blur at the start point
  }, [selectedImageId, stageRef, isInitialized, initializeOffscreenCanvas, getMousePosOnCanvas, getMousePosOnImage, applyBlurToRegion]);

  const processBlurring = useCallback((konvaEvent: KonvaEventObject<MouseEvent>) => {
    const imageNode = getSelectedImageNode();
    if (!isBlurringRef.current || !imageNode || !lastMousePositionRef.current || !konvaEvent.evt) return;
    
    const canvasPos = getMousePosOnCanvas(konvaEvent.evt.clientX, konvaEvent.evt.clientY);
    if (!canvasPos) return;

    const currentMousePos = getMousePosOnImage(canvasPos.x, canvasPos.y);
    if (!currentMousePos) return; // Outside image bounds

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
  }, [selectedImageId, stageRef, brushSize, getMousePosOnCanvas, getMousePosOnImage, applyBlurToRegion]);

  const endBlurring = useCallback(() => {
    if (!isBlurringRef.current) return;
    isBlurringRef.current = false;
    
    const imageNode = getSelectedImageNode();
    if (imageNode?.image()) {
      addHistoryEntry({
        type: 'blurApplied',
        description: `blur`, 
        linesSnapshot: renderableObjects,
        metadata: {}
      });
    }
  }, [selectedImageId, stageRef, strength, addHistoryEntry, renderableObjects]);

  const getIsBlurring = () => isBlurringRef.current;

  const resetBlur = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    const imageNode = getSelectedImageNode();
    if (imageNode && originalImageRef.current) {
      // Restore original image directly from original image reference
      imageNode.image(originalImageRef.current);
      imageNode.getLayer()?.batchDraw();
    }
    
    setIsInitialized(false); // Force reinitialization if used again
    
  }, [selectedImageId, stageRef]);

  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // Reset when selected image changes
  useEffect(() => {
    setIsInitialized(false);
    originalImageRef.current = null;
    originalImageDataRef.current = null;
  }, [selectedImageId]);

  return {
    startBlurring,
    processBlurring,
    endBlurring,
    getIsBlurring,
    resetBlur,
  };
};

export default useBlur; 