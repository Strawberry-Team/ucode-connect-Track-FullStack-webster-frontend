import React from "react";
import { Rect, Circle, RegularPolygon, Star } from "react-konva";
import type { ElementData } from "@/types/canvas";
import type Konva from "konva";

interface ElementRendererProps {
  element: ElementData;
  index: number;
  onDragEnd?: (index: number, newX: number, newY: number) => void;
  onClick?: (index: number, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  index, 
  onDragEnd,
  onClick
}) => {
  // Общие свойства для всех типов элементов
  const commonProps = {
    draggable: true,
    opacity: element.opacity,
    fill: element.color,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => onClick?.(index, e),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      if (onDragEnd) {
        const node = e.target;
        onDragEnd(index, node.x(), node.y());
      }
    }
  };

  switch (element.type) {
    case "rectangle":
      return (
        <Rect
          key={`element-${index}`}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          {...commonProps}
        />
      );
    case "circle":
      return (
        <Circle
          key={`element-${index}`}
          x={element.x + element.width / 2}
          y={element.y + element.height / 2}
          radius={element.width / 2}
          {...commonProps}
        />
      );
    case "triangle":
      return (
        <RegularPolygon
          key={`element-${index}`}
          x={element.x + element.width / 2}
          y={element.y + element.height / 2}
          sides={3}
          radius={element.width / 2}
          {...commonProps}
        />
      );
    case "star":
      return (
        <Star
          key={`element-${index}`}
          x={element.x + element.width / 2}
          y={element.y + element.height / 2}
          numPoints={5}
          innerRadius={element.width / 4}
          outerRadius={element.width / 2}
          {...commonProps}
        />
      );
    case "hexagon":
      return (
        <RegularPolygon
          key={`element-${index}`}
          x={element.x + element.width / 2}
          y={element.y + element.height / 2}
          sides={6}
          radius={element.width / 2}
          {...commonProps}
        />
      );
    case "diamond":
      return (
        <RegularPolygon
          key={`element-${index}`}
          x={element.x + element.width / 2}
          y={element.y + element.height / 2}
          sides={4}
          radius={element.width / 2}
          rotation={45}
          {...commonProps}
        />
      );
    default:
      return (
        <Circle
          key={`element-${index}`}
          x={element.x + element.width / 2}
          y={element.y + element.height / 2}
          radius={element.width / 2}
          {...commonProps}
        />
      );
  }
};

export default ElementRenderer; 