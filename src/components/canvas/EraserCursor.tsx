import React from "react";

interface EraserCursorProps {
  size: number; // Размер ластика
  // opacity для курсора ластика обычно не нужна, т.к. он контурный
  isVisible: boolean;
  position: { x: number; y: number } | null;
}

const CURSOR_SIZE_THRESHOLD = 30;

const EraserCursor: React.FC<EraserCursorProps> = ({
  size,
  isVisible,
  position,
}) => {
  if (!isVisible || !position) {
    return null;
  }

  const isSmallCursor = size <= CURSOR_SIZE_THRESHOLD;

  let finalSvgDiameter: number;
  let svgCenter: number;
  let centralCircleRadius: number = 0; // Для маленького курсора-прицела
  let lineStartPosFromCenter: number = 0;
  let lineEndPosFromCenter: number = 0;

  const LARGE_CURSOR_CIRCLE_STROKE_WIDTH = 1; // Для большого курсора ластика

  if (isSmallCursor) {
    // Логика для маленького курсора-прицела (аналогично BrushCursor)
    const SMALL_CURSOR_CIRCLE_STROKE_WIDTH = 1; // Толщина обводки центрального круга
    // const SMALL_CURSOR_LINE_STROKE_WIDTH = 1.5; // Уже используется в SVG ниже
    const MIN_SHAPE_DIAMETER = 1;
    const LINE_GAP = 1.5;
    const LINE_LENGTH_FACTOR = 0.2;
    const MIN_LINE_LENGTH = 2;

    const actualShapeDiameter = Math.max(size, MIN_SHAPE_DIAMETER);
    centralCircleRadius = actualShapeDiameter / 2;

    const circleOuterEdge = centralCircleRadius + SMALL_CURSOR_CIRCLE_STROKE_WIDTH / 2;
    const actualLineLength = Math.max(MIN_LINE_LENGTH, Math.floor(actualShapeDiameter * LINE_LENGTH_FACTOR));

    lineStartPosFromCenter = circleOuterEdge + LINE_GAP;
    lineEndPosFromCenter = lineStartPosFromCenter + actualLineLength;

    const overallSvgRadius = lineEndPosFromCenter;
    finalSvgDiameter = 2 * overallSvgRadius;
    svgCenter = overallSvgRadius;
  } else {
    // Логика для большого курсора (остается как было)
    finalSvgDiameter = Math.max(size, 2);
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
          // Маленький курсор: "Прицел" (круг с лучами, как в BrushCursor)
          <>
            <circle
              cx={svgCenter}
              cy={svgCenter}
              r={centralCircleRadius}
              stroke={"white"}
              strokeWidth={1} // SMALL_CURSOR_CIRCLE_STROKE_WIDTH
              fill="none" // Прицел без заливки, только контур
            />
            {/* Лучи для прицела (снаружи) */}
            <line x1={svgCenter} y1={svgCenter - lineStartPosFromCenter} x2={svgCenter} y2={svgCenter - lineEndPosFromCenter} stroke="white" strokeWidth={1.5} />
            <line x1={svgCenter} y1={svgCenter + lineStartPosFromCenter} x2={svgCenter} y2={svgCenter + lineEndPosFromCenter} stroke="white" strokeWidth={1.5} />
            <line x1={svgCenter - lineStartPosFromCenter} y1={svgCenter} x2={svgCenter - lineEndPosFromCenter} y2={svgCenter} stroke="white" strokeWidth={1.5} />
            <line x1={svgCenter + lineStartPosFromCenter} y1={svgCenter} x2={svgCenter + lineEndPosFromCenter} y2={svgCenter} stroke="white" strokeWidth={1.5} />
          </>
        ) : (
          // Большой курсор: Белый контур с крестиком (логика остается прежней)
          <>
            <circle
              cx={svgCenter}
              cy={svgCenter}
              r={svgCenter - LARGE_CURSOR_CIRCLE_STROKE_WIDTH / 2} // Используем константу
              stroke="white"
              strokeWidth={LARGE_CURSOR_CIRCLE_STROKE_WIDTH}
              fill="rgba(255, 255, 255, 0.3)" // Остается как было для большого ластика
            />
            <line
              x1={svgCenter - Math.min(finalSvgDiameter * 0.1, 5)}
              y1={svgCenter}
              x2={svgCenter + Math.min(finalSvgDiameter * 0.1, 5)}
              y2={svgCenter}
              stroke="white"
              strokeWidth="1"
            />
            <line
              x1={svgCenter}
              y1={svgCenter - Math.min(finalSvgDiameter * 0.1, 5)}
              x2={svgCenter}
              y2={svgCenter + Math.min(finalSvgDiameter * 0.1, 5)}
              stroke="white"
              strokeWidth="1"
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default EraserCursor; 