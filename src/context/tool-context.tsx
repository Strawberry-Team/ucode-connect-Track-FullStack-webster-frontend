import React, { createContext, useContext, useState, useCallback, useRef } from "react"
import type { Tool, Element, ToolSettings, FontStyles, TextAlignment, TextCase, BorderStyle, ShapeType, LineData, ElementData, RenderableObject } from "@/types/canvas"

export type MirrorMode = "None" | "Vertical" | "Horizontal" | "Four-way";

// Define a union type for all renderable objects
// export type RenderableObject = LineData | ElementData; // Moved to types/canvas.ts

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  type: 'brushStroke' | 'eraserStroke' | 'unknown' | 'elementAdded' | 'elementModified' | 'elementRemoved'; // Expanded history types
  description: React.ReactNode;
  linesSnapshot: RenderableObject[]; // Snapshot of all renderable objects
  isActive: boolean;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InitialImage {
  src: string;
  width: number;
  height: number;
  file: File;
}

interface ToolContextValue {
  activeTool: Tool | null
  setActiveTool: (tool: Tool | null) => void
  activeElement: Element | null
  setActiveElement: (element: Element | null) => void
  color: string
  setColor: (color: string) => void
  secondaryColor: string
  setSecondaryColor: (color: string) => void
  swapColors: () => void
  brushSize: number
  setBrushSize: (size: number) => void
  eraserSize: number
  setEraserSize: (size: number) => void
  opacity: number
  setOpacity: (opacity: number) => void
  eraserOpacity: number
  setEraserOpacity: (opacity: number) => void
  eraserHardness: number
  setEraserHardness: (hardness: number) => void
  zoom: number
  setZoom: (zoom: number) => void
  toolSettings: ToolSettings

  // Additional parameters for text
  textColor: string
  setTextColor: (color: string) => void
  textBgColor: string
  setTextBgColor: (color: string) => void
  textBgOpacity: number
  setTextBgOpacity: (opacity: number) => void
  fontSize: number
  setFontSize: (size: number) => void
  fontFamily: string
  setFontFamily: (family: string) => void
  fontStyles: FontStyles
  setFontStyles: (styles: FontStyles) => void
  textCase: TextCase
  setTextCase: (textCase: TextCase) => void
  textAlignment: TextAlignment
  setTextAlignment: (alignment: TextAlignment) => void
  lineHeight: number
  setLineHeight: (height: number) => void
  backgroundColor: string
  setBackgroundColor: (color: string) => void
  backgroundOpacity: number
  setBackgroundOpacity: (opacity: number) => void

  // Additional parameters for shapes
  fillColor: string
  setFillColor: (color: string) => void
  fillColorOpacity: number
  setFillColorOpacity: (opacity: number) => void
  borderColor: string
  setBorderColor: (color: string) => void
  borderWidth: number
  setBorderWidth: (width: number) => void
  borderStyle: BorderStyle
  setBorderStyle: (style: BorderStyle) => void
  borderColorOpacity: number
  setBorderColorOpacity: (opacity: number) => void
  cornerRadius: number
  setCornerRadius: (radius: number) => void

  // Text specific opacity for text color
  textColorOpacity: number
  setTextColorOpacity: (opacity: number) => void

  brushMirrorMode: MirrorMode
  setBrushMirrorMode: (mode: MirrorMode) => void
  eraserMirrorMode: MirrorMode
  setEraserMirrorMode: (mode: MirrorMode) => void

  isCropping: boolean;
  setIsCropping: (isCropping: boolean) => void;
  cropRect: Rect | null;
  setCropRect: (rect: Rect | null) => void;
  stageSize: { width: number; height: number } | null;
  setStageSize: (size: { width: number; height: number } | null) => void;
  selectedAspectRatio: string;
  setSelectedAspectRatio: (aspectRatio: string) => void;
  triggerApplyCrop: boolean;
  setTriggerApplyCrop: () => void;
  isCanvasManuallyResized: boolean;
  setIsCanvasManuallyResized: (isResized: boolean) => void;

  initialImage: InitialImage | null;
  setInitialImage: (image: InitialImage | null) => void;

  // Shape settings
  shapeType: ShapeType
  setShapeType: (type: ShapeType) => void
  shapeTransform: {
    rotate: number
    scaleX: number
    scaleY: number
  }
  setShapeTransform: (transform: { rotate: number; scaleX: number; scaleY: number }) => void

  // NavigatorPanel
  cursorPositionOnCanvas: { x: number; y: number } | null;
  setCursorPositionOnCanvas: (position: { x: number; y: number } | null) => void;

  // MiniMap in NavigatorPanel
  miniMapDataURL: string | null;
  setMiniMapDataURL: (url: string | null) => void;
  visibleCanvasRectOnMiniMap: { x: number; y: number; width: number; height: number } | null;
  setVisibleCanvasRectOnMiniMap: (rect: { x: number; y: number; width: number; height: number } | null) => void;

  // For setting the canvas position from MiniMap
  setStagePositionFromMiniMap: (coords: { x: number; y: number }, type: 'center' | 'drag') => void;
  registerStagePositionUpdater: (updater: (coords: { x: number; y: number }, type: 'center' | 'drag') => void) => void;

  // History
  history: HistoryEntry[];
  currentHistoryIndex: number; // Индекс текущего активного состояния в истории
  addHistoryEntry: (entryData: Omit<HistoryEntry, 'id' | 'timestamp' | 'isActive'>) => void;
  revertToHistoryState: (historyId: string) => void;
  registerRenderableObjectsRestorer: (restorer: (objects: RenderableObject[]) => void) => void;

  // New state for all renderable objects
  renderableObjects: RenderableObject[];
  addRenderableObject: (obj: RenderableObject) => void;
  updateLinePoints: (lineId: string, pointsToAdd: number[]) => void; // More specific update
  updateMultipleLinePoints: (updates: Array<{ id: string; pointsToAdd: number[] }>) => void; // For mirroring
  setRenderableObjects: (objects: RenderableObject[]) => void;

  // New state for add mode
  isAddModeActive: boolean;
  setIsAddModeActive: (isActive: boolean) => void;
  currentAddToolType: ShapeType | "text" | "brush" | "eraser" | null;
  setCurrentAddToolType: (type: ShapeType | "text" | "brush" | "eraser" | null) => void;
}

const ToolContext = createContext<ToolContextValue | undefined>(undefined)

export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTool, setActiveToolInternal] = useState<Tool | null>(null)
  const [activeElement, setActiveElement] = useState<Element | null>(null)
  const [color, setColor] = useState("#000000")
  const [secondaryColor, setSecondaryColor] = useState("#ffffff")
  const [brushSize, setBrushSize] = useState(20)
  
  // Add text-specific states
  const [textColor, setTextColor] = useState("#000000")
  const [textBgColor, setTextBgColor] = useState("transparent")
  const [textBgOpacity, setTextBgOpacity] = useState(100)
  const [textColorOpacity, setTextColorOpacity] = useState(100)
  const [fillColor, setFillColor] = useState("#ffffff")
  const [fillColorOpacity, setFillColorOpacity] = useState(100)
  const [borderColor, setBorderColor] = useState("#000000")
  const [borderColorOpacity, setBorderColorOpacity] = useState(100)

  const [eraserSize, setEraserSize] = useState(20)
  const [opacity, setOpacity] = useState(100)
  const [eraserOpacity, setEraserOpacity] = useState(100)
  const [eraserHardness, setEraserHardness] = useState(100)
  const [zoom, setZoom] = useState(100)
  const [brushMirrorMode, setBrushMirrorMode] = useState<MirrorMode>("None")
  const [eraserMirrorMode, setEraserMirrorMode] = useState<MirrorMode>("None")

  // Crop related state
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number } | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("custom");
  const [triggerApplyCrop, setTriggerApplyCropState] = useState<boolean>(false);
  const [isCanvasManuallyResized, setIsCanvasManuallyResized] = useState<boolean>(false);
  const [initialImage, setInitialImage] = useState<InitialImage | null>(null);

  // State for cursor position on canvas
  const [cursorPositionOnCanvas, setCursorPositionOnCanvas] = useState<{ x: number; y: number } | null>(null);

  // States for MiniMap
  const [miniMapDataURL, setMiniMapDataURL] = useState<string | null>(null);
  const [visibleCanvasRectOnMiniMap, setVisibleCanvasRectOnMiniMap] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // State for storing the function of updating from Canvas.tsx
  const [actualStagePositionUpdater, setActualStagePositionUpdater] =
    useState< (coords: { x: number; y: number }, type: 'center' | 'drag') => void>(() => () => {
      console.warn("setStagePositionFromMiniMap called before Canvas has registered its updater function.");
    });

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);

  // Регистраторы для восстановления состояния
  const renderableObjectsRestorerRef = useRef<((objects: RenderableObject[]) => void) | null>(null);

  // New state for all renderable objects
  const [renderableObjects, setRenderableObjects] = useState<RenderableObject[]>([]);

  // New state for add mode
  const [isAddModeActive, setIsAddModeActive] = useState<boolean>(false);
  const [currentAddToolType, setCurrentAddToolType] = useState<ShapeType | "text" | "brush" | "eraser" | null>(null);

  const setActiveTool = useCallback((tool: Tool | null) => {
    setActiveToolInternal(tool);
    setIsAddModeActive(false); // Reset add mode when tool changes
    setCurrentAddToolType(null); // Reset add tool type
  }, []);

  const addRenderableObject = useCallback((obj: RenderableObject) => {
    setRenderableObjects(prev => [...prev, obj]);
  }, []);

  const updateLinePoints = useCallback((lineId: string, pointsToAdd: number[]) => {
    setRenderableObjects(prev =>
      prev.map(obj => {
        if ('id' in obj && obj.id === lineId && 'tool' in obj && ('points' in obj)) {
          return { ...obj, points: [...obj.points, ...pointsToAdd] };
        }
        return obj;
      })
    );
  }, []);

  const updateMultipleLinePoints = useCallback((updates: Array<{ id: string; pointsToAdd: number[] }>) => {
    setRenderableObjects(prev => {
      const updatesMap = new Map(updates.map(u => [u.id, u.pointsToAdd]));
      return prev.map(obj => {
        if ('id' in obj && updatesMap.has(obj.id) && 'tool' in obj && ('points' in obj)) {
          const pointsToAdd = updatesMap.get(obj.id)!;
          return { ...obj, points: [...obj.points, ...pointsToAdd] };
        }
        return obj;
      });
    });
  }, []);

  const registerRenderableObjectsRestorer = useCallback((restorer: (objects: RenderableObject[]) => void) => {
    renderableObjectsRestorerRef.current = restorer;
  }, []);

  const addHistoryEntry = useCallback((entryData: Omit<HistoryEntry, 'id' | 'timestamp' | 'isActive'>) => {
    setHistory(prevHistory => {
      const newHistoryBase = currentHistoryIndex < prevHistory.length - 1 && prevHistory.length > 0
        ? prevHistory.slice(0, currentHistoryIndex + 1)
        : prevHistory;

      const newEntry: HistoryEntry = {
        ...entryData,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
        isActive: true,
      };
      
      const updatedHistory = newHistoryBase.map(entry => ({ ...entry, isActive: true }));
      
      const finalHistory = [...updatedHistory, newEntry];
      setCurrentHistoryIndex(finalHistory.length - 1);
      return finalHistory;
    });
  }, [currentHistoryIndex]);

  const revertToHistoryState = useCallback((historyId: string) => {
    const entryIndex = history.findIndex(entry => entry.id === historyId);
    if (entryIndex === -1) {
      console.warn("History entry not found for ID:", historyId);
      return;
    }

    const targetEntry = history[entryIndex];
    if (!targetEntry.linesSnapshot) {
        console.warn("Lines snapshot missing in history entry:", historyId);
        return;
    }

    if (renderableObjectsRestorerRef.current) {
      const deepCopiedSnapshot = targetEntry.linesSnapshot.map(obj => ({...obj})); 
      renderableObjectsRestorerRef.current(deepCopiedSnapshot);
    } else {
      console.warn("RenderableObjects restorer not registered in ToolContext.");
    }
    
    setHistory(prevHistory =>
      prevHistory.map((entry, index) => ({
        ...entry,
        isActive: index <= entryIndex,
      }))
    );
    setCurrentHistoryIndex(entryIndex);
  }, [history]);

  // Function that MiniMap will call
  const setStagePositionFromMiniMap = useCallback((coords: { x: number; y: number }, type: 'center' | 'drag') => {
    actualStagePositionUpdater(coords, type);
  }, [actualStagePositionUpdater]);

  // Function that Canvas will call to register its function
  const registerStagePositionUpdater = useCallback((updater: (coords: { x: number; y: number }, type: 'center' | 'drag') => void) => {
    setActualStagePositionUpdater(() => updater); // Important to wrap in () => updater for the function state
  }, []);

  //  States for text
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontStyles, setFontStyles] = useState<FontStyles>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false
  })
  const [textCase, setTextCase] = useState<TextCase>("none")
  const [textAlignment, setTextAlignment] = useState<TextAlignment>("center")
  const [lineHeight, setLineHeight] = useState(1)
  const [backgroundColor, setBackgroundColor] = useState("transparent")
  const [backgroundOpacity, setBackgroundOpacity] = useState(100)

  // States for shapes
  const [borderWidth, setBorderWidth] = useState(2)
  const [borderStyle, setBorderStyle] = useState<BorderStyle>("solid")
  const [cornerRadius, setCornerRadius] = useState(0)

  // Shape settings state
  const [shapeType, setShapeType] = useState<ShapeType>("rectangle")
  const [shapeTransform, setShapeTransform] = useState({
    rotate: 0,
    scaleX: 1,
    scaleY: 1
  })

  const swapColors = () => {
    const tempColor = color
    setColor(secondaryColor)
    setSecondaryColor(tempColor)
  }

  const handleSetTriggerApplyCrop = () => {
    setTriggerApplyCropState(true);
    // Automatically reset the trigger after a short delay or after processing
    // This depends on how you want to handle the trigger consumption
    setTimeout(() => setTriggerApplyCropState(false), 100);
  };

  const toolSettings: ToolSettings = {
    brush: {
      size: brushSize,
      opacity: opacity,
      color: color
    },
    eraser: {
      size: eraserSize,
      opacity: eraserOpacity,
      hardness: eraserHardness
    }
  }

  return (
    <ToolContext.Provider
      value={{
        activeTool,
        setActiveTool,
        activeElement,
        setActiveElement,
        color,
        setColor,
        secondaryColor,
        setSecondaryColor,
        swapColors,
        brushSize,
        setBrushSize,
        eraserSize,
        setEraserSize,
        opacity,
        setOpacity,
        eraserOpacity,
        setEraserOpacity,
        eraserHardness,
        setEraserHardness,
        zoom,
        setZoom,
        toolSettings,

        // Additional parameters for text
        textColor,
        setTextColor,
        textBgColor,
        setTextBgColor,
        textBgOpacity,
        setTextBgOpacity,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        fontStyles,
        setFontStyles,
        textCase,
        setTextCase,
        textAlignment,
        setTextAlignment,
        lineHeight,
        setLineHeight,
        backgroundColor,
        setBackgroundColor,
        backgroundOpacity,
        setBackgroundOpacity,

        // Additional parameters for shapes
        borderColor,
        setBorderColor,
        borderWidth,
        setBorderWidth,
        borderStyle,
        setBorderStyle,
        borderColorOpacity,
        setBorderColorOpacity,
        cornerRadius,
        setCornerRadius,
        fillColor,
        setFillColor,
        fillColorOpacity,
        setFillColorOpacity,

        // Text color opacity
        textColorOpacity,
        setTextColorOpacity,

        brushMirrorMode,
        setBrushMirrorMode,
        eraserMirrorMode,
        setEraserMirrorMode,
        isCropping,
        setIsCropping,
        cropRect,
        setCropRect,
        stageSize,
        setStageSize,
        selectedAspectRatio,
        setSelectedAspectRatio,
        triggerApplyCrop,
        setTriggerApplyCrop: handleSetTriggerApplyCrop,
        isCanvasManuallyResized,
        setIsCanvasManuallyResized,
        initialImage,
        setInitialImage,

        // Shape settings
        shapeType,
        setShapeType,
        shapeTransform,
        setShapeTransform,
        // Pass new values for cursor coordinates
        cursorPositionOnCanvas,
        setCursorPositionOnCanvas,
        // Pass new values for MiniMap
        miniMapDataURL,
        setMiniMapDataURL,
        visibleCanvasRectOnMiniMap,
        setVisibleCanvasRectOnMiniMap,
        // For setting the canvas position from MiniMap
        setStagePositionFromMiniMap,
        registerStagePositionUpdater,
        // History
        history,
        currentHistoryIndex,
        addHistoryEntry,
        revertToHistoryState,
        registerRenderableObjectsRestorer,
        // New context values
        renderableObjects,
        addRenderableObject,
        updateLinePoints,
        updateMultipleLinePoints,
        setRenderableObjects,
        // Add mode
        isAddModeActive,
        setIsAddModeActive,
        currentAddToolType,
        setCurrentAddToolType,
      }}
    >
      {children}
    </ToolContext.Provider>
  )
}

export const useTool = () => {
  const context = useContext(ToolContext)
  if (context === undefined) {
    throw new Error("useTool must be used within a ToolProvider")
  }
  return context
}
