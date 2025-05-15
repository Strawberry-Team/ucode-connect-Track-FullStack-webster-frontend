import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTool } from '@/context/tool-context';

const MiniMap: React.FC = () => {
  const {
    miniMapDataURL,
    visibleCanvasRectOnMiniMap,
    stageSize,
    setStagePositionFromMiniMap,
  } = useTool();
  const containerRef = useRef<HTMLDivElement>(null);
  const miniMapImageRef = useRef<HTMLDivElement>(null);
  const [miniMapSize, setMiniMapSize] = useState({ width: 0, height: 0 });

  const [isDraggingViewport, setIsDraggingViewport] = useState(false);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (containerRef.current) {
      setMiniMapSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, [stageSize, containerRef.current?.offsetWidth, containerRef.current?.offsetHeight]);

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!miniMapImageRef.current || !visibleCanvasRectOnMiniMap || !stageSize || !displayWidth || !displayHeight) return;

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
      setStagePositionFromMiniMap({ x: relativeX, y: relativeY }, 'center');
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingViewport || !miniMapImageRef.current || !visibleCanvasRectOnMiniMap || !stageSize || !displayWidth || !displayHeight) return;

    const rect = miniMapImageRef.current.getBoundingClientRect();
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
    
  }, [isDraggingViewport, dragStartOffset, visibleCanvasRectOnMiniMap, stageSize, displayWidth, displayHeight, setStagePositionFromMiniMap]);

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
          />
          {visibleCanvasRectOnMiniMap && (
            <div
              className="absolute border-1 border-red-500 pointer-events-none"
              style={{
                left: `${visibleCanvasRectOnMiniMap.x * 100}%`,
                top: `${visibleCanvasRectOnMiniMap.y * 100}%`,
                width: `${visibleCanvasRectOnMiniMap.width * 100}%`,
                height: `${visibleCanvasRectOnMiniMap.height * 100}%`,
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