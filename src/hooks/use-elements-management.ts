import { useState } from "react";
import type { ElementData, FontStyles, TextAlignment, TextCase, BorderStyle } from "@/types/canvas";
import type Konva from "konva";

export interface ElementsManagementProps {
  color: string;
  secondaryColor: string;
  opacity: number;
  // Additional parameters for text
  fontSize?: number;
  fontFamily?: string;
  fontStyles?: FontStyles;
  textCase?: TextCase;
  textAlignment?: TextAlignment;
  lineHeight?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  // Additional parameters for shapes
  fillColor?: string;
  fillColorOpacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: BorderStyle;
  cornerRadius?: number;
  shapeTransform?: {
    rotate: number;
    scaleX: number;
    scaleY: number;
  };
}

const useElementsManagement = ({
  color,
  secondaryColor,
  opacity,
  fontSize = 16,
  fontFamily = "Arial",
  fontStyles = { bold: false, italic: false, underline: false, strikethrough: false },
  textCase = "none",
  textAlignment = "left",
  lineHeight = 1,
  backgroundColor = "transparent",
  backgroundOpacity = 100,
  fillColor = "#ffffff",
  fillColorOpacity = 100,
  borderColor = "#000000",
  borderWidth = 2,
  borderStyle = "solid",
  cornerRadius = 0,
  shapeTransform = { rotate: 0, scaleX: 1, scaleY: 1 }
}: ElementsManagementProps) => {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);

  const addElement = (
    type: string,
    pos: { x: number; y: number },
    isRightClick: boolean = false,
    text?: string,
    settings?: Record<string, any>
  ) => {
    const currentColor = isRightClick ? secondaryColor : color;

    const baseElement: ElementData = {
      type,
      x: pos.x,
      y: pos.y,
      color: currentColor,
      width: 100,
      height: 100,
      opacity: opacity / 100,
      rotation: shapeTransform.rotate,
      scaleX: shapeTransform.scaleX,
      scaleY: shapeTransform.scaleY,
      draggable: true,
    };

    // Add specific properties depending on the element type
    if (type === "text") {
      const textElement: ElementData = {
        ...baseElement,
        text: text || "Type text here...",
        fontSize: settings?.fontSize || fontSize,
        fontFamily: settings?.fontFamily || fontFamily,
        fontStyles: settings?.fontStyles || { ...fontStyles },
        textCase: settings?.textCase || textCase,
        textAlignment: settings?.textAlignment || "center",
        lineHeight: settings?.lineHeight || lineHeight,
        // Inherit colors from global tool settings but allow override
        color: settings?.color || currentColor,
        backgroundColor: settings?.backgroundColor || backgroundColor,
        backgroundOpacity: settings?.backgroundOpacity !== undefined ? settings.backgroundOpacity : backgroundOpacity,
        // Set border color same as background color
        borderColor: settings?.backgroundColor || backgroundColor,
        borderWidth: 1,
        borderStyle: "solid",
        width: 300,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        draggable: true,
        preserveAspectRatio: false
      };
      setElements([...elements, textElement]);
      setSelectedElementIndex(elements.length);
    } else if (type === "rounded-rectangle") {
      const roundedRectElement: ElementData = {
        ...baseElement,
        cornerRadius: settings?.cornerRadius || cornerRadius,
        fillColor: settings?.fillColor || fillColor,
        fillColorOpacity: settings?.fillColorOpacity !== undefined ? settings.fillColorOpacity : fillColorOpacity,
        borderColor: settings?.borderColor || borderColor,
        borderWidth: settings?.borderWidth || borderWidth,
        borderStyle: settings?.borderStyle || borderStyle,
        rotation: settings?.rotation || shapeTransform.rotate,
        scaleX: settings?.scaleX || shapeTransform.scaleX,
        scaleY: settings?.scaleY || shapeTransform.scaleY
      };
      setElements([...elements, roundedRectElement]);
    } else if (["rectangle", "square", "circle", "triangle", "pentagon", "hexagon", "star", "heart", "arrow", "line", "squircle"].includes(type)) {
      const shapeElement: ElementData = {
        ...baseElement,
        fillColor: settings?.fillColor || fillColor,
        fillColorOpacity: settings?.fillColorOpacity !== undefined ? settings.fillColorOpacity : fillColorOpacity,
        borderColor: settings?.borderColor || borderColor,
        borderWidth: settings?.borderWidth || borderWidth,
        borderStyle: settings?.borderStyle || borderStyle,
        rotation: settings?.rotation || shapeTransform.rotate,
        scaleX: settings?.scaleX || shapeTransform.scaleX,
        scaleY: settings?.scaleY || shapeTransform.scaleY
      };
      setElements([...elements, shapeElement]);
    } else {
      // Regular element
      setElements([...elements, baseElement]);
    }
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

  const updateTextElement = (index: number, newText: string) => {
    if (elements[index]?.type === "text") {
      updateElement(index, { text: newText });
    }
  };

  const updateSelectedElementStyle = (styleUpdate: Partial<ElementData>) => {
    if (selectedElementIndex !== null) {
      const element = elements[selectedElementIndex];
      if (element.type === "text") {
        const defaultFontStyles = { bold: false, italic: false, underline: false, strikethrough: false };
        
        // Update element styles without affecting global settings
        const updatedElement = {
          ...element,
          ...styleUpdate,
          // Keep local color settings independent from global
          color: styleUpdate.color || element.color,
          backgroundColor: styleUpdate.backgroundColor || element.backgroundColor,
          backgroundOpacity: styleUpdate.backgroundOpacity !== undefined ? styleUpdate.backgroundOpacity : element.backgroundOpacity,
          fontStyles: styleUpdate.fontStyles ? {
            bold: styleUpdate.fontStyles.bold ?? (element.fontStyles?.bold ?? defaultFontStyles.bold),
            italic: styleUpdate.fontStyles.italic ?? (element.fontStyles?.italic ?? defaultFontStyles.italic),
            underline: styleUpdate.fontStyles.underline ?? (element.fontStyles?.underline ?? defaultFontStyles.underline),
            strikethrough: styleUpdate.fontStyles.strikethrough ?? (element.fontStyles?.strikethrough ?? defaultFontStyles.strikethrough)
          } : (element.fontStyles || defaultFontStyles)
        };
        updateElement(selectedElementIndex, updatedElement);
      } else {
        updateElement(selectedElementIndex, styleUpdate);
      }
    }
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

  const flipSelectedElementHorizontal = () => {
    if (selectedElementIndex === null) return;
    const element = elements[selectedElementIndex];
    updateElement(selectedElementIndex, {
      scaleX: element.scaleX ? -element.scaleX : -1
    });
  };

  const flipSelectedElementVertical = () => {
    if (selectedElementIndex === null) return;
    const element = elements[selectedElementIndex];
    updateElement(selectedElementIndex, {
      scaleY: element.scaleY ? -element.scaleY : -1
    });
  };

  const rotateSelectedElement = (degrees = 15) => {
    if (selectedElementIndex === null) return;
    const element = elements[selectedElementIndex];
    const currentRotation = element.rotation || 0;
    updateElement(selectedElementIndex, {
      rotation: currentRotation + degrees
    });
  };

  const duplicateSelectedElement = () => {
    if (selectedElementIndex === null) return;
    const selectedElement = elements[selectedElementIndex];
    const newElement = {
      ...selectedElement,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20
    };
    setElements([...elements, newElement]);
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
    updateTextElement,
    updateSelectedElementStyle,
    removeElement,
    selectedElementIndex,
    setSelectedElementIndex,
    handleDragEnd,
    handleElementClick,
    resizeSelectedElement,
    removeSelectedElement,
    flipSelectedElementHorizontal,
    flipSelectedElementVertical,
    rotateSelectedElement,
    duplicateSelectedElement,
    clearElements
  };
};

export default useElementsManagement; 