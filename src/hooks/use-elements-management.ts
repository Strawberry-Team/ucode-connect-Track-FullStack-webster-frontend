import { useState } from "react";
import type { ElementData } from "@/types/canvas";
import type Konva from "konva";

export interface ElementsManagementProps {
  color: string;
  secondaryColor: string;
  opacity: number;
}

const useElementsManagement = ({ color, secondaryColor, opacity }: ElementsManagementProps) => {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);

  const addElement = (
    type: string, 
    pos: { x: number; y: number },
    isRightClick: boolean = false
  ) => {
    const currentColor = isRightClick ? secondaryColor : color;
    
    setElements([
      ...elements,
      {
        type,
        x: pos.x,
        y: pos.y,
        color: currentColor,
        width: 100,
        height: 100,
        opacity: opacity / 100,
      },
    ]);
  };

  const renderElements = () => {
    return elements.map((el, i) => ({
      key: `element-${i}`,
      element: el,
      index: i
    }));
  };
  
  const updateElement = (index: number, newData: Partial<ElementData>) => {
    setElements(elements.map((el, i) => 
      i === index ? { ...el, ...newData } : el
    ));
  };

  const handleDragEnd = (index: number, newX: number, newY: number) => {
    updateElement(index, { 
      x: newX, 
      y: newY 
    });
  };

  const handleElementClick = (index: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setSelectedElementIndex(index);
  };

  const resizeSelectedElement = (widthDelta: number, heightDelta: number) => {
    if (selectedElementIndex === null) return;
    const element = elements[selectedElementIndex];
    updateElement(selectedElementIndex, {
      width: Math.max(20, element.width + widthDelta),
      height: Math.max(20, element.height + heightDelta)
    });
  };

  const removeElement = (index: number) => {
    setElements(elements.filter((_, i) => i !== index));
    if (selectedElementIndex === index) {
      setSelectedElementIndex(null);
    }
  };

  const removeSelectedElement = () => {
    if (selectedElementIndex !== null) {
      removeElement(selectedElementIndex);
    }
  };

  const clearElements = () => {
    setElements([]);
    setSelectedElementIndex(null);
  };

  return {
    elements,
    setElements,
    addElement,
    renderElements,
    updateElement,
    removeElement,
    selectedElementIndex,
    setSelectedElementIndex,
    handleDragEnd,
    handleElementClick,
    resizeSelectedElement,
    removeSelectedElement,
    clearElements
  };
};

export default useElementsManagement; 