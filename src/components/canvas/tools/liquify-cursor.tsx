import React from "react";
import { useTool } from "@/context/tool-context";

interface LiquifyCursorProps {
  isVisible: boolean;
  position: { x: number; y: number } | null;
}

const LiquifyCursor: React.FC<LiquifyCursorProps> = ({
  isVisible,
  position,
}) => {
  const { liquifyBrushSize, liquifyStrength } = useTool();

  if (!isVisible || !position) {
    return null;
  }

  const LARGE_CURSOR_CIRCLE_STROKE_WIDTH = 1;
  
  const finalSvgDiameter = Math.max(liquifyBrushSize, 2);
  const svgCenter = finalSvgDiameter / 2;

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
        <circle
          cx={svgCenter}
          cy={svgCenter}
          r={svgCenter - LARGE_CURSOR_CIRCLE_STROKE_WIDTH / 2}
          stroke={"white"}
          strokeWidth={LARGE_CURSOR_CIRCLE_STROKE_WIDTH}
          fill="none"
          style={{ strokeOpacity: liquifyStrength / 100 }}
        />
        <line
          x1={svgCenter - Math.min(finalSvgDiameter * 0.5, 6)}
          y1={svgCenter}
          x2={svgCenter + Math.min(finalSvgDiameter * 0.5, 6)}
          y2={svgCenter}
          stroke={"white"}
          strokeWidth="1.5"
        />
        <line
          x1={svgCenter}
          y1={svgCenter - Math.min(finalSvgDiameter * 0.5, 6)}
          x2={svgCenter}
          y2={svgCenter + Math.min(finalSvgDiameter * 0.5, 6)}
          stroke={"white"}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

export default LiquifyCursor; 