export interface BoxProps {
  id: string | number; // To identify the box, useful for not snapping to itself
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // Rotation in degrees
}

export interface SnapLine {
  type: 'vertical' | 'horizontal';
  points: number[]; // [x1, y1, x2, y2] for Konva.Line
  guide: number; // The x or y coordinate of the guide line
  snap: 'start' | 'center' | 'end'; // How the dragging box snaps to this line
  offset: number; // Offset of the dragging box's edge/center from the guide
  selfEdge?: 'start' | 'center' | 'end'; // Which edge of the dragging box is snapping
}

export interface SnappingResult {
  snapLines: SnapLine[];
  snappedPosition: { x: number; y: number };
}

const SNAP_THRESHOLD = 10; // Pixels - increased for stronger snapping effect

// Helper to get bounding box edges and center
const getBoxEdges = (box: BoxProps) => {
  const x = box.x;
  const y = box.y;
  const width = box.width;
  const height = box.height;

  return {
    left: x,
    right: x + width,
    top: y,
    bottom: y + height,
    centerX: x + width / 2,
    centerY: y + height / 2,
  };
};


export const getSnappingGuides = (
  draggingElement: BoxProps,
  staticElements: BoxProps[],
  canvasWidth: number,
  canvasHeight: number,
  threshold: number = SNAP_THRESHOLD
): SnappingResult => {
  const snapLines: SnapLine[] = [];
  let newX = draggingElement.x;
  let newY = draggingElement.y;

  const dragBoxEdges = getBoxEdges(draggingElement);

  const canvasGuides = [
    // Vertical canvas guides
    { type: 'vertical' as const, guide: 0, snap: 'start' as const }, // Left edge
    { type: 'vertical' as const, guide: canvasWidth / 2, snap: 'center' as const }, // Center
    { type: 'vertical' as const, guide: canvasWidth, snap: 'end' as const }, // Right edge
    // Horizontal canvas guides
    { type: 'horizontal' as const, guide: 0, snap: 'start' as const }, // Top edge
    { type: 'horizontal' as const, guide: canvasHeight / 2, snap: 'center' as const }, // Center
    { type: 'horizontal' as const, guide: canvasHeight, snap: 'end' as const }, // Bottom edge
  ];

  const elementGuides: { type: 'vertical' | 'horizontal'; guide: number; snap: 'start' | 'center' | 'end'; forElementId: string | number }[] = [];
  staticElements.forEach(el => {
    if (el.id === draggingElement.id) return; // Don't snap to self
    const elEdges = getBoxEdges(el);
    elementGuides.push(
      { type: 'vertical' as const, guide: elEdges.left, snap: 'start' as const, forElementId: el.id },
      { type: 'vertical' as const, guide: elEdges.centerX, snap: 'center' as const, forElementId: el.id },
      { type: 'vertical' as const, guide: elEdges.right, snap: 'end' as const, forElementId: el.id },
      { type: 'horizontal' as const, guide: elEdges.top, snap: 'start' as const, forElementId: el.id },
      { type: 'horizontal' as const, guide: elEdges.centerY, snap: 'center' as const, forElementId: el.id },
      { type: 'horizontal' as const, guide: elEdges.bottom, snap: 'end' as const, forElementId: el.id }
    );
  });
  
  const allGuides = [...canvasGuides, ...elementGuides];

  // Edges of the dragging box to check for snapping
  const dragBoxSnapPointsV = [
    { edge: 'start', value: dragBoxEdges.left, offsetName: 'x' },
    { edge: 'center', value: dragBoxEdges.centerX, offsetName: 'x' },
    { edge: 'end', value: dragBoxEdges.right, offsetName: 'x' },
  ];
  const dragBoxSnapPointsH = [
    { edge: 'start', value: dragBoxEdges.top, offsetName: 'y' },
    { edge: 'center', value: dragBoxEdges.centerY, offsetName: 'y' },
    { edge: 'end', value: dragBoxEdges.bottom, offsetName: 'y' },
  ];

  let minDx = Infinity;
  let minDy = Infinity;
  let bestSnapX = newX;
  let bestSnapY = newY;

  allGuides.forEach(guide => {
    if (guide.type === 'vertical') {
      dragBoxSnapPointsV.forEach(point => {
        const diff = Math.abs(point.value - guide.guide);
        if (diff < threshold) {
          const line: SnapLine = {
            type: 'vertical',
            points: [guide.guide, 0, guide.guide, canvasHeight],
            guide: guide.guide,
            snap: guide.snap,
            offset: point.value - guide.guide,
            selfEdge: point.edge as 'start' | 'center' | 'end',
          };
          snapLines.push(line);

          const snapCorrection = guide.guide - point.value;
          if (Math.abs(snapCorrection) < Math.abs(minDx)) {
            minDx = snapCorrection;
            bestSnapX = newX + snapCorrection;
          }
        }
      });
    } else { // Horizontal
      dragBoxSnapPointsH.forEach(point => {
        const diff = Math.abs(point.value - guide.guide);
        if (diff < threshold) {
          const line: SnapLine = {
            type: 'horizontal',
            points: [0, guide.guide, canvasWidth, guide.guide],
            guide: guide.guide,
            snap: guide.snap,
            offset: point.value - guide.guide,
            selfEdge: point.edge as 'start' | 'center' | 'end',
          };
          snapLines.push(line);
          
          const snapCorrection = guide.guide - point.value;
          if (Math.abs(snapCorrection) < Math.abs(minDy)) {
            minDy = snapCorrection;
            bestSnapY = newY + snapCorrection;
          }
        }
      });
    }
  });
  
  // If we found a snap, update the position
  // We prioritize the snap that results in the smallest movement
   if (minDx !== Infinity && Math.abs(minDx) <= threshold) {
    newX = bestSnapX;
  }
  if (minDy !== Infinity && Math.abs(minDy) <= threshold) {
    newY = bestSnapY;
  }


  return {
    snapLines,
    snappedPosition: { x: newX, y: newY },
  };
};
