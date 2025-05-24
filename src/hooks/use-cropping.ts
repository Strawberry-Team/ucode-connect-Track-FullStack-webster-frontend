import { useRef, useEffect} from "react";
import type Konva from "konva";
import { useTool } from "@/context/tool-context";

export interface CroppingProps {
  cropRect: Rect | null;
  setCropRect: (rect: Rect | null) => void;
  stageSize: { width: number; height: number } | null;
  setStageSize: (size: { width: number; height: number } | null) => void;
  selectedAspectRatio: string;
  setSelectedAspectRatio: (ratio: string) => void;
  setIsCropping: (value: boolean) => void;
  setIsCanvasManuallyResized: (value: boolean) => void;
  lines: any[];
  setLines: (lines: any[]) => void;
  elements: any[];
  setElements: (elements: any[]) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  setStagePosition: (pos: { x: number; y: number }) => void;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

const useCropping = ({
  cropRect,
  setCropRect,
  stageSize: currentStageSize,
  setStageSize,
  selectedAspectRatio,
  setSelectedAspectRatio,
  setIsCanvasManuallyResized,
  lines,
  setLines,
  elements,
  setElements,
  containerRef,
  zoom,
  setStagePosition
}: CroppingProps) => {
  const { isApplyingCrop, setIsApplyingCrop } = useTool();
  
  const cropRectRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const constrainCropRectToCanvas = (pos: { x: number; y: number }, rectWidth: number, rectHeight: number, canvasWidth: number, canvasHeight: number) => {
    let newX = pos.x;
    let newY = pos.y;

    if (newX < 0) {
      newX = 0;
    }
    if (newY < 0) {
      newY = 0;
    }
    if (newX + rectWidth > canvasWidth) {
      newX = canvasWidth - rectWidth;
    }
    if (newY + rectHeight > canvasHeight) {
      newY = canvasHeight - rectHeight;
    }

    return {
      x: newX,
      y: newY,
    };
  };

  const createBoundBoxFunc = (stageSizeForBounding: { width: number; height: number }, selectedRatio: string) => {
    const MIN_SIZE = 10;

    const newBoundBoxFunc = (oldBox: BoundingBox, newBox: BoundingBox): BoundingBox => {
      const stageWidth = stageSizeForBounding.width;
      const stageHeight = stageSizeForBounding.height;
      let correctedBox = { ...newBox };

      if (correctedBox.y < 0) {
        const intendedBottom = newBox.y + newBox.height;
        correctedBox.y = 0;
        correctedBox.height = intendedBottom - correctedBox.y;
      }

      if (correctedBox.x < 0) {
        const intendedRight = newBox.x + newBox.width;
        correctedBox.x = 0;
        correctedBox.width = intendedRight - correctedBox.x;
      }

      correctedBox.width = Math.max(MIN_SIZE, correctedBox.width);
      correctedBox.height = Math.max(MIN_SIZE, correctedBox.height);

      if (correctedBox.x + correctedBox.width > stageWidth) {
        if (oldBox.width === newBox.width || Math.abs(newBox.x - oldBox.x) > Math.abs(newBox.width - oldBox.width)) {
          correctedBox.x = stageWidth - correctedBox.width;
        } else {
          correctedBox.width = stageWidth - correctedBox.x;
        }
      }

      if (correctedBox.y + correctedBox.height > stageHeight) {
        if (oldBox.height === newBox.height || Math.abs(newBox.y - oldBox.y) > Math.abs(newBox.height - oldBox.height)) {
          correctedBox.y = stageHeight - correctedBox.height;
        } else {
          correctedBox.height = stageHeight - correctedBox.y;
        }
      }

      correctedBox.x = Math.max(0, correctedBox.x);
      correctedBox.y = Math.max(0, correctedBox.y);

      correctedBox.width = Math.max(MIN_SIZE, Math.min(correctedBox.width, stageWidth - correctedBox.x));
      correctedBox.height = Math.max(MIN_SIZE, Math.min(correctedBox.height, stageHeight - correctedBox.y));

      if (correctedBox.x + correctedBox.width > stageWidth) {
        correctedBox.x = stageWidth - correctedBox.width;
        correctedBox.x = Math.max(0, correctedBox.x);
      }
      if (correctedBox.y + correctedBox.height > stageHeight) {
        correctedBox.y = stageHeight - correctedBox.height;
        correctedBox.y = Math.max(0, correctedBox.y);
      }

      return correctedBox;
    };

    if (selectedRatio === 'custom') {
      return newBoundBoxFunc;
    }

    return (oldBox: BoundingBox, newBox: BoundingBox): BoundingBox => {
      let constrainedBox = newBoundBoxFunc(oldBox, newBox);

      const [widthRatio, heightRatio] = selectedRatio.split(':').map(Number);
      const targetRatio = widthRatio / heightRatio;

      if (Math.abs(newBox.width - oldBox.width) > Math.abs(newBox.height - oldBox.height) &&
        !(constrainedBox.x <= 1) && !(constrainedBox.x + constrainedBox.width >= stageSizeForBounding.width - 1)) {
        constrainedBox.height = constrainedBox.width / targetRatio;
      }
      else if (Math.abs(newBox.height - oldBox.height) > Math.abs(newBox.width - oldBox.width) &&
        !(constrainedBox.y + constrainedBox.height >= stageSizeForBounding.height - 1) && !(constrainedBox.y <= 1)) {
        constrainedBox.width = constrainedBox.height * targetRatio;
      } else {
        constrainedBox.height = constrainedBox.width / targetRatio;
        if (constrainedBox.y + constrainedBox.height > stageSizeForBounding.height) {
          constrainedBox.height = stageSizeForBounding.height - constrainedBox.y;
          constrainedBox.width = constrainedBox.height * targetRatio;
          if (constrainedBox.x + constrainedBox.width > stageSizeForBounding.width) {
            constrainedBox.width = stageSizeForBounding.width - constrainedBox.x;
            constrainedBox.height = constrainedBox.width / targetRatio;
          }
        }
      }
      return newBoundBoxFunc(oldBox, constrainedBox);
    };
  };

  const applyCrop = () => {
    if (!cropRect || !currentStageSize || isApplyingCrop) return;
    
    setIsApplyingCrop(true);

    const newStageSize = {
      width: Math.round(cropRect.width),
      height: Math.round(cropRect.height)
    };

    const offsetX = cropRect.x;
    const offsetY = cropRect.y;

    const adjustedLines = lines.map(line => {
      if (!line.points || line.points.length === 0) return line;

      const adjustedPoints = line.points.map((point: number, index: number) => {
        if (index % 2 === 0) {
          return point - offsetX;
        } else {
          return point - offsetY;
        }
      });

      return {
        ...line,
        points: adjustedPoints
      };
    });

    const adjustedElements = elements.map(element => ({
      ...element,
      x: (element.x ?? 0) - offsetX,
      y: (element.y ?? 0) - offsetY
    }));

    setLines(adjustedLines);
    setElements(adjustedElements);
    setStageSize(newStageSize);
    setIsCanvasManuallyResized(true);
    setCropRect({ x: 0, y: 0, width: newStageSize.width, height: newStageSize.height });
    setSelectedAspectRatio('custom');

    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const scaleValue = zoom / 100;

      const scaledContentWidth = newStageSize.width * scaleValue;
      const scaledContentHeight = newStageSize.height * scaleValue;

      let newStageX, newStageY;

      if (scaledContentWidth <= containerWidth) {
        newStageX = (containerWidth - scaledContentWidth) / 2;
      } else {
        newStageX = 0;
      }

      if (scaledContentHeight <= containerHeight) {
        newStageY = (containerHeight - scaledContentHeight) / 2;
      } else {
        newStageY = 0;
      }

      setStagePosition({ x: newStageX, y: newStageY });
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsApplyingCrop(false);
      }, 16);
    });
  };

  useEffect(() => {
    if (cropRect && currentStageSize && transformerRef.current) {
      if (cropRectRef.current) {
        transformerRef.current.nodes([cropRectRef.current]);
        transformerRef.current.getLayer()?.batchDraw();

        transformerRef.current.boundBoxFunc(createBoundBoxFunc(currentStageSize, selectedAspectRatio));
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [cropRect, selectedAspectRatio, currentStageSize]);

  const handleCropRectDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!cropRect) return;
    const node = e.target;
    setCropRect({
      ...cropRect,
      x: node.x(),
      y: node.y(),
    });
  };

  const handleCropRectTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = cropRectRef.current;
    if (node && cropRect) {
      const newWidth = Math.max(5, node.width() * node.scaleX());
      const newHeight = Math.max(5, node.height() * node.scaleY());
      setCropRect({
        x: node.x(),
        y: node.y(),
        width: newWidth,
        height: newHeight,
      });
      node.scaleX(1);
      node.scaleY(1);
    }
  };

  return {
    cropRectRef,
    transformerRef,
    constrainCropRectToCanvas,
    applyCrop,
    handleCropRectDragEnd,
    handleCropRectTransformEnd
  };
};

export default useCropping; 