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
  } = useTool();

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

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

  const addElement = useCallback((
    type: ShapeType | "text" | "custom-image",
    pos: { x: number; y: number },
    isRightClick: boolean = false,
    text?: string,
    settings?: Partial<ElementData>
  ) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const currentOpacity = (settings?.opacity !== undefined ? settings.opacity : (toolOpacity ?? defaultPropOpacity)) / 100;

    const baseElement: Omit<ElementData, 'type' | 'color'> & { id: string; type: ShapeType | "text" | "custom-image" } = {
      id,
      type: type,
      x: pos.x,
      y: pos.y,
      width: type === "text" ? 200 : (type === "custom-image" && settings?.width ? settings.width : 100),
      height: type === "text" ? 50 : (type === "custom-image" && settings?.height ? settings.height : 100),
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
            borderColor: settings?.borderColor ?? toolShapeBorderColor,
            borderColorOpacity: settings?.borderColorOpacity ?? toolBorderColorOpacity ?? defaultBorderColorOpacity,
            borderWidth: settings?.borderWidth ?? 0,
            borderStyle: settings?.borderStyle ?? "hidden",
            color: settings?.color ?? defaultPropColor,
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
    defaultTextColorOpacity, defaultBorderColorOpacity
  ]
);

  const updateElement = useCallback((id: string, newData: Partial<ElementData>) => {
    setRenderableObjects(
      renderableObjects.map(obj => {
        if (!('tool' in obj) && obj.id === id) {
          const element = obj as ElementData;
          
          // For text elements, we need to preserve text styling when updating geometry
          if (element.type === "text" && 
              (newData.width !== undefined || newData.height !== undefined || 
               newData.x !== undefined || newData.y !== undefined || 
               newData.rotation !== undefined || newData.scaleX !== undefined || 
               newData.scaleY !== undefined)) {
            
            // Extract geometry-related properties from newData
            const { width, height, x, y, rotation, scaleX, scaleY } = newData;
            const geometryUpdate: Partial<ElementData> = {};
            
            if (width !== undefined) geometryUpdate.width = width;
            if (height !== undefined) geometryUpdate.height = height;
            if (x !== undefined) geometryUpdate.x = x;
            if (y !== undefined) geometryUpdate.y = y;
            if (rotation !== undefined) geometryUpdate.rotation = rotation;
            if (scaleX !== undefined) geometryUpdate.scaleX = scaleX;
            if (scaleY !== undefined) geometryUpdate.scaleY = scaleY;
            
            // Only apply geometry updates, preserving all text styling
            return { ...element, ...geometryUpdate } as ElementData;
          }
          
          // For non-text elements or text styling updates, apply all changes
          return { ...element, ...newData } as ElementData;
        }
        return obj;
      })
    );
  }, [renderableObjects, setRenderableObjects]);

  const handleDragEnd = useCallback((id: string, newX: number, newY: number) => {
    updateElement(id, { x: newX, y: newY });
  }, [updateElement]);

  const handleElementClick = useCallback((id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const elementResult = getElementById(id);
    if (!elementResult) return;

    const clickedElement = elementResult.element;
    let canBeSelectedBasedOnToolAndElementType = false;

    if (activeTool?.type === "cursor") {
        canBeSelectedBasedOnToolAndElementType = true;
    } else if (activeTool?.type === "text" && clickedElement.type === "text") {
        canBeSelectedBasedOnToolAndElementType = true;
    } else if (activeTool?.type === "shape" && clickedElement.type !== "text") {
        canBeSelectedBasedOnToolAndElementType = true;
    }

    if (canBeSelectedBasedOnToolAndElementType) {
        setSelectedElementId(id);
    } else {
        // If the current tool is not for selecting this element type,
        // clicking the element should not change the selection state.
        // Deselection is typically handled by clicking the stage background.
        // So, if an element is already selected, and we click it with an incompatible tool,
        // it should remain selected (e.g. if text is selected and user clicks it with brush tool).
        // If nothing is selected, or something else is selected, and we click with incompatible tool,
        // selection state also shouldn't change here.
    }
  }, [activeTool, getElementById, setSelectedElementId]);

  const updateTextElement = useCallback((id: string, newText: string) => {
    const result = getElementById(id);
    if (result && result.element.type === "text") {
      updateElement(id, { text: newText });
    }
  }, [getElementById, updateElement]);

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
    if (selectedElementId) {
      setRenderableObjects(renderableObjects.filter(obj => !('id' in obj) || obj.id !== selectedElementId));
      setSelectedElementId(null);
    }
  }, [selectedElementId, renderableObjects, setRenderableObjects]);

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
    if (selectedElementId) {
      const result = getElementById(selectedElementId);
      if (result) {
        const originalElement = result.element;
        const newId = `${originalElement.type}-${Date.now()}`;
        const duplicatedElement: ElementData = {
          ...originalElement,
          id: newId,
          x: (originalElement.x ?? 0) + 20,
          y: (originalElement.y ?? 0) + 20,
        };
        addRenderableObjectToContext(duplicatedElement);
        setSelectedElementId(newId);
      }
    }
  }, [selectedElementId, getElementById, addRenderableObjectToContext]);

  const clearElements = useCallback(() => {
    setRenderableObjects(renderableObjects.filter(obj => 'tool' in obj));
    setSelectedElementId(null);
  }, [renderableObjects, setRenderableObjects]);

  return {
    addElement,
    updateElement,
    updateTextElement,
    updateSelectedElementStyle,
    removeElement: removeSelectedElement,
    selectedElementId,
    setSelectedElementId,
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
  };
};

export default useElementsManagement; 