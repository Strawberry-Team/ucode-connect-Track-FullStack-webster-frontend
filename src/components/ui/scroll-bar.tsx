import React, { useRef, useEffect } from "react";

interface ScrollBarProps {
  orientation: "horizontal" | "vertical";
  containerSize: number;
  contentSize: number;
  position: number;
  onScroll: (newPosition: number) => void;
}

const ScrollBar: React.FC<ScrollBarProps> = ({
  orientation,
  containerSize,
  contentSize,
  position,
  onScroll
}) => {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startDragPos = useRef(0);
  const startScrollPos = useRef(0);

  const thumbSize = Math.max(20, containerSize * (containerSize / contentSize));
  
  const thumbPosition = Math.min(
    containerSize - thumbSize,
    Math.max(0, position * (containerSize / contentSize))
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    if (orientation === "horizontal") {
      startDragPos.current = e.clientX;
    } else {
      startDragPos.current = e.clientY;
    }
    startScrollPos.current = thumbPosition;
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    let delta;
    if (orientation === "horizontal") {
      delta = e.clientX - startDragPos.current;
    } else {
      delta = e.clientY - startDragPos.current;
    }
    
    const ratio = contentSize / containerSize;
    const newScrollPos = Math.max(0, Math.min(
      contentSize - containerSize,
      startScrollPos.current + delta * ratio
    ));
    
    onScroll(-newScrollPos);
    e.preventDefault();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const isVisible = contentSize > containerSize;

  if (!isVisible) return null;

  const style: React.CSSProperties = orientation === "horizontal"
    ? {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "12px",
        backgroundColor: "rgba(30, 30, 30, 0.6)",
      }
    : {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "12px",
        backgroundColor: "rgba(30, 30, 30, 0.6)",
      };

  const thumbStyle: React.CSSProperties = orientation === "horizontal"
    ? {
        position: "absolute",
        left: `${thumbPosition}px`,
        top: "2px",
        width: `${thumbSize}px`,
        height: "8px",
        backgroundColor: "rgba(150, 150, 150, 0.7)",
        borderRadius: "4px",
        cursor: "pointer",
      }
    : {
        position: "absolute",
        top: `${thumbPosition}px`,
        left: "2px",
        width: "8px",
        height: `${thumbSize}px`,
        backgroundColor: "rgba(150, 150, 150, 0.7)",
        borderRadius: "4px",
        cursor: "pointer",
      };

  return (
    <div ref={scrollbarRef} style={style}>
      <div
        style={thumbStyle}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default ScrollBar; 