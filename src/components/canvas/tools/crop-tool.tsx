import React from "react";
import { Rect, Transformer as KonvaTransformer } from "react-konva";
import type Konva from "konva";
import { useTool } from "@/context/tool-context";

interface CropToolProps {
  stageSize: { width: number; height: number } | null;
  scale: number;
  cropRectRef: React.RefObject<Konva.Rect>;
  transformerRef: React.RefObject<Konva.Transformer>;
  handleCropRectDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  handleCropRectTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

const CropTool: React.FC<CropToolProps> = ({
  stageSize,
  scale,
  cropRectRef,
  transformerRef,
  handleCropRectDragEnd,
  handleCropRectTransformEnd
}) => {
  const {
    isCropping,
    cropRect
  } = useTool();

  if (!isCropping || !cropRect || !stageSize) return null;

  return (
    <>
      <Rect
        ref={cropRectRef}
        {...cropRect}
        stroke="rgba(0, 122, 204, 0.7)"
        strokeWidth={2 / scale}
        draggable={true}
        dragBoundFunc={(pos) => {
          let newX = pos.x;
          let newY = pos.y;
          const rectWidth = cropRect.width;
          const rectHeight = cropRect.height;

          if (newX < 0) {
            newX = 0;
          }
          if (newY < 0) {
            newY = 0;
          }
          if (newX + rectWidth > stageSize.width) {
            newX = stageSize.width - rectWidth;
          }
          if (newY + rectHeight > stageSize.height) {
            newY = stageSize.height - rectHeight;
          }
          return {
            x: newX,
            y: newY,
          };
        }}
        onDragEnd={handleCropRectDragEnd}
        onTransformEnd={handleCropRectTransformEnd}
      />
      <KonvaTransformer
        ref={transformerRef as React.Ref<Konva.Transformer>}
        anchorStroke="#007ACC"
        anchorFill="#007ACC"
        anchorSize={8 / scale}
        borderStroke="#007ACC"
        borderStrokeWidth={1 / scale}
        rotateEnabled={false}
      />
    </>
  );
};

export default CropTool; 