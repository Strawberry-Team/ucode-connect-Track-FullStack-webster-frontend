import React, { useEffect } from "react";

interface BrushCursorProps {
  brushSize: number;
  color: string;
  opacity: number;
  isVisible: boolean;
  position: { x: number; y: number } | null;
  stageContainer?: HTMLDivElement | null;
  activeTool?: any;
}

const CURSOR_SIZE_THRESHOLD = 25;

const BrushCursor: React.FC<BrushCursorProps> = ({
  brushSize,
  opacity,
  isVisible,
  position,
  stageContainer,
  activeTool,
}) => {
  // Hide system cursor when brush tool is active
  useEffect(() => {
    if (stageContainer && activeTool?.type === 'brush') {
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!hiding cursor')
      stageContainer.style.cursor = 'none';
    }
  }, [stageContainer, activeTool]);
  if (!isVisible || !position) {
    return null;
  }

  const isSmallCursor = brushSize <= CURSOR_SIZE_THRESHOLD;

  let finalSvgDiameter: number;
  let svgCenter: number;
  let centralCircleRadius: number = 0;
  let lineStartPosFromCenter: number = 0;
  let lineEndPosFromCenter: number = 0;
  
  const LARGE_CURSOR_CIRCLE_STROKE_WIDTH = 1;

  if (isSmallCursor) {
    const SMALL_CURSOR_CIRCLE_STROKE_WIDTH = 3.5;
    const MIN_SHAPE_DIAMETER = 1;
    const LINE_GAP = 1.5;
    const LINE_LENGTH_FACTOR = 0.2;
    const MIN_LINE_LENGTH = 2;

    const actualShapeDiameter = Math.max(brushSize, MIN_SHAPE_DIAMETER);
    centralCircleRadius = actualShapeDiameter / 2;

    const circleOuterEdge = centralCircleRadius + SMALL_CURSOR_CIRCLE_STROKE_WIDTH / 2;
    const actualLineLength = Math.max(MIN_LINE_LENGTH, Math.floor(actualShapeDiameter * LINE_LENGTH_FACTOR));

    lineStartPosFromCenter = circleOuterEdge + LINE_GAP;
    lineEndPosFromCenter = lineStartPosFromCenter + actualLineLength;

    const overallSvgRadius = lineEndPosFromCenter;
    finalSvgDiameter = 2 * overallSvgRadius;
    svgCenter = overallSvgRadius;
  } else {
    finalSvgDiameter = Math.max(brushSize, 2);
    svgCenter = finalSvgDiameter / 2;
  }

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    zIndex: 1000,
    width: `${finalSvgDiameter}px`,
    height: `${finalSvgDiameter}px`,
  };

  return (
    <div style={containerStyle}>
      <svg
        width={finalSvgDiameter}
        height={finalSvgDiameter}
        viewBox={`0 0 ${finalSvgDiameter} ${finalSvgDiameter}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isSmallCursor ? (
          <>
            <circle
              cx={svgCenter}
              cy={svgCenter}
              r={centralCircleRadius}
              stroke={"white"}
              strokeWidth={1}
              fill="none"
              style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}
            />
            <line x1={svgCenter} y1={svgCenter - lineStartPosFromCenter} x2={svgCenter} y2={svgCenter - lineEndPosFromCenter} stroke="white" strokeWidth={1.5} style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }} />
            <line x1={svgCenter} y1={svgCenter + lineStartPosFromCenter} x2={svgCenter} y2={svgCenter + lineEndPosFromCenter} stroke="white" strokeWidth={1.5} style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }} />
            <line x1={svgCenter - lineStartPosFromCenter} y1={svgCenter} x2={svgCenter - lineEndPosFromCenter} y2={svgCenter} stroke="white" strokeWidth={1.5} style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }} />
            <line x1={svgCenter + lineStartPosFromCenter} y1={svgCenter} x2={svgCenter + lineEndPosFromCenter} y2={svgCenter} stroke="white" strokeWidth={1.5} style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }} />
          </>
        ) : (
          <>
            <circle
              cx={svgCenter}
              cy={svgCenter}
              r={svgCenter - LARGE_CURSOR_CIRCLE_STROKE_WIDTH / 2}
              stroke={"white"}
              strokeWidth={LARGE_CURSOR_CIRCLE_STROKE_WIDTH}
              fill="none"
              style={{ strokeOpacity: opacity / 100, filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}
            />
            <line
              x1={svgCenter - Math.min(finalSvgDiameter * 0.5, 6)}
              y1={svgCenter}
              x2={svgCenter + Math.min(finalSvgDiameter * 0.5, 6)}
              y2={svgCenter}
              stroke={"white"}
              strokeWidth="1.5"
              style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}
            />
            <line
              x1={svgCenter}
              y1={svgCenter - Math.min(finalSvgDiameter * 0.5, 6)}
              x2={svgCenter}
              y2={svgCenter + Math.min(finalSvgDiameter * 0.5, 6)}
              stroke={"white"}
              strokeWidth="1.5"
              style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default BrushCursor; 