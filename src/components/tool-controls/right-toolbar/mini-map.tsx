import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTool } from '@/context/tool-context';

const MiniMap: React.FC = () => {
  const {
    miniMapDataURL,
    visibleCanvasRectOnMiniMap,
    stageSize,
    setStagePositionFromMiniMap,
    isApplyingCrop,
  } = useTool();
  const containerRef = useRef<HTMLDivElement>(null);
  const miniMapImageRef = useRef<HTMLDivElement>(null);
  const [miniMapSize, setMiniMapSize] = useState({ width: 0, height: 0 });
  const lastStageSizeRef = useRef<{ width: number; height: number } | null>(null);

  const [isDraggingViewport, setIsDraggingViewport] = useState(false);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });

  const updateMiniMapSize = useCallback(() => {
    if (containerRef.current) {
      const newWidth = containerRef.current.offsetWidth;
      const newHeight = containerRef.current.offsetHeight;
      
      setMiniMapSize(prevSize => {
        if (prevSize.width !== newWidth || prevSize.height !== newHeight) {
          return { width: newWidth, height: newHeight };
        }
        return prevSize;
      });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setMiniMapSize(prevSize => {
          if (prevSize.width !== width || prevSize.height !== height) {
            return { width, height };
          }
          return prevSize;
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    
    updateMiniMapSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateMiniMapSize]);

  useEffect(() => {
    if (stageSize && lastStageSizeRef.current) {
      const sizeChanged = 
        lastStageSizeRef.current.width !== stageSize.width ||
        lastStageSizeRef.current.height !== stageSize.height;
      
      if (sizeChanged) {
        const timeoutId = setTimeout(() => {
          updateMiniMapSize();
        }, 50);
        
        return () => clearTimeout(timeoutId);
      }
    }
    
    if (stageSize) {
      lastStageSizeRef.current = { ...stageSize };
    }
  }, [stageSize, updateMiniMapSize]);

  const calculateDisplayDimensions = useCallback(() => {
    if (!stageSize || !miniMapSize.width || !miniMapSize.height) {
      return { displayWidth: 0, displayHeight: 0, offsetX: 0, offsetY: 0 };
    }
    let dWidth = miniMapSize.width;
    let dHeight = (miniMapSize.width / stageSize.width) * stageSize.height;
    if (dHeight > miniMapSize.height) {
      dHeight = miniMapSize.height;
      dWidth = (miniMapSize.height / stageSize.height) * stageSize.width;
    }
    const oX = (miniMapSize.width - dWidth) / 2;
    const oY = (miniMapSize.height - dHeight) / 2;
    return { displayWidth: dWidth, displayHeight: dHeight, offsetX: oX, offsetY: oY };
  }, [miniMapSize, stageSize]);

  const { displayWidth, displayHeight } = calculateDisplayDimensions();

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!miniMapImageRef.current || !visibleCanvasRectOnMiniMap || !stageSize || !displayWidth || !displayHeight || isApplyingCrop) return;

    const rect = miniMapImageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const viewportPxX = visibleCanvasRectOnMiniMap.x * displayWidth;
    const viewportPxY = visibleCanvasRectOnMiniMap.y * displayHeight;
    const viewportPxWidth = visibleCanvasRectOnMiniMap.width * displayWidth;
    const viewportPxHeight = visibleCanvasRectOnMiniMap.height * displayHeight;

    if (
      clickX >= viewportPxX &&
      clickX <= viewportPxX + viewportPxWidth &&
      clickY >= viewportPxY &&
      clickY <= viewportPxY + viewportPxHeight
    ) {
      setIsDraggingViewport(true);
      setDragStartOffset({
        x: clickX - viewportPxX,
        y: clickY - viewportPxY,
      });
    } else {
      const relativeX = clickX / displayWidth;
      const relativeY = clickY / displayHeight;
      requestAnimationFrame(() => {
        setStagePositionFromMiniMap({ x: relativeX, y: relativeY }, 'center');
      });
    }
  }, [miniMapImageRef, visibleCanvasRectOnMiniMap, stageSize, displayWidth, displayHeight, setStagePositionFromMiniMap, isApplyingCrop]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingViewport || !miniMapImageRef.current || !visibleCanvasRectOnMiniMap || !stageSize || !displayWidth || !displayHeight || isApplyingCrop) return;

    requestAnimationFrame(() => {
      const rect = miniMapImageRef.current!.getBoundingClientRect();
      let mouseX = e.clientX - rect.left;
      let mouseY = e.clientY - rect.top;

      let newViewportPxX = mouseX - dragStartOffset.x;
      let newViewportPxY = mouseY - dragStartOffset.y;
      
      const viewportPxWidth = visibleCanvasRectOnMiniMap.width * displayWidth;
      const viewportPxHeight = visibleCanvasRectOnMiniMap.height * displayHeight;

      newViewportPxX = Math.max(0, Math.min(newViewportPxX, displayWidth - viewportPxWidth));
      newViewportPxY = Math.max(0, Math.min(newViewportPxY, displayHeight - viewportPxHeight));

      const relativeX = newViewportPxX / displayWidth;
      const relativeY = newViewportPxY / displayHeight;

      setStagePositionFromMiniMap({ x: relativeX, y: relativeY }, 'drag');
    });
    
  }, [isDraggingViewport, dragStartOffset, visibleCanvasRectOnMiniMap, stageSize, displayWidth, displayHeight, setStagePositionFromMiniMap, isApplyingCrop]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingViewport(false);
  }, []);

  useEffect(() => {
    if (isDraggingViewport) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingViewport, handleMouseMove, handleMouseUp]);

  if (!stageSize) {
    return (
      <div ref={containerRef} className="w-full aspect-video bg-[#202225FF] border border-[#44474AFF] rounded flex items-center justify-center">
        <p className="text-xs text-gray-500">Canvas not initialized</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-transparent relative overflow-hidden flex items-center justify-center select-none touch-none cursor-grab"
      onMouseDown={handleMouseDown}
    >
      {miniMapDataURL ? (
        <div 
          ref={miniMapImageRef}
          style={{ width: displayWidth, height: displayHeight, position: 'relative' }}
        >
          <img 
            src={miniMapDataURL} 
            alt="Minimap" 
            className="w-full h-full object-contain select-none"
            draggable={false}
            style={{
              imageRendering: 'crisp-edges',
              filter: 'contrast(1.08) brightness(1.03) saturate(1.1)',
              WebkitFontSmoothing: 'none',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
            }}
          />
          {visibleCanvasRectOnMiniMap && (
            <div
              className="absolute border-1 border-red-500 pointer-events-none"
              style={{
                left: `${visibleCanvasRectOnMiniMap.x * 100}%`,
                top: `${visibleCanvasRectOnMiniMap.y * 100}%`,
                width: `${visibleCanvasRectOnMiniMap.width * 100}%`,
                height: `${visibleCanvasRectOnMiniMap.height * 100}%`,
                transition: isDraggingViewport ? 'none' : 'left 0.1s ease-out, top 0.1s ease-out',
                willChange: 'left, top',
                transform: 'translateZ(0)',
              }}
            />
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Loading minimap...</p>
      )}
    </div>
  );
};

export default MiniMap; 