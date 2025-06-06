import { useRef, useCallback } from 'react';
import { useTool } from '@/context/tool-context';

export interface HandHookProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  stagePosition: { x: number; y: number };
  setStagePosition: (position: { x: number; y: number }) => void;
  containerSize: { width: number; height: number } | null;
  stageSize: { width: number; height: number } | null;
}

const useHand = ({
  containerRef,
  zoom,
  stagePosition,
  setStagePosition,
  containerSize,
  stageSize,
}: HandHookProps) => {
  const isDraggingRef = useRef(false);
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);

  const startPanning = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    lastMousePositionRef.current = { x: clientX, y: clientY };
    
    // Change cursor to grabbing
    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  }, [containerRef]);

  const processPanning = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !lastMousePositionRef.current) return;

    const dx = clientX - lastMousePositionRef.current.x;
    const dy = clientY - lastMousePositionRef.current.y;
    
    const newX = stagePosition.x + dx;
    const newY = stagePosition.y + dy;
    
    setStagePosition({ x: newX, y: newY });
    
    lastMousePositionRef.current = { x: clientX, y: clientY };
  }, [stagePosition, setStagePosition]);

  const endPanning = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    lastMousePositionRef.current = null;
    
    // Change cursor back to grab
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
    
    // DO NOT apply automatic constraints when ending drag
    // Allow user to position canvas wherever they want
  }, [containerRef]);

  // Soft constraints - applied only in extreme cases
  const applySoftConstraints = useCallback(() => {
    if (!stageSize || !containerSize) return;
    
    const scaleValue = zoom / 100;
    const scaledContentWidth = stageSize.width * scaleValue;
    const scaledContentHeight = stageSize.height * scaleValue;
    const containerWidth = containerSize.width;
    const containerHeight = containerSize.height;

    let newX = stagePosition.x;
    let newY = stagePosition.y;
    let needsUpdate = false;

    // Very soft constraints - allow canvas to almost completely disappear
    const minVisiblePart = 50; // Minimum 50px of visible part

    // Horizontal constraints
    if (newX > containerWidth - minVisiblePart) {
      newX = containerWidth - minVisiblePart;
      needsUpdate = true;
    } else if (newX < -scaledContentWidth + minVisiblePart) {
      newX = -scaledContentWidth + minVisiblePart;
      needsUpdate = true;
    }

    // Vertical constraints
    if (newY > containerHeight - minVisiblePart) {
      newY = containerHeight - minVisiblePart;
      needsUpdate = true;
    } else if (newY < -scaledContentHeight + minVisiblePart) {
      newY = -scaledContentHeight + minVisiblePart;
      needsUpdate = true;
    }

    // Apply new coordinates only if really needed
    if (needsUpdate) {
      setStagePosition({ x: newX, y: newY });
    }
  }, [stageSize, containerSize, zoom, stagePosition, setStagePosition]);

  // Hard constraints for other tools (keeping for compatibility)
  const applyPositionConstraints = useCallback(() => {
    if (!stageSize || !containerSize) return;
    
    const scaleValue = zoom / 100;
    const scaledContentWidth = stageSize.width * scaleValue;
    const scaledContentHeight = stageSize.height * scaleValue;
    const containerWidth = containerSize.width;
    const containerHeight = containerSize.height;

    let newX = stagePosition.x;
    let newY = stagePosition.y;

    // Constraints for horizontal movement
    if (scaledContentWidth > containerWidth) {
      newX = Math.max(containerWidth - scaledContentWidth, Math.min(0, stagePosition.x));
    } else {
      newX = (containerWidth - scaledContentWidth) / 2;
    }

    // Constraints for vertical movement
    if (scaledContentHeight > containerHeight) {
      newY = Math.max(containerHeight - scaledContentHeight, Math.min(0, stagePosition.y));
    } else {
      newY = (containerHeight - scaledContentHeight) / 2;
    }

    // Apply new coordinates only if they have changed
    if (newX !== stagePosition.x || newY !== stagePosition.y) {
      setStagePosition({ x: newX, y: newY });
    }
  }, [stageSize, containerSize, zoom, stagePosition, setStagePosition]);

  const getIsPanning = () => isDraggingRef.current;

  const setCursor = useCallback(() => {
    if (!containerRef.current) return;
    
    if (isDraggingRef.current) {
      containerRef.current.style.cursor = "grabbing";
    } else {
      containerRef.current.style.cursor = "grab";
    }
  }, [containerRef]);

  return {
    startPanning,
    processPanning,
    endPanning,
    getIsPanning,
    setCursor,
    applyPositionConstraints,
    applySoftConstraints,
  };
};

export default useHand; 