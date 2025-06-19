import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useTool } from '@/context/tool-context';

export interface LiquifyHookProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  selectedImageId: string | null; // ID of the selected image to liquify
  brushSize: number;
  strength: number;
  mode: 'push' | 'twirl' | 'pinch' | 'expand' | 'crystals' | 'edge' | 'reconstruct';
  twirlDirection?: 'left' | 'right';
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
  selectedImageId,
  brushSize,
  strength,
  mode,
  twirlDirection = 'left',
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
  const originalImageRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);
  const displacementMapRef = useRef<Map<string, PixelDisplacement>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const animationFrameIdRef = useRef<number | null>(null);

  const getDisplacementKey = (x: number, y: number): string => {
    return `${Math.floor(x)},${Math.floor(y)}`;
  };

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
      
      baseImageDataRef.current = offscreenCtxRef.current.getImageData(0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
    }
    
    displacementMapRef.current.clear();
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
    
    const imageNode = getSelectedImageNode();
    if (imageNode) {
      imageNode.image(canvas);
      imageNode.getLayer()?.batchDraw(); 
    }
    animationFrameIdRef.current = null; // Allow new frame requests
  }, [selectedImageId, stageRef]);

  const startLiquify = useCallback((konvaEvent: KonvaEventObject<MouseEvent>) => {
    const imageNode = getSelectedImageNode();
    if (!imageNode || !konvaEvent.evt || !imageNode.image()) return;
    
    if (!isInitialized || !offscreenCanvasRef.current) {
      const success = initializeOffscreenCanvas();
      if (!success) {
        console.error("Failed to initialize liquify effect");
        return;
      }
    }
    
    const canvasPos = getMousePosOnCanvas(konvaEvent.evt.clientX, konvaEvent.evt.clientY);
    if (!canvasPos) return;

    const imagePos = getMousePosOnImage(canvasPos.x, canvasPos.y);
    if (!imagePos) return; // Outside image bounds

    isLiquifyingRef.current = true;
    lastMousePositionRef.current = imagePos;
    
  }, [selectedImageId, stageRef, isInitialized, initializeOffscreenCanvas, getMousePosOnCanvas, getMousePosOnImage]);

  const processLiquify = useCallback((konvaEvent: KonvaEventObject<MouseEvent>) => {
    const imageNode = getSelectedImageNode();
    if (!isLiquifyingRef.current || !imageNode || !lastMousePositionRef.current || !konvaEvent.evt) return;
    if (!offscreenCanvasRef.current || !offscreenCtxRef.current) return;
    
    const canvasPos = getMousePosOnCanvas(konvaEvent.evt.clientX, konvaEvent.evt.clientY);
    if (!canvasPos) return;

    const currentMousePos = getMousePosOnImage(canvasPos.x, canvasPos.y);
    if (!currentMousePos) return; // Outside image bounds

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
        } else if (mode === 'twirl') {
          const angle = (twirlDirection === 'left' ? -1 : 1) * effectStrength * 0.2; // Twirl angle
          const distToCenter = Math.sqrt(distX * distX + distY * distY);
          
          if (distToCenter > 0.1) { // Avoid division by zero
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            // Rotate point around center
            const rotatedX = distX * cos - distY * sin;
            const rotatedY = distX * sin + distY * cos;
            
            const displaceX = rotatedX - distX;
            const displaceY = rotatedY - distY;
            
            const existingDisplacement = displacementMapRef.current.get(key) || { x: 0, y: 0 };
            const newDisplacement = {
              x: existingDisplacement.x + displaceX,
              y: existingDisplacement.y + displaceY
            };
            displacementMapRef.current.set(key, newDisplacement);
            displacementChanged = true;
          }
        } else if (mode === 'pinch') {
          const distToCenter = Math.sqrt(distX * distX + distY * distY);
          
          if (distToCenter > 0.1) { // Avoid division by zero
            const pinchStrength = effectStrength * 0.3;
            const normalizedX = distX / distToCenter;
            const normalizedY = distY / distToCenter;
            
            // Pull pixels towards center
            const displaceX = -normalizedX * pinchStrength * distToCenter;
            const displaceY = -normalizedY * pinchStrength * distToCenter;
            
            const existingDisplacement = displacementMapRef.current.get(key) || { x: 0, y: 0 };
            const newDisplacement = {
              x: existingDisplacement.x + displaceX,
              y: existingDisplacement.y + displaceY
            };
            displacementMapRef.current.set(key, newDisplacement);
            displacementChanged = true;
          }
        } else if (mode === 'expand') {
          const distToCenter = Math.sqrt(distX * distX + distY * distY);
          
          if (distToCenter > 0.1) { // Avoid division by zero
            const expandStrength = effectStrength * 0.3;
            const normalizedX = distX / distToCenter;
            const normalizedY = distY / distToCenter;
            
            // Push pixels away from center
            const displaceX = normalizedX * expandStrength * distToCenter;
            const displaceY = normalizedY * expandStrength * distToCenter;
            
            const existingDisplacement = displacementMapRef.current.get(key) || { x: 0, y: 0 };
            const newDisplacement = {
              x: existingDisplacement.x + displaceX,
              y: existingDisplacement.y + displaceY
            };
            displacementMapRef.current.set(key, newDisplacement);
            displacementChanged = true;
          }
        } else if (mode === 'crystals') {
          const distToCenter = Math.sqrt(distX * distX + distY * distY);
          
          if (distToCenter > 0.1) { // Avoid division by zero
            const crystalStrength = effectStrength * 0.4;
            
            // Create uneven displacement pattern (like crystal shards)
            const angle = Math.atan2(distY, distX);
            const randomOffset = (Math.random() - 0.5) * 2; // Random factor for unevenness
            const shardAngle = angle + randomOffset * 0.5;
            
            const displaceX = Math.cos(shardAngle) * crystalStrength * distToCenter;
            const displaceY = Math.sin(shardAngle) * crystalStrength * distToCenter;
            
            const existingDisplacement = displacementMapRef.current.get(key) || { x: 0, y: 0 };
            const newDisplacement = {
              x: existingDisplacement.x + displaceX,
              y: existingDisplacement.y + displaceY
            };
            displacementMapRef.current.set(key, newDisplacement);
            displacementChanged = true;
          }
        } else if (mode === 'edge') {
          // Create folding effect along a line (vertical fold)
          const distanceFromEdge = Math.abs(distX); // Distance from vertical edge line
          const edgeStrength = effectStrength * 0.4;
          
          // Pull pixels towards the edge line
          const displaceX = distX > 0 ? -edgeStrength * distanceFromEdge : edgeStrength * distanceFromEdge;
          const displaceY = 0; // No vertical displacement for edge effect
          
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
    selectedImageId, 
    stageRef,
    brushSize, 
    strength, 
    mode, 
    twirlDirection,
    getMousePosOnCanvas, 
    getBrushStrength, 
    renderLiquifiedImageToKonva, // Added as dependency
    getMousePosOnImage
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
    
    const imageNode = getSelectedImageNode();
    if (imageNode?.image()) {
      addHistoryEntry({
        type: 'liquifyApplied',
        description: `liquify`,
        linesSnapshot: renderableObjects,
        metadata: {}
      });
    }
    
  }, [selectedImageId, stageRef, mode, strength, addHistoryEntry, renderableObjects, renderLiquifiedImageToKonva]);

  const getIsLiquifying = () => isLiquifyingRef.current;

  // Reset all liquify effects
  const resetLiquify = useCallback(() => {
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
    
    displacementMapRef.current.clear();
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
    baseImageDataRef.current = null;
    displacementMapRef.current.clear();
  }, [selectedImageId]);

  return {
    startLiquify,
    processLiquify,
    endLiquify,
    getIsLiquifying,
    resetLiquify
  };
};

export default useLiquify; 