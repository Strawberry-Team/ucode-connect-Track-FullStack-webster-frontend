import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import useElementsManagement from "@/hooks/use-elements-management";
import type { ElementsManagementProps } from "@/hooks/use-elements-management";
import type { ElementData, ShapeType } from "@/types/canvas";
import type Konva from "konva";

// Define the type for the context value
interface ElementsManagerContextValue {
  addElement: (type: ShapeType | "text" | "custom-image", pos: { x: number; y: number }, text?: string, settings?: Partial<ElementData>) => void;
  updateElement: (id: string, newData: Partial<ElementData>) => void;
  updateTextElement: (id: string, newText: string) => void;
  updateSelectedElementStyle: (styleUpdate: Partial<ElementData>) => void;
  removeSelectedElement: () => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  handleDragEnd: (id: string, newX: number, newY: number) => void;
  handleElementClick: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
  flipSelectedElementHorizontal: () => void;
  flipSelectedElementVertical: () => void;
  rotateSelectedElement: (degrees?: number) => void;
  duplicateSelectedElement: () => void;
  clearElements: () => void;
  getElementById: (id: string) => { element: ElementData; indexInRenderables: number; } | null;
  getElementDataFromRenderables: () => ElementData[];
  bringElementToFront: (elementId: string) => void;
  sendElementToBack: (elementId: string) => void;
}

// Create the context with a default value of undefined
export const ElementsManagerContext = createContext<ElementsManagerContextValue | undefined>(undefined);

// Provider component
export const ElementsManagerProvider: React.FC<{ children: ReactNode; options: ElementsManagementProps }> = ({ 
  children, 
  options 
}) => {
  const elementsManager = useElementsManagement(options);

  return (
    <ElementsManagerContext.Provider value={elementsManager}>
      {children}
    </ElementsManagerContext.Provider>
  );
};

// Custom hook to use the context
export const useElementsManager = () => {
  const context = useContext(ElementsManagerContext);
  
  if (context === undefined) {
    throw new Error("useElementsManager must be used within an ElementsManagerProvider");
  }
  
  return context;
}; 