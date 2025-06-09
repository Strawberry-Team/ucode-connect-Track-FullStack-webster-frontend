import React, { useEffect } from "react";
import { useTool } from "@/context/tool-context";

interface LiquifyCursorProps {
  isVisible: boolean;
  position: { x: number; y: number } | null;
  stageContainer?: HTMLDivElement | null;
}

const LiquifyCursor: React.FC<LiquifyCursorProps> = ({
  isVisible,
  position,
  stageContainer,
}) => {
  const { liquifyBrushSize, liquifyStrength, activeTool } = useTool();

  // Hide system cursor when liquify tool is active
  useEffect(() => {
    if (stageContainer && activeTool?.type === 'liquify') {
      stageContainer.style.cursor = 'none';
    }
  }, [stageContainer, activeTool]);

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

  const effectRadius = svgCenter * (liquifyStrength / 100);
  
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
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth={LARGE_CURSOR_CIRCLE_STROKE_WIDTH}
          fill="none"
          style={{ filter: "drop-shadow(0 0 0.1px rgba(0,0,0,0.8))" }}
        />
        
        {liquifyStrength > 0 && (
          <circle
            cx={svgCenter}
            cy={svgCenter}
            r={effectRadius}
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth={1}
            strokeDasharray="3,3"
            fill="none"
            style={{ filter: "drop-shadow(0 0 0.1px rgba(0,0,0,0.8))" }}
          />
        )}
        
        <circle
          cx={svgCenter}
          cy={svgCenter}
          r={svgCenter - 1}
          fill={`rgba(255, 255, 255, ${liquifyStrength / 400})`}
          style={{ filter: "drop-shadow(0 0 0.1px rgba(0,0,0,0.8))" }}
        />
        <line
          x1={svgCenter - Math.min(finalSvgDiameter * 0.15, 4)}
          y1={svgCenter}
          x2={svgCenter + Math.min(finalSvgDiameter * 0.15, 4)}
          y2={svgCenter}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1"
          style={{ filter: "drop-shadow(0 0 0.1px rgba(0,0,0,0.8))" }}
        />
        <line
          x1={svgCenter}
          y1={svgCenter - Math.min(finalSvgDiameter * 0.15, 4)}
          x2={svgCenter}
          y2={svgCenter + Math.min(finalSvgDiameter * 0.15, 4)}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1"
          style={{ filter: "drop-shadow(0 0 0.1px rgba(0,0,0,0.8))" }}
        />
      </svg>
    </div>
  );
};

export default LiquifyCursor; 