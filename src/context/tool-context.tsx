import React, {createContext, useContext, useState, useCallback, useRef, useEffect} from "react"
import type {
    Tool,
    Element,
    ToolSettings,
    FontStyles,
    TextAlignment,
    TextCase,
    BorderStyle,
    ShapeType,
    RenderableObject,
    ElementData
} from "@/types/canvas"
import { toast } from 'sonner';
import { loadProjectFonts } from "@/utils/font-utils";

// Import MousePointer2 for default tool
import { MousePointer2 } from "lucide-react";

export type MirrorMode = "None" | "Vertical" | "Horizontal" | "Four-way";

export interface HistoryEntry {
    id: string;
    timestamp: Date;
    type: 'brushStroke' | 'eraserStroke' | 'elementAdded' | 'elementModified' | 'elementRemoved' | 'elementDuplicated' | 'blurApplied' | 'liquifyApplied' | 'unknown';
    description: React.ReactNode;
    linesSnapshot: RenderableObject[]; // Snapshot of all renderable objects
    isActive: boolean;
    metadata?: {
        elementId?: string;
        elementType?: string;
        previousStageSize?: { width: number; height: number };
        newStageSize?: { width: number; height: number };
    };
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
    x?: number;
    y?: number;
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
    setZoom: (zoom: number, isProgrammatic?: boolean) => void
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
    registerStagePositionUpdater: (updater: (coords: {
        x: number;
        y: number
    }, type: 'center' | 'drag') => void) => void;

    // History
    history: HistoryEntry[];
    currentHistoryIndex: number; // Индекс текущего активного состояния в истории
    addHistoryEntry: (entryData: Omit<HistoryEntry, 'id' | 'timestamp' | 'isActive'>) => void;
    revertToHistoryState: (historyId: string) => void;
    registerRenderableObjectsRestorer: (restorer: (objects: RenderableObject[]) => void) => void;
    clearHistory: () => void; // Новая функция для очистки истории

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

    // Container size for canvas viewport calculations
    containerSize: { width: number; height: number } | null;
    setContainerSize: (size: { width: number; height: number } | null) => void;

    // Stage position for direct manipulation from options panels
    stagePosition: { x: number; y: number };
    setStagePosition: (position: { x: number; y: number }) => void;

    // Timestamp for when drawing last ended, to trigger minimap updates
    lastDrawingEndTime: number | null;
    setLastDrawingEndTime: (time: number | null) => void;

    // Liquify tool settings
    liquifyBrushSize: number;
    setLiquifyBrushSize: (size: number) => void;
    liquifyStrength: number;
    setLiquifyStrength: (strength: number) => void;
    liquifyMode: 'push' | 'twirl' | 'pinch' | 'expand' | 'crystals' | 'edge' | 'reconstruct';
    setLiquifyMode: (mode: 'push' | 'twirl' | 'pinch' | 'expand' | 'crystals' | 'edge' | 'reconstruct') => void;
    liquifyTwirlDirection: 'left' | 'right';
    setLiquifyTwirlDirection: (direction: 'left' | 'right') => void;
    isImageReadyForLiquify: boolean;
    setIsImageReadyForLiquify: (isReady: boolean) => void;

    // Blur tool settings
    blurBrushSize: number;
    setBlurBrushSize: (size: number) => void;
    blurStrength: number;
    setBlurStrength: (strength: number) => void;

    // New state for brush transform mode
    isBrushTransformModeActive: boolean;
    setBrushTransformModeActive: (isActive: boolean) => void;
    selectedLineId: string | null;
    setSelectedLineId: (id: string | null) => void;

    isProgrammaticZoomRef: React.MutableRefObject<boolean>;

    isApplyingCrop: boolean;
    setIsApplyingCrop: (isApplying: boolean) => void;

    // File import/export functions
    importFile: (file: File) => Promise<void>;
    exportFile: (format: 'png' | 'jpg' | 'pdf' | 'json') => Promise<void>;
    registerCanvasExporter: (exporter: (format: 'png' | 'jpg' | 'pdf' | 'json') => Promise<void>) => void;

    // State for storing the canvas exporter function
    canvasExporter: ((format: 'png' | 'jpg' | 'pdf' | 'json') => Promise<void>) | null;

    // Project saving state
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    registerProjectSaver: (saver: () => Promise<string | null>) => void;
}

const ToolContext = createContext<ToolContextValue | undefined>(undefined)

export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    // No default tool selected - user must explicitly choose a tool
    const [activeTool, setActiveToolInternal] = useState<Tool | null>(null)
    const [activeElement, setActiveElement] = useState<Element | null>(null)
    const [color, setColor] = useState("#000000")
    const [secondaryColor, setSecondaryColor] = useState("#ffffff")
    const [brushSize, setBrushSize] = useState(20)

    // Add text-specific states
    const [textColor, setTextColor] = useState("#ffffff")
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
    const [visibleCanvasRectOnMiniMap, setVisibleCanvasRectOnMiniMap] = useState<{
        x: number;
        y: number;
        width: number;
        height: number
    } | null>(null);

    // State for storing the function of updating from Canvas.tsx
    const [actualStagePositionUpdater, setActualStagePositionUpdater] =
        useState<(coords: { x: number; y: number }, type: 'center' | 'drag') => void>(() => () => {
            console.warn("setStagePositionFromMiniMap called before Canvas has registered its updater function.");
        });

    // History state
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);

    // Container size state
    const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);

    const [stagePositionContext, setStagePositionContext] = useState({x: 0, y: 0});
    const [lastDrawingEndTime, setLastDrawingEndTime] = useState<number | null>(null);

    // Liquify tool state
    const [liquifyBrushSize, setLiquifyBrushSize] = useState(20);
    const [liquifyStrength, setLiquifyStrength] = useState(50);
    const [liquifyMode, setLiquifyMode] = useState<'push' | 'twirl' | 'pinch' | 'expand' | 'crystals' | 'edge' | 'reconstruct'>('push');
    const [liquifyTwirlDirection, setLiquifyTwirlDirection] = useState<'left' | 'right'>('left');
    const [isImageReadyForLiquify, setIsImageReadyForLiquify] = useState(false);

    // Blur tool state
    const [blurBrushSize, setBlurBrushSize] = useState(20);
    const [blurStrength, setBlurStrength] = useState(20); // Default strength for blur

    // Регистраторы для восстановления состояния
    const renderableObjectsRestorerRef = useRef<((objects: RenderableObject[]) => void) | null>(null);

    // New state for all renderable objects
    const [renderableObjects, setRenderableObjects] = useState<RenderableObject[]>([]);

    // New state for add mode
    const [isAddModeActive, setIsAddModeActive] = useState<boolean>(false);
    const [currentAddToolType, setCurrentAddToolType] = useState<ShapeType | "text" | "brush" | "eraser" | null>(null);

    // New state for brush transform mode
    const [isBrushTransformModeActive, setBrushTransformModeActive] = useState<boolean>(false);
    const [selectedLineId, setSelectedLineId] = useState<string | null>(null);


    const isProgrammaticZoomRef = useRef<boolean>(false);

    const [isApplyingCrop, setIsApplyingCrop] = useState<boolean>(false);

    // State for storing the canvas exporter function
    const [canvasExporter, setCanvasExporter] = useState<((format: 'png' | 'jpg' | 'pdf' | 'json') => Promise<void>) | null>(null);

    // Project saving state
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
    const projectSaverRef = useRef<(() => Promise<string | null>) | null>(null);

    const setActiveTool = useCallback((tool: Tool | null) => {
        setActiveToolInternal(tool);
        setIsAddModeActive(false); // Reset add mode when tool changes
        setCurrentAddToolType(null); // Reset add tool type
        // Also reset brush transform mode if tool changes from brush
        if (tool?.type !== 'brush') {
            setBrushTransformModeActive(false);
            setSelectedLineId(null);
        }
        
        // Reset any element selection when changing tools (except cursor and text tools)
        if (tool?.type !== 'cursor' && tool?.type !== 'text') {
            // This will help clear any selection-related cursor states
        }
    }, []);

    const addRenderableObject = useCallback((obj: RenderableObject) => {
        setRenderableObjects(prev => [...prev, obj]);
    }, []);

    const updateLinePoints = useCallback((lineId: string, pointsToAdd: number[]) => {
        setRenderableObjects(prev =>
            prev.map(obj => {
                if ('id' in obj && obj.id === lineId && 'tool' in obj && ('points' in obj)) {
                    return {...obj, points: [...obj.points, ...pointsToAdd]};
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
                    return {...obj, points: [...obj.points, ...pointsToAdd]};
                }
                return obj;
            });
        });
    }, []);

    const registerRenderableObjectsRestorer = useCallback((restorer: (objects: RenderableObject[]) => void) => {
        renderableObjectsRestorerRef.current = restorer;
    }, []);

    const registerProjectSaver = useCallback((saver: () => Promise<string | null>) => {
        projectSaverRef.current = saver;
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

            const updatedHistory = newHistoryBase.map(entry => ({...entry, isActive: true}));

            const finalHistory = [...updatedHistory, newEntry];
            setCurrentHistoryIndex(finalHistory.length - 1);
            
            // Trigger immediate save on first change
            if (!hasUnsavedChanges && projectSaverRef.current) {
                console.log('ToolContext: First change detected, saving project immediately. Entry type:', entryData.type, 'Description:', entryData.description);
                projectSaverRef.current().then((savedProjectId) => {
                    if (savedProjectId) {
                        console.log('ToolContext: Project saved successfully with ID:', savedProjectId);
                        setHasUnsavedChanges(true);
                    } else {
                        console.warn('ToolContext: Failed to save project immediately - no project ID returned');
                    }
                }).catch((error) => {
                    console.error('ToolContext: Error saving project immediately:', error);
                });
            } else if (hasUnsavedChanges) {
                console.log('ToolContext: Change detected but already has unsaved changes. Entry type:', entryData.type);
            } else {
                console.warn('ToolContext: Change detected but no project saver registered');
            }
            
            return finalHistory;
        });
    }, [currentHistoryIndex, hasUnsavedChanges]);

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
        
        // Trigger immediate save after reverting to history state
        if (projectSaverRef.current) {
            console.log('ToolContext: History reverted, saving project immediately');
            projectSaverRef.current().then((savedProjectId) => {
                if (savedProjectId) {
                    console.log('ToolContext: Project saved successfully after history revert');
                }
            }).catch((error) => {
                console.error('ToolContext: Error saving project after history revert:', error);
            });
        }
    }, [history]);

    // Function that MiniMap will call
    const setStagePositionFromMiniMap = useCallback((coords: { x: number; y: number }, type: 'center' | 'drag') => {
        requestAnimationFrame(() => {
            actualStagePositionUpdater(coords, type);
        });
    }, [actualStagePositionUpdater]);

    // Function that Canvas will call to register its function
    const registerStagePositionUpdater = useCallback((updater: (coords: {
        x: number;
        y: number
    }, type: 'center' | 'drag') => void) => {
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

    const setZoomWithFlag = useCallback((newZoom: number, isProgrammatic: boolean = false) => {
        if (isProgrammatic) {
            isProgrammaticZoomRef.current = true;
        }
        setZoom(newZoom);
        
        if (isProgrammatic) {
            setTimeout(() => {
                isProgrammaticZoomRef.current = false;
            }, 100);
        }
    }, []);

    const clearHistory = () => {
        setHistory([]);
        setCurrentHistoryIndex(-1);
        setHasUnsavedChanges(false); // Reset unsaved changes when clearing history
    };

    const importFile = async (file: File) => {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        try {
            if (fileType.startsWith('image/') || fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpg')) {
                // Import image files as manageable elements
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        let imageWidth = img.width;
                        let imageHeight = img.height;
                        let imageX = 0;
                        let imageY = 0;

                        // If no stage size exists, create canvas with image dimensions
                        if (!stageSize) {
                            setStageSize({ width: Math.max(img.width, 800), height: Math.max(img.height, 600) });
                            imageX = Math.max(img.width, 800) / 2;
                            imageY = Math.max(img.height, 600) / 2;
                        } else {
                            // Calculate positioning and scaling for existing canvas
                            const canvasWidth = stageSize.width;
                            const canvasHeight = stageSize.height;

                            // Check if image is larger than canvas, scale down if needed
                            const maxSize = Math.min(canvasWidth * 0.8, canvasHeight * 0.8); // 80% of canvas size
                            if (img.width > maxSize || img.height > maxSize) {
                                const scaleX = maxSize / img.width;
                                const scaleY = maxSize / img.height;
                                const scale = Math.min(scaleX, scaleY);
                                
                                imageWidth = img.width * scale;
                                imageHeight = img.height * scale;
                            }

                            // Center the image on canvas (using center coordinates)
                            imageX = canvasWidth / 2;
                            imageY = canvasHeight / 2;
                        }
                        
                        // Create image element
                        const imageElement: ElementData = {
                            id: `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                            type: "custom-image",
                            x: imageX,
                            y: imageY,
                            width: imageWidth,
                            height: imageHeight,
                            src: e.target?.result as string,
                            borderColor: "#000000",
                            borderColorOpacity: 100,
                            borderWidth: 0,
                            borderStyle: "hidden",
                            color: "#000000",
                            opacity: 100,
                            rotation: 0,
                            scaleX: 1,
                            scaleY: 1,
                            draggable: true,
                            preserveAspectRatio: true,
                        };

                        // Add as renderable object
                        addRenderableObject(imageElement);

                        // Wait a bit for image to render before adding to history and saving
                        setTimeout(() => {
                            // Add to history (this will trigger immediate save)
                            addHistoryEntry({
                                type: 'elementAdded',
                                description: `Imported image: ${file.name}`,
                                linesSnapshot: [...renderableObjects, imageElement]
                            });
                        }, 500); // Wait 500ms for image to load and render

                        // Show success toast
                        toast.success("Success", {
                            description: `Image "${file.name}" opened successfully`,
                            duration: 5000,
                        });
                    };
                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
            } else if (fileName.endsWith('.json')) {
                // Import JSON project files
                const text = await file.text();
                try {
                    const projectData = JSON.parse(text);
                    if (projectData.renderableObjects) {
                        setRenderableObjects(projectData.renderableObjects);
                        if (projectData.stageSize) {
                            setStageSize(projectData.stageSize);
                        }
                        
                        // Reset unsaved changes for imported project
                        setHasUnsavedChanges(false);
                        
                        addHistoryEntry({
                            type: 'elementAdded',
                            description: `Imported project: ${file.name}`,
                            linesSnapshot: projectData.renderableObjects
                        });

                        // Show success toast
                        toast.success("Success", {
                            description: `Project "${file.name}" opened successfully`,
                            duration: 5000,
                        });
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                     toast.error("Error", {
                        description: "Invalid JSON file format",
                        duration: 5000,
                      });
                }
            } else {
                toast.error("Error", {
                    description: "Unsupported file format. Please use PNG, JPG, or JSON files.",
                    duration: 5000,
                  });
            }
        } catch (error) {
            console.error('Error importing file:', error);
            toast.error("Error", {
                description: "Error importing file: " + error,
                duration: 5000,
              });
        }
    };

    const exportFile = async (format: 'png' | 'jpg' | 'pdf' | 'json') => {
        try {
            if (format === 'json') {
                // Export project data as JSON
                const projectData = {
                    version: '1.0',
                    timestamp: new Date().toISOString(),
                    stageSize,
                    renderableObjects,
                    settings: {
                        backgroundColor,
                        backgroundOpacity
                    }
                };

                const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const fileName = `project_${Date.now()}.json`;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                // Show success toast
                toast.success("Success", {
                    description: `Project saved as "${fileName}"`,
                    duration: 5000,
                });
            } else if (canvasExporter) {
                // Use canvas exporter for image formats
                await canvasExporter(format);
            } else {
                console.warn('Canvas exporter not registered');
                 toast.error("Error", {
                    description: "Canvas not ready for export. Please try again.",
                    duration: 5000,
                  });
            }
        } catch (error) {
            console.error('Error exporting file:', error);
             toast.error("Error", {
                description: 'Error exporting file: ' + error,
                duration: 5000,
              });
        }
    };

    const registerCanvasExporter = (exporter: (format: 'png' | 'jpg' | 'pdf' | 'json') => Promise<void>) => {
        setCanvasExporter(() => exporter);
    };

    // Auto-load Google Fonts when renderableObjects change (e.g., when loading a project)
    useEffect(() => {
        if (renderableObjects.length > 0) {
            loadProjectFonts(renderableObjects);
        }
    }, [renderableObjects]);

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
                setZoom: setZoomWithFlag,
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
                clearHistory,
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
                // Container Size
                containerSize,
                setContainerSize,
                // Stage Position (to be set by Canvas, used by HandOptions)
                stagePosition: stagePositionContext,
                setStagePosition: setStagePositionContext,
                lastDrawingEndTime,
                setLastDrawingEndTime,

                // Liquify tool
                liquifyBrushSize,
                setLiquifyBrushSize,
                liquifyStrength,
                setLiquifyStrength,
                liquifyMode,
                setLiquifyMode,
                liquifyTwirlDirection,
                setLiquifyTwirlDirection,
                isImageReadyForLiquify,
                setIsImageReadyForLiquify,

                // Blur tool
                blurBrushSize,
                setBlurBrushSize,
                blurStrength,
                setBlurStrength,

                // Brush transform mode
                isBrushTransformModeActive,
                setBrushTransformModeActive,
                selectedLineId,
                setSelectedLineId,

                isProgrammaticZoomRef,

                isApplyingCrop,
                setIsApplyingCrop,

                // File import/export functions
                importFile,
                exportFile,
                registerCanvasExporter,

                // State for storing the canvas exporter function
                canvasExporter,

                // Project saving state
                hasUnsavedChanges,
                setHasUnsavedChanges,
                registerProjectSaver,
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
