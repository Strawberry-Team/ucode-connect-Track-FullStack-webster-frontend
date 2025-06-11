import { useCallback, useState, useEffect } from "react";
import type { ElementData, FontStyles, TextAlignment, TextCase, BorderStyle, ShapeType, RenderableObject } from "@/types/canvas";
import type Konva from "konva";
import { useTool } from "@/context/tool-context";

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
  textColorOpacity?: number;
  borderColorOpacity?: number;
}

const useElementsManagement = ({
  color: defaultPropColor,
  secondaryColor: defaultPropSecondaryColor,
  opacity: defaultPropOpacity,
  fontSize: defaultFontSize = 16,
  fontFamily: defaultFontFamily = "Arial",
  fontStyles: defaultFontStyles = { bold: false, italic: false, underline: false, strikethrough: false },
  textCase: defaultTextCase = "none",
  textAlignment: defaultTextAlignment = "left",
  lineHeight: defaultLineHeight = 1,
  backgroundColor: defaultBackgroundColor = "transparent",
  backgroundOpacity: defaultBackgroundOpacity = 100,
  fillColor: defaultFillColor = "#ffffff",
  fillColorOpacity: defaultFillColorOpacity = 100,
  borderColor: defaultBorderColor = "#000000",
  borderWidth: defaultBorderWidth = 2,
  borderStyle: defaultBorderStyle = "solid",
  cornerRadius: defaultCornerRadius = 0,
  shapeTransform: defaultShapeTransform = { rotate: 0, scaleX: 1, scaleY: 1 },
  textColorOpacity: defaultTextColorOpacity = 100,
  borderColorOpacity: defaultBorderColorOpacity = 100
}: ElementsManagementProps) => {
  const {
    renderableObjects,
    setRenderableObjects,
    addRenderableObject: addRenderableObjectToContext,
    color: toolMainColor,
    secondaryColor: toolSecondaryMainColor,
    opacity: toolOpacity,
    textColor: toolTextColor,
    textBgColor: toolTextBgColor,
    textBgOpacity: toolTextBgOpacity,
    fontSize: toolFontSize,
    fontFamily: toolFontFamily,
    fontStyles: toolFontStyles,
    textCase: toolTextCase,
    textAlignment: toolTextAlign,
    lineHeight: toolLineHeight,
    textColorOpacity: toolTextColorOpacity,
    borderColorOpacity: toolBorderColorOpacity,
    fillColor: toolFillColor,
    fillColorOpacity: toolFillColorOpacity,
    borderColor: toolShapeBorderColor,
    borderWidth: toolShapeBorderWidth,
    borderStyle: toolShapeBorderStyle,
    cornerRadius: toolShapeCornerRadius,
    shapeType: currentToolShapeType,
    shapeTransform: toolShapeTransform,
    activeTool,
    addHistoryEntry,
    stageSize: contextStageSize,
  } = useTool();

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  const getElementDataFromRenderables = useCallback(() => {
    return renderableObjects.filter(obj => !('tool' in obj)) as ElementData[];
  }, [renderableObjects]);

  const getElementById = useCallback((id: string): {element: ElementData, indexInRenderables: number} | null => {
    const indexInRenderables = renderableObjects.findIndex(obj => ('id' in obj && obj.id === id) && !('tool' in obj));
    if (indexInRenderables === -1) return null;
    const foundObject = renderableObjects[indexInRenderables];
    if (!('tool' in foundObject)) {
        return {element: foundObject as ElementData, indexInRenderables};
    }
    return null;
  }, [renderableObjects]);

  // Reset selected element when active tool changes if the element can't be interacted with the new tool
  useEffect(() => {
    if (selectedElementId && activeTool) {
      const elementResult = getElementById(selectedElementId);
      if (elementResult) {
        const element = elementResult.element;
        let canBeSelected = false;

        // Check if current element can be selected with the new tool
        if (element.type === "custom-image") {
          canBeSelected = activeTool.type === "image-transform";
        } else if (element.type === "text") {
          canBeSelected = activeTool.type === "cursor" || activeTool.type === "text";
        } else {
          // For shape elements
          const isShapeElement = element.type !== "text" && element.type !== "custom-image";
          if (isShapeElement) {
            canBeSelected = activeTool.type === "shape";
          }
        }

        // Only deselect if switching to a conflicting tool
        if (!canBeSelected && (
          activeTool.type === "shape" || 
          activeTool.type === "text" || 
          activeTool.type === "cursor" || 
          activeTool.type === "image-transform"
        )) {
          setSelectedElementId(null);
        }
      }
    }
  }, [activeTool, selectedElementId, getElementById]);

  const addElement = useCallback((
    type: ShapeType | "text" | "custom-image",
    pos: { x: number; y: number },
    text?: string,
    settings?: Partial<ElementData>,
    onAdded?: (elementId: string) => void
  ) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const currentOpacity = (settings?.opacity !== undefined ? settings.opacity : (toolOpacity ?? defaultPropOpacity)) / 100;

    const baseElement: Omit<ElementData, 'type' | 'color'> & { id: string; type: ShapeType | "text" | "custom-image" } = {
      id,
      type: type,
      x: pos.x,
      y: pos.y,
      width: settings?.width ?? (type === "text" ? 200 : 100),
      height: settings?.height ?? (type === "text" ? 50 : 100),
      opacity: currentOpacity,
      rotation: settings?.rotation ?? toolShapeTransform?.rotate ?? 0,
      scaleX: settings?.scaleX ?? toolShapeTransform?.scaleX ?? 1,
      scaleY: settings?.scaleY ?? toolShapeTransform?.scaleY ?? 1,
      draggable: true,
      preserveAspectRatio: settings?.preserveAspectRatio !== undefined ? settings.preserveAspectRatio : true,
    };

    let newElementToAdd: ElementData;

    if (type === "text") {
      newElementToAdd = {
        ...baseElement,
        type: "text",
        text: text || "Type text here...",
        color: settings?.color ?? toolTextColor ?? defaultPropColor,
        textColorOpacity: settings?.textColorOpacity ?? toolTextColorOpacity ?? defaultTextColorOpacity,
        fontSize: settings?.fontSize ?? toolFontSize ?? defaultFontSize,
        fontFamily: settings?.fontFamily ?? toolFontFamily ?? defaultFontFamily,
        fontStyles: settings?.fontStyles ?? toolFontStyles ?? defaultFontStyles,
        textCase: settings?.textCase ?? toolTextCase ?? defaultTextCase,
        textAlignment: settings?.textAlignment ?? toolTextAlign ?? defaultTextAlignment,
        lineHeight: settings?.lineHeight ?? toolLineHeight ?? defaultLineHeight,
        backgroundColor: settings?.backgroundColor ?? toolTextBgColor ?? defaultBackgroundColor,
        backgroundOpacity: settings?.backgroundOpacity ?? toolTextBgOpacity ?? (toolTextBgColor === "transparent" ? 0 : defaultBackgroundOpacity),
        borderColor: "#000000",
        borderWidth: 0,
        borderStyle: "hidden",
      };
    } else if (type === "custom-image") {
        newElementToAdd = {
            ...baseElement,
            type: "custom-image",
            src: settings?.src,
            fileName: settings?.fileName,
            borderColor: settings?.borderColor ?? toolShapeBorderColor ?? "#000000",
            borderColorOpacity: settings?.borderColorOpacity ?? toolBorderColorOpacity ?? defaultBorderColorOpacity,
            borderWidth: settings?.borderWidth ?? 0,
            borderStyle: settings?.borderStyle ?? "hidden",
            color: settings?.color ?? defaultPropColor,
            // Image transform properties
            flipHorizontal: settings?.flipHorizontal ?? false,
            flipVertical: settings?.flipVertical ?? false,
            brightness: settings?.brightness ?? 0,
            contrast: settings?.contrast ?? 0,
        };
    } else {
      const shapeFillColor = settings?.fillColor ?? (toolFillColor === 'transparent' ? undefined : toolFillColor) ?? defaultFillColor;
      const shapeFillOpacity = settings?.fillColorOpacity ?? toolFillColorOpacity ?? defaultFillColorOpacity;

      newElementToAdd = {
        ...baseElement,
        type: type as ShapeType,
        color: settings?.borderColor ?? toolShapeBorderColor ?? defaultBorderColor,
        fillColor: shapeFillColor,
        fillColorOpacity: shapeFillOpacity,
        borderColor: settings?.borderColor ?? toolShapeBorderColor ?? defaultBorderColor,
        borderWidth: settings?.borderWidth ?? toolShapeBorderWidth ?? defaultBorderWidth,
        borderStyle: settings?.borderStyle ?? toolShapeBorderStyle ?? defaultBorderStyle,
        borderColorOpacity: settings?.borderColorOpacity ?? toolBorderColorOpacity ?? defaultBorderColorOpacity,
        cornerRadius: type === "rounded-rectangle" ? (settings?.cornerRadius ?? toolShapeCornerRadius ?? defaultCornerRadius) : undefined,
      };
    }
    
    addRenderableObjectToContext(newElementToAdd);
    setSelectedElementId(newElementToAdd.id);

    addHistoryEntry({
        type: 'elementAdded',
        description: `Add element: ${type}`,
        linesSnapshot: [...renderableObjects, newElementToAdd],
        metadata: {
            elementId: newElementToAdd.id,
            elementType: type
        }
    });

    // Call the onAdded callback if provided
    if (onAdded) {
      onAdded(newElementToAdd.id);
    }
  },
  [
    addRenderableObjectToContext, 
    toolMainColor, toolSecondaryMainColor, toolOpacity,
    toolTextColor, toolTextBgColor, toolTextBgOpacity, 
    toolFontSize, toolFontFamily, toolFontStyles, toolTextCase, toolTextAlign, toolLineHeight,
    toolFillColor, toolFillColorOpacity, toolShapeBorderColor, toolShapeBorderWidth, toolShapeBorderStyle,
    toolShapeCornerRadius, currentToolShapeType, toolShapeTransform,
    toolTextColorOpacity, toolBorderColorOpacity,
    defaultPropColor, defaultFontSize, defaultFontFamily, defaultFontStyles, defaultTextCase, defaultTextAlignment,
    defaultLineHeight, defaultBackgroundColor, defaultBackgroundOpacity,
    defaultFillColor, defaultFillColorOpacity, defaultBorderColor, defaultBorderWidth, defaultBorderStyle, defaultCornerRadius,
    defaultTextColorOpacity, defaultBorderColorOpacity,
    addHistoryEntry
  ]
);

  const updateElement = useCallback((id: string, newData: Partial<ElementData>) => {
    const updatedObjects = renderableObjects.map(obj => {
      if (!('tool' in obj) && obj.id === id) {
        return { ...obj, ...newData };
      }
      return obj;
    });
    
    setRenderableObjects(updatedObjects);

    const changedKeys = Object.keys(newData);
    const isSignificantChange = changedKeys.some(key => 
      !['x', 'y'].includes(key) || // All changes except position
      (changedKeys.includes('x') && changedKeys.includes('y') && changedKeys.length === 2) // Or only position if this is the final move
    );

    if (isSignificantChange) {
      const element = renderableObjects.find(obj => !('tool' in obj) && obj.id === id) as ElementData;
      const elementTypeName = element ? getElementTypeName(element.type) : 'element';
      
      addHistoryEntry({
        type: 'elementModified',
        description: `Modified ${elementTypeName}`,
        linesSnapshot: updatedObjects,
        metadata: {
          elementId: id,
          elementType: element?.type
        }
      });
    }
  }, [renderableObjects, setRenderableObjects, addHistoryEntry]);

  const handleDragEnd = useCallback((id: string, newX: number, newY: number) => {
    updateElement(id, { x: newX, y: newY });
  }, [updateElement]);

  const handleElementClick = useCallback((id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const elementResult = getElementById(id);
    if (!elementResult) return;

    const clickedElement = elementResult.element;
    let canBeSelectedBasedOnToolAndElementType = false;

    // Custom images can only be selected with image-transform tool
    if (clickedElement.type === "custom-image") {
        canBeSelectedBasedOnToolAndElementType = activeTool?.type === "image-transform";
    }
    // Text elements can be selected with cursor or text tool
    else if (clickedElement.type === "text") {
        canBeSelectedBasedOnToolAndElementType = activeTool?.type === "cursor" || activeTool?.type === "text";
    }
    // Shape elements can only be selected with shape tool
    else {
        const isShapeElement = clickedElement.type !== "text" && clickedElement.type !== "custom-image";
        if (isShapeElement) {
            canBeSelectedBasedOnToolAndElementType = activeTool?.type === "shape";
        }
    }

    if (canBeSelectedBasedOnToolAndElementType) {
        setSelectedElementId(id);
    } else {
        // Only deselect if using the wrong tool for this element type
        // Don't deselect when clicking with other tools to preserve selection
        if (activeTool?.type === "shape" || activeTool?.type === "text" || activeTool?.type === "cursor" || activeTool?.type === "image-transform") {
            setSelectedElementId(null);
        }
    }
  }, [activeTool, getElementById, setSelectedElementId]);

  const updateTextElement = useCallback((id: string, newText: string) => {
    const updatedObjects = renderableObjects.map(obj => {
      if (!('tool' in obj) && obj.id === id) {
        return { ...obj, text: newText };
      }
      return obj;
    });
    
    setRenderableObjects(updatedObjects);

    const element = renderableObjects.find(obj => !('tool' in obj) && obj.id === id) as ElementData;
    if (element && element.text !== newText && newText.trim() !== "") {
      addHistoryEntry({
        type: 'elementModified',
        description: 'Text modified',
        linesSnapshot: updatedObjects,
        metadata: {
          elementId: id,
          elementType: 'text'
        }
      });
    }
  }, [renderableObjects, setRenderableObjects, addHistoryEntry]);

  const updateSelectedElementStyle = useCallback((styleUpdate: Partial<ElementData>) => {
    if (selectedElementId) {
      const result = getElementById(selectedElementId);
      if (result) {
        if (result.element.type === "text" && styleUpdate.fontStyles) {
          const defaultFontStyles = { bold: false, italic: false, underline: false, strikethrough: false };
          const currentElementStyles = result.element.fontStyles || defaultFontStyles;
          const updatedFontStyles = { ...currentElementStyles, ...styleUpdate.fontStyles };
          updateElement(selectedElementId, { ...styleUpdate, fontStyles: updatedFontStyles });
        } else {
          updateElement(selectedElementId, styleUpdate);
        }
      }
    }
  }, [selectedElementId, getElementById, updateElement]);

  const removeSelectedElement = useCallback(() => {
    if (!selectedElementId) return;
    
    const elementToRemove = renderableObjects.find(obj => !('tool' in obj) && obj.id === selectedElementId) as ElementData;
    const updatedObjects = renderableObjects.filter(obj => {
        if ('tool' in obj) return true;
        return obj.id !== selectedElementId;
    });
    
    setRenderableObjects(updatedObjects);
    setSelectedElementId(null);

    if (elementToRemove) {
        const elementTypeName = getElementTypeName(elementToRemove.type);
        addHistoryEntry({
            type: 'elementRemoved',
            description: `Removed ${elementTypeName}`,
            linesSnapshot: updatedObjects,
            metadata: {
                elementId: selectedElementId,
                elementType: elementToRemove.type
            }
        });
    }
  }, [selectedElementId, renderableObjects, setRenderableObjects, setSelectedElementId, addHistoryEntry]);

  const transformSelectedElement = useCallback((transformFn: (element: ElementData) => Partial<ElementData>) => {
    if (selectedElementId) {
      const result = getElementById(selectedElementId);
      if (result) {
        const changes = transformFn(result.element);
        updateElement(selectedElementId, changes);
      }
    }
  }, [selectedElementId, getElementById, updateElement]);

  const flipSelectedElementHorizontal = useCallback(() => {
    transformSelectedElement(el => ({ scaleX: (el.scaleX ?? 1) * -1 }));
  }, [transformSelectedElement]);

  const flipSelectedElementVertical = useCallback(() => {
    transformSelectedElement(el => ({ scaleY: (el.scaleY ?? 1) * -1 }));
  }, [transformSelectedElement]);

  const rotateSelectedElement = useCallback((degrees = 15) => {
    transformSelectedElement(el => ({ rotation: (el.rotation ?? 0) + degrees }));
  }, [transformSelectedElement]);

  const duplicateSelectedElement = useCallback(() => {
    if (!selectedElementId) return;
    
    const elementToDuplicate = renderableObjects.find(obj => !('tool' in obj) && obj.id === selectedElementId) as ElementData | undefined;
    if (!elementToDuplicate) return;
    
    const newElement: ElementData = {
        ...elementToDuplicate,
        id: crypto.randomUUID(),
        x: (elementToDuplicate.x ?? 0) + 20,
        y: (elementToDuplicate.y ?? 0) + 20,
    };
    
    const updatedObjects = [...renderableObjects, newElement];
    setRenderableObjects(updatedObjects);
    setSelectedElementId(newElement.id);

    const elementTypeName = getElementTypeName(elementToDuplicate.type);
    addHistoryEntry({
        type: 'elementDuplicated',
        description: `Duplicated ${elementTypeName}`,
        linesSnapshot: updatedObjects,
        metadata: {
            elementId: newElement.id,
            elementType: elementToDuplicate.type
        }
    });
  }, [selectedElementId, renderableObjects, setRenderableObjects, setSelectedElementId, addHistoryEntry]);

  const clearElements = useCallback(() => {
    const elementsToRemove = renderableObjects.filter(obj => !('tool' in obj));
    
    if (elementsToRemove.length > 0) {
        const onlyLines = renderableObjects.filter(obj => 'tool' in obj);
        setRenderableObjects(onlyLines);
        setSelectedElementId(null);

        addHistoryEntry({
            type: 'elementRemoved',
            description: `All elements removed (${elementsToRemove.length})`,
            linesSnapshot: onlyLines,
            metadata: {}
        });
    }
  }, [renderableObjects, setRenderableObjects, setSelectedElementId, addHistoryEntry]);

  const bringElementToFront = useCallback((elementId: string) => {
    const elementResult = getElementById(elementId);
    if (!elementResult) return;

    const elementToMove = elementResult.element;
    const otherObjects = renderableObjects.filter(obj => {
      if ('tool' in obj) return true; // Keep all lines
      return obj.id !== elementId; // Remove the element we're moving
    });

    // Add the element to the end (front)
    const updatedObjects = [...otherObjects, elementToMove];
    setRenderableObjects(updatedObjects);

    const elementTypeName = getElementTypeName(elementToMove.type);
    addHistoryEntry({
      type: 'elementModified',
      description: `Brought ${elementTypeName} to front`,
      linesSnapshot: updatedObjects,
      metadata: {
        elementId: elementId,
        elementType: elementToMove.type
      }
    });
  }, [renderableObjects, setRenderableObjects, getElementById, addHistoryEntry]);

  const sendElementToBack = useCallback((elementId: string) => {
    const elementResult = getElementById(elementId);
    if (!elementResult) {
      console.warn('ElementsManagement: Element not found for sendElementToBack:', elementId);
      return;
    }

    const elementToMove = elementResult.element;
    const lines = renderableObjects.filter(obj => 'tool' in obj);
    const otherElements = renderableObjects.filter(obj => {
      if ('tool' in obj) return false; // Exclude lines
      return obj.id !== elementId; // Exclude the element we're moving
    });

    // Add the element after lines but before other elements (back)
    const updatedObjects = [...lines, elementToMove, ...otherElements];
    
    // Log the reordering operation
    const beforeOrder = renderableObjects
      .filter(obj => !('tool' in obj))
      .map((obj, index) => ({ index, type: (obj as ElementData).type, id: obj.id.slice(-6) }));
    const afterOrder = updatedObjects
      .filter(obj => !('tool' in obj))
      .map((obj, index) => ({ index, type: (obj as ElementData).type, id: obj.id.slice(-6) }));
    
    console.log('ElementsManagement: Sending element to back', {
      elementId: elementId.slice(-6),
      elementType: elementToMove.type,
      beforeOrder,
      afterOrder
    });
    
    setRenderableObjects(updatedObjects);

    const elementTypeName = getElementTypeName(elementToMove.type);
    addHistoryEntry({
      type: 'elementModified',
      description: `Sent ${elementTypeName} to back`,
      linesSnapshot: updatedObjects,
      metadata: {
        elementId: elementId,
        elementType: elementToMove.type
      }
    });
  }, [renderableObjects, setRenderableObjects, getElementById, addHistoryEntry]);

  const sendElementToBackground = useCallback((elementId: string) => {
    const elementResult = getElementById(elementId);
    if (!elementResult) {
      console.warn('ElementsManagement: Element not found for sendElementToBackground:', elementId);
      return;
    }

    const elementToMove = elementResult.element;
    const otherObjects = renderableObjects.filter(obj => {
      if ('tool' in obj) return true; // Keep all lines
      return obj.id !== elementId; // Exclude the element we're moving
    });

    // Add the element at the very beginning (true background - before everything including lines)
    const updatedObjects = [elementToMove, ...otherObjects];
    
    // Log the reordering operation
    const beforeOrder = renderableObjects
      .filter(obj => !('tool' in obj))
      .map((obj, index) => ({ index, type: (obj as ElementData).type, id: obj.id.slice(-6) }));
    const afterOrder = updatedObjects
      .filter(obj => !('tool' in obj))
      .map((obj, index) => ({ index, type: (obj as ElementData).type, id: obj.id.slice(-6) }));
    
    console.log('ElementsManagement: Setting element as true background', {
      elementId: elementId.slice(-6),
      elementType: elementToMove.type,
      beforeOrder,
      afterOrder
    });
    
    setRenderableObjects(updatedObjects);

    const elementTypeName = getElementTypeName(elementToMove.type);
    addHistoryEntry({
      type: 'elementModified',
      description: `Set ${elementTypeName} as background`,
      linesSnapshot: updatedObjects,
      metadata: {
        elementId: elementId,
        elementType: elementToMove.type
      }
    });
  }, [renderableObjects, setRenderableObjects, getElementById, addHistoryEntry]);

  const moveSelectedElement = useCallback((direction: 'up' | 'down' | 'left' | 'right', distance: number = 1) => {
    if (!selectedElementId) return;
    
    const elementResult = getElementById(selectedElementId);
    if (!elementResult) return;
    
    const element = elementResult.element;
    let deltaX = 0;
    let deltaY = 0;
    
    switch (direction) {
      case 'up':
        deltaY = -distance;
        break;
      case 'down':
        deltaY = distance;
        break;
      case 'left':
        deltaX = -distance;
        break;
      case 'right':
        deltaX = distance;
        break;
    }
    
    const newX = (element.x || 0) + deltaX;
    const newY = (element.y || 0) + deltaY;
    
    updateElement(selectedElementId, { x: newX, y: newY });
  }, [selectedElementId, getElementById, updateElement]);

  const adjustImageToCanvas = useCallback((imageId: string) => {
    if (!contextStageSize) {
      console.warn('ElementsManagement: No canvas size available for adjust operation');
      return;
    }

    const elementResult = getElementById(imageId);
    if (!elementResult || elementResult.element.type !== 'custom-image') {
      console.warn('ElementsManagement: Element not found or not an image for adjust operation');
      return;
    }

    const image = elementResult.element;
    const canvasWidth = contextStageSize.width;
    const canvasHeight = contextStageSize.height;
    const imageWidth = image.width || 100;
    const imageHeight = image.height || 100;

    // Calculate scale to fit image within canvas (adjust - scale by longest side to fit completely)
    const scaleX = canvasWidth / imageWidth;
    const scaleY = canvasHeight / imageHeight;
    const scale = Math.min(scaleX, scaleY); // Use minimum to ensure image fits completely within canvas

    const newWidth = imageWidth * scale;
    const newHeight = imageHeight * scale;

    // Center the image on canvas - for center-based coordinate system, x,y should be the canvas center
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;
    const newX = canvasCenterX; // Image x,y represents the center, not top-left
    const newY = canvasCenterY; // Image x,y represents the center, not top-left

    console.log('ElementsManagement: Adjusting image to canvas', {
      imageId: imageId.slice(-6),
      originalSize: { width: imageWidth, height: imageHeight },
      canvasSize: { width: canvasWidth, height: canvasHeight },
      canvasCenter: { x: canvasCenterX, y: canvasCenterY },
      scale,
      newSize: { width: newWidth, height: newHeight },
      newPosition: { x: newX, y: newY },
      imageCenter: { x: newX, y: newY } // x,y IS the center for center-based coordinates
    });

    updateElement(imageId, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      scaleX: 1, // Reset any existing scale transformations
      scaleY: 1,
      rotation: 0, // Reset rotation for clean adjustment
    });
  }, [contextStageSize, getElementById, updateElement]);

  const fitImageToCanvas = useCallback((imageId: string) => {
    if (!contextStageSize) {
      console.warn('ElementsManagement: No canvas size available for fit operation');
      return;
    }

    const elementResult = getElementById(imageId);
    if (!elementResult || elementResult.element.type !== 'custom-image') {
      console.warn('ElementsManagement: Element not found or not an image for fit operation');
      return;
    }

    const image = elementResult.element;
    const canvasWidth = contextStageSize.width;
    const canvasHeight = contextStageSize.height;
    const imageWidth = image.width || 100;
    const imageHeight = image.height || 100;

    // Calculate scale to cover entire canvas (fit - scale by shortest side to cover canvas completely)
    const scaleX = canvasWidth / imageWidth;
    const scaleY = canvasHeight / imageHeight;
    const scale = Math.max(scaleX, scaleY); // Use maximum to ensure image covers entire canvas

    const newWidth = imageWidth * scale;
    const newHeight = imageHeight * scale;

    // Center the image on canvas - for center-based coordinate system, x,y should be the canvas center
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;
    const newX = canvasCenterX; // Image x,y represents the center, not top-left
    const newY = canvasCenterY; // Image x,y represents the center, not top-left

    console.log('ElementsManagement: Fitting image to canvas', {
      imageId: imageId.slice(-6),
      originalSize: { width: imageWidth, height: imageHeight },
      canvasSize: { width: canvasWidth, height: canvasHeight },
      canvasCenter: { x: canvasCenterX, y: canvasCenterY },
      scale,
      newSize: { width: newWidth, height: newHeight },
      newPosition: { x: newX, y: newY },
      imageCenter: { x: newX, y: newY }, // x,y IS the center for center-based coordinates
      extendsCanvas: { 
        right: (newX + newWidth / 2) > canvasWidth, 
        bottom: (newY + newHeight / 2) > canvasHeight,
        left: (newX - newWidth / 2) < 0,
        top: (newY - newHeight / 2) < 0
      }
    });

    updateElement(imageId, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      scaleX: 1, // Reset any existing scale transformations
      scaleY: 1,
      rotation: 0, // Reset rotation for clean fit
    });
  }, [contextStageSize, getElementById, updateElement]);

  const setImageAsBackground = useCallback((imageId: string) => {
    console.log('ElementsManagement: Setting image as background', {
      imageId: imageId.slice(-6)
    });

    // Send element to background using existing functionality
    sendElementToBackground(imageId);

    // Optionally adjust image to fit canvas as background
    if (contextStageSize) {
      fitImageToCanvas(imageId);
    }

    console.log('ElementsManagement: Image successfully set as background');
  }, [sendElementToBackground, fitImageToCanvas, contextStageSize]);

  return {
    addElement,
    updateElement,
    updateTextElement,
    updateSelectedElementStyle,
    removeElement: removeSelectedElement,
    selectedElementId,
    setSelectedElementId,
    hoveredElementId,
    setHoveredElementId,
    handleDragEnd,
    handleElementClick,
    removeSelectedElement,
    flipSelectedElementHorizontal,
    flipSelectedElementVertical,
    rotateSelectedElement,
    duplicateSelectedElement,
    clearElements,
    getElementById,
    getElementDataFromRenderables,
    bringElementToFront,
    sendElementToBack,
    sendElementToBackground,
    moveSelectedElement,
    adjustImageToCanvas,
    fitImageToCanvas,
    setImageAsBackground,
  };
};

const getElementTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    'text': 'text',
    'rectangle': 'rectangle',
    'square': 'square', 
    'rounded-rectangle': 'rounded-rectangle',
    'squircle': 'squircle',
    'circle': 'circle',
    'triangle': 'triangle',
    'pentagon': 'pentagon',
    'hexagon': 'hexagon',
    'star': 'star',
    'heart': 'heart',
    'arrow': 'arrow',
    'line': 'line',
    'custom-image': 'custom-image'
  };
  return typeNames[type] || 'element';
};

export default useElementsManagement; 