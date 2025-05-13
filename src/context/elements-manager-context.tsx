import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import useElementsManagement from "@/hooks/use-elements-management";
import type { ElementsManagementProps } from "@/hooks/use-elements-management";
import type { ElementData } from "@/types/canvas";
import type Konva from "konva";

// Define the type for the context value
interface ElementsManagerContextValue {
  elements: ElementData[];
  setElements: (elements: ElementData[]) => void;
  addElement: (type: string, pos: { x: number; y: number }, isRightClick?: boolean, text?: string) => void;
  renderElements: () => { key: string; element: ElementData; index: number }[];
  updateElement: (index: number, newData: Partial<ElementData>) => void;
  updateTextElement: (index: number, newText: string) => void;
  updateSelectedElementStyle: (styleUpdate: Partial<ElementData>) => void;
  removeElement: (index: number) => void;
  selectedElementIndex: number | null;
  setSelectedElementIndex: (index: number | null) => void;
  handleDragEnd: (index: number, newX: number, newY: number) => void;
  handleElementClick: (index: number, e: Konva.KonvaEventObject<MouseEvent>) => void;
  resizeSelectedElement: (widthDelta: number, heightDelta: number) => void;
  removeSelectedElement: () => void;
  flipSelectedElementHorizontal: () => void;
  flipSelectedElementVertical: () => void;
  rotateSelectedElement: (degrees?: number) => void;
  duplicateSelectedElement: () => void;
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