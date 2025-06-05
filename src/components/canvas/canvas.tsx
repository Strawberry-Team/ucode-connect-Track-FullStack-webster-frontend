import type React from "react";
import {useTool} from "@/context/tool-context";
import {useRef, useState, useEffect, useCallback} from "react";
import {Stage, Layer, Line as KonvaLine, Rect, Image as KonvaImage, Transformer} from "react-konva";
import Konva from "konva";
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import {
    createCheckerboardPattern,
} from "@/utils/canvas-utils.ts";
import {useDrawing, useElementsManagement, useCropping, useLiquify, useBlur} from "@/hooks";
import ScrollBar from "@/components/ui/scroll-bar";
import BrushCursor from "@/components/canvas/tools/brush-cursor";
import EraserCursor from "@/components/canvas/tools/eraser-cursor";
import ElementRenderer from "@/components/canvas/tools/element-renderer";
import CropTool from "@/components/canvas/tools/crop-tool";
import LiquifyCursor from "@/components/canvas/tools/liquify-cursor";
import BlurCursor from "@/components/canvas/tools/blur-cursor";

import {formatDimensionDisplay} from "@/utils/format-utils";
import type {LineData, ElementData, ShapeType} from "@/types/canvas";
import {type SnapLine as SnapLineType} from "@/hooks/use-snapping.ts";
import { useElementsManager } from "@/context/elements-manager-context";
import { useUser } from "@/context/user-context";
import { useProjectManager } from "@/hooks/use-project-manager";

export let resetLiquifyFunction: (() => void) | null = null;
export let resetBlurFunction: (() => void) | null = null;

export const setResetLiquifyFunction = (fn: () => void) => {
    resetLiquifyFunction = fn;
};

export const setResetBlurFunction = (fn: () => void) => {
    resetBlurFunction = fn;
};

const Canvas: React.FC = () => {
    const toolContext = useTool();
    const { loggedInUser } = useUser();
    const {
        activeTool,
        setActiveTool: setContextActiveTool,
        activeElement,
        isAddModeActive,
        currentAddToolType,
        setIsAddModeActive,
        setCurrentAddToolType,
        renderableObjects,
        setRenderableObjects,
        fontSize: defaultFontSize,
        fontFamily: defaultFontFamily,
        color,
        secondaryColor,
        brushSize,
        eraserSize,
        opacity,
        zoom,
        setZoom,
        brushMirrorMode,
        eraserMirrorMode,
        setIsCropping,
        cropRect,
        setCropRect,
        stageSize: contextStageSize,
        setStageSize: setContextStageSize,
        selectedAspectRatio,
        setSelectedAspectRatio,
        triggerApplyCrop,
        setIsCanvasManuallyResized,
        initialImage,
        setInitialImage,
        cursorPositionOnCanvas,
        setCursorPositionOnCanvas,
        setMiniMapDataURL,
        setVisibleCanvasRectOnMiniMap,
        registerStagePositionUpdater,
        registerRenderableObjectsRestorer,
        containerSize,
        setContainerSize,
        stagePosition,
        setStagePosition,
        liquifyBrushSize,
        liquifyStrength,
        liquifyMode,
        liquifyTwirlDirection,
        blurBrushSize,
        blurStrength,
        setIsImageReadyForLiquify,
        isBrushTransformModeActive,
        selectedLineId,
        setSelectedLineId,
        isProgrammaticZoomRef,
        isApplyingCrop,
        textColor,
        textColorOpacity,
        textBgColor,
        textBgOpacity,
        fontStyles,
        textCase,
        textAlignment,
        lineHeight,
        fillColor,
        fillColorOpacity,
        borderColor,
        borderColorOpacity,
        borderWidth,
        borderStyle,
        cornerRadius,
        registerCanvasExporter
    } = toolContext;

    const drawingManager = useDrawing({
        canvasWidth: contextStageSize?.width ?? 0,
        canvasHeight: contextStageSize?.height ?? 0
    });

    const elementsManager = useElementsManagement({
        color: textColor,
        secondaryColor: secondaryColor,
        opacity: opacity,
        fontSize: defaultFontSize,
        fontFamily: defaultFontFamily,
    });

    const isDragging = useRef(false);
    const lastMousePosition = useRef({x: 0, y: 0});
    const stageRef = useRef<Konva.Stage | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showBrushCursor, setShowBrushCursor] = useState(false);
    const [showEraserCursor, setShowEraserCursor] = useState(false);
    const [isHoveringInteractiveElement, setIsHoveringInteractiveElement] = useState(false);
    const zoomControlsRef = useRef<HTMLDivElement>(null);
    const horizontalScrollbarRef = useRef<HTMLDivElement>(null);
    const verticalScrollbarRef = useRef<HTMLDivElement>(null);
    const [showLiquifyCursor, setShowLiquifyCursor] = useState(false);
    const [showBlurCursor, setShowBlurCursor] = useState(false);
    const zoomStep = 20;
    const [miniMapDataURLState, setMiniMapDataURLState] = useState<string | null>(null);
    const isManuallyDragging = useRef(false);

    const [activeSnapLines, setActiveSnapLines] = useState<SnapLineType[]>([]);

    // Add states for drag-to-create functionality
    const [isCreatingElement, setIsCreatingElement] = useState(false);
    const [creationStartPoint, setCreationStartPoint] = useState<{x: number, y: number} | null>(null);
    const [previewElement, setPreviewElement] = useState<ElementData | null>(null);

    const croppingManager = useCropping({
        cropRect: cropRect,
        setCropRect: setCropRect,
        stageSize: contextStageSize,
        setStageSize: setContextStageSize,
        selectedAspectRatio: selectedAspectRatio,
        setSelectedAspectRatio: setSelectedAspectRatio,
        setIsCropping: setIsCropping,
        setIsCanvasManuallyResized: setIsCanvasManuallyResized,
        lines: renderableObjects.filter(obj => 'tool' in obj) as LineData[],
        setLines: (newLines) => {
            const elements = renderableObjects.filter(obj => !('tool' in obj)) as ElementData[];
            setRenderableObjects([...elements, ...newLines]);
        },
        elements: renderableObjects.filter(obj => !('tool' in obj)) as ElementData[],
        setElements: (newElements) => {
            const lines = renderableObjects.filter(obj => 'tool' in obj) as LineData[];
            setRenderableObjects([...lines, ...newElements]);
        },
        containerRef: containerRef as React.RefObject<HTMLDivElement | null>,
        zoom: zoom,
        setStagePosition
    });

    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [originalBackgroundImage, setOriginalBackgroundImage] = useState<HTMLImageElement | null>(null);
    const backgroundImageNodeRef = useRef<Konva.Image | null>(null);
    
    // State to store imported image dimensions and position
    const [backgroundImageParams, setBackgroundImageParams] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);

    const liquifyManager = useLiquify({
        stageRef,
        imageNodeRef: backgroundImageNodeRef,
        brushSize: liquifyBrushSize,
        strength: liquifyStrength,
        mode: liquifyMode,
        twirlDirection: liquifyTwirlDirection,
        containerRef,
        zoom,
        stagePosition,
    });

    const blurManager = useBlur({
        stageRef,
        imageNodeRef: backgroundImageNodeRef,
        brushSize: blurBrushSize,
        strength: blurStrength,
        containerRef,
        zoom,
        stagePosition,
    });

    const contentWidth = contextStageSize ? contextStageSize.width * (zoom / 100) : 0;
    const contentHeight = contextStageSize ? contextStageSize.height * (zoom / 100) : 0;

    // Centralized function to set cursor based on current tool and context
    const setCursorBasedOnTool = useCallback(() => {
        if (!containerRef.current) return;
        
        // HIGHEST PRIORITY: Hand tool should always show grab/grabbing cursor
        if (activeTool?.type === 'hand') {
            containerRef.current.style.cursor = isDragging.current ? "grabbing" : "grab";
            return;
        }
        
        // Don't change cursor if hovering over UI elements (except for hand tool)
        if (isHoveringInteractiveElement) {
            containerRef.current.style.cursor = 'default';
            return;
        }
        
        if (isAddModeActive && (activeTool?.type === 'shape' || activeTool?.type === 'text')) {
            containerRef.current.style.cursor = "crosshair";
        } else if (activeTool?.type === 'brush') {
            if (isBrushTransformModeActive) {
                containerRef.current.style.cursor = "default";
            } else {
                containerRef.current.style.cursor = "none";
            }
        } else if (activeTool?.type === 'eraser') {
            containerRef.current.style.cursor = "none";
        } else if (activeTool?.type === 'liquify') {
            containerRef.current.style.cursor = "none";
        } else if (activeTool?.type === 'blur') {
            containerRef.current.style.cursor = "none";
        } else if (activeTool?.type === 'text' || activeTool?.type === 'cursor' || activeTool?.type === 'image-transform') {
            containerRef.current.style.cursor = "default";
        } else {
            containerRef.current.style.cursor = "default";
        }
    }, [activeTool, isAddModeActive, isBrushTransformModeActive, isHoveringInteractiveElement, isDragging]);

    // Reset cursor when tool changes
    useEffect(() => {
        setCursorBasedOnTool();
    }, [activeTool, setCursorBasedOnTool]);

    // Global cursor reset on window focus/blur
    useEffect(() => {
        const handleWindowFocus = () => {
            // Reset cursor when window gains focus
            setTimeout(() => {
                setCursorBasedOnTool();
            }, 100);
        };

        const handleWindowBlur = () => {
            // Reset cursor when window loses focus
            if (containerRef.current) {
                containerRef.current.style.cursor = 'default';
            }
        };

        window.addEventListener('focus', handleWindowFocus);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            window.removeEventListener('focus', handleWindowFocus);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [setCursorBasedOnTool]);

    useProjectManager({
        loggedInUser,
        renderableObjects,
        contextStageSize,
        backgroundImage,
        stageRef
    });

    // Canvas export function
    const exportCanvas = useCallback(async (format: 'png' | 'jpg' | 'pdf' | 'json') => {
        if (!stageRef.current || !contextStageSize) {
            throw new Error('Canvas not ready for export');
        }

        const stage = stageRef.current;
        
        try {
            switch (format) {
                case 'png':
                    const pngDataURL = stage.toDataURL({ mimeType: 'image/png', quality: 1 });
                    const pngFileName = `project_${Date.now()}.png`;
                    downloadDataURL(pngDataURL, pngFileName);
                    toast.success("Success", {
                        description: `Project saved as "${pngFileName}"`,
                        duration: 5000,
                    });
                    break;
                    
                case 'jpg':
                    const jpgDataURL = stage.toDataURL({ mimeType: 'image/jpeg', quality: 0.9 });
                    const jpgFileName = `project_${Date.now()}.jpg`;
                    downloadDataURL(jpgDataURL, jpgFileName);
                    toast.success("Success", {
                        description: `Project saved as "${jpgFileName}"`,
                        duration: 5000,
                    });
                    break;
                    
                case 'pdf':
                    const pdfCanvas = stage.toCanvas();
                    const pdf = new jsPDF({
                        orientation: contextStageSize.width > contextStageSize.height ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [contextStageSize.width, contextStageSize.height]
                    });
                    
                    pdf.addImage(
                        pdfCanvas.toDataURL('image/png'),
                        'PNG',
                        0,
                        0,
                        contextStageSize.width,
                        contextStageSize.height
                    );
                    
                    const pdfFileName = `project_${Date.now()}.pdf`;
                    pdf.save(pdfFileName);
                    toast.success("Success", {
                        description: `Project saved as "${pdfFileName}"`,
                        duration: 5000,
                    });
                    break;
                    
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('Error exporting canvas:', error);
            throw error;
        }
    }, [contextStageSize]);

    // Helper function to download data URL
    const downloadDataURL = (dataURL: string, filename: string) => {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Register the export function
    useEffect(() => {
        registerCanvasExporter(exportCanvas);
    }, [registerCanvasExporter, exportCanvas]);

    useEffect(() => {
        const checkAndUpdateImageStatus = () => {
            const imageNode = backgroundImageNodeRef.current;
            setIsImageReadyForLiquify(!!(imageNode && imageNode.image()));
        };

        checkAndUpdateImageStatus();

        const originalLiquifyReset = liquifyManager.resetLiquify;
        const wrappedLiquifyReset = () => {
            originalLiquifyReset();
            if (backgroundImageNodeRef.current && originalBackgroundImage) {
                backgroundImageNodeRef.current.image(originalBackgroundImage);
                backgroundImageNodeRef.current.getLayer()?.batchDraw();
            }
            checkAndUpdateImageStatus();
        };
        setResetLiquifyFunction(wrappedLiquifyReset);

        const originalBlurReset = blurManager.resetBlur;
        const wrappedBlurReset = () => {
            originalBlurReset();
            if (backgroundImageNodeRef.current && originalBackgroundImage) {
                backgroundImageNodeRef.current.image(originalBackgroundImage);
                backgroundImageNodeRef.current.getLayer()?.batchDraw();
            }
            checkAndUpdateImageStatus();
        };
        setResetBlurFunction(wrappedBlurReset);

        return () => {
            setResetLiquifyFunction(() => {
            });
            setResetBlurFunction(() => {
            });
        };
    }, [liquifyManager.resetLiquify, blurManager.resetBlur, setIsImageReadyForLiquify, originalBackgroundImage]);

    useEffect(() => {
        const imageNode = backgroundImageNodeRef.current;
        if (imageNode) {
            const handleImageChange = () => {
                setIsImageReadyForLiquify(!!imageNode.image());
            };
            imageNode.on('imageChange', handleImageChange);
            handleImageChange();
            return () => {
                if (imageNode.isListening()) {
                    imageNode.off('imageChange', handleImageChange);
                }
            };
        } else {
            setIsImageReadyForLiquify(false);
        }
    }, [backgroundImage, setIsImageReadyForLiquify]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                elementsManager.removeSelectedElement();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [elementsManager]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setContainerSize({ width, height });
            }
        });

        resizeObserver.observe(container);

        // Initial size update
        setContainerSize({ width: container.offsetWidth, height: container.offsetHeight });

        return () => {
            resizeObserver.unobserve(container);
            resizeObserver.disconnect();
        };
    }, [setContainerSize]);

    useEffect(() => {
        if (isProgrammaticZoomRef.current) {
            return;
        }
        
        if (isApplyingCrop) {
            return;
        }
        
        if (contextStageSize && containerRef.current && containerSize && !isManuallyDragging.current) {
            const scaleValue = zoom / 100;

            const scaledContentWidth = contextStageSize.width * scaleValue;
            const scaledContentHeight = contextStageSize.height * scaleValue;

            let newX = stagePosition.x;
            let newY = stagePosition.y;

            const currentContainerW = containerSize.width;
            const currentContainerH = containerSize.height;

            if (scaledContentWidth <= currentContainerW) {
                newX = (currentContainerW - scaledContentWidth) / 2;
            } else {
                newX = Math.max(currentContainerW - scaledContentWidth, Math.min(0, stagePosition.x));
            }

            if (scaledContentHeight <= currentContainerH) {
                newY = (currentContainerH - scaledContentHeight) / 2;
            } else {
                newY = Math.max(currentContainerH - scaledContentHeight, Math.min(0, stagePosition.y));
            }

            if (newX !== stagePosition.x || newY !== stagePosition.y) {
                setStagePosition({x: newX, y: newY});
            }
        }
    }, [contextStageSize, containerSize, zoom, stagePosition, setStagePosition, isProgrammaticZoomRef, isApplyingCrop]);

    const handleScroll = (direction: "horizontal" | "vertical", newPosition: number) => {
        const currentX = stagePosition.x;
        const currentY = stagePosition.y;
        setStagePosition({
            x: direction === "horizontal" ? -newPosition : currentX,
            y: direction === "vertical" ? -newPosition : currentY
        });
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (!containerRef.current || !stageRef.current || !contextStageSize || !containerSize) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const currentScale = zoom / 100;
        const scaleBy = 1.1;
        const newScaleDirection = e.deltaY < 0 ? currentScale * scaleBy : currentScale / scaleBy;
        const boundedScale = Math.min(Math.max(newScaleDirection, 0.1), 5);
        const newZoom = Math.round(boundedScale * 100);
        if (newZoom === zoom) return;
        const {width: currentContainerWidth, height: currentContainerHeight} = containerSize;
        const newContentWidth = contextStageSize.width * boundedScale;
        const newContentHeight = contextStageSize.height * boundedScale;
        const scrollbarsWillBeVisible = newContentWidth > currentContainerWidth || newContentHeight > currentContainerHeight;
        let newPosition;
        if (scrollbarsWillBeVisible) {
            const mouseXInContainer = e.clientX - containerRect.left;
            const mouseYInContainer = e.clientY - containerRect.top;
            const canvasPointBefore = {
                x: (mouseXInContainer - stagePosition.x) / currentScale,
                y: (mouseYInContainer - stagePosition.y) / currentScale,
            };
            newPosition = {
                x: mouseXInContainer - canvasPointBefore.x * boundedScale,
                y: mouseYInContainer - canvasPointBefore.y * boundedScale,
            };
        } else {
            newPosition = {
                x: (currentContainerWidth - newContentWidth) / 2,
                y: (currentContainerHeight - newContentHeight) / 2,
            };
        }
        setZoom(newZoom);
        setStagePosition(newPosition);
    };

    const handleDoubleClick = () => {
        const newZoom = 100;
        setZoom(newZoom, true);

        if (!containerRef.current || !contextStageSize || !containerSize) return;

        const containerWidth = containerSize.width;
        const containerHeight = containerSize.height;
        const scaleValue = newZoom / 100;
        const scaledContentWidth = contextStageSize.width * scaleValue;
        const scaledContentHeight = contextStageSize.height * scaleValue;

        let newX, newY;

        if (scaledContentWidth <= containerWidth) {
            newX = (containerWidth - scaledContentWidth) / 2;
        } else {
            newX = 0;
        }

        if (scaledContentHeight <= containerHeight) {
            newY = (containerHeight - scaledContentHeight) / 2;
        } else {
            newY = 0;
        }

        setStagePosition({x: newX, y: newY});
    };

    const handleZoomButtonClick = (zoomChange: number) => {
        if (!containerRef.current || !stageRef.current || !contextStageSize || !containerSize) return;

        const currentScale = zoom / 100;
        const containerCenterX = containerSize.width / 2;
        const containerCenterY = containerSize.height / 2;

        const canvasPointBefore = {
            x: (containerCenterX - stagePosition.x) / currentScale,
            y: (containerCenterY - stagePosition.y) / currentScale,
        };

        const newZoom = Math.min(Math.max(zoom + zoomChange, 10), 500);
        if (newZoom === zoom) return;
        const newScale = newZoom / 100;

        const newPosition = {
            x: containerCenterX - canvasPointBefore.x * newScale,
            y: containerCenterY - canvasPointBefore.y * newScale,
        };

        setZoom(newZoom);
        setStagePosition(newPosition);
    };

    const handleZoomInClick = () => handleZoomButtonClick(zoomStep);
    const handleZoomOutClick = () => handleZoomButtonClick(-zoomStep);

    // Handlers for the outer div (container)
    const handleMouseMoveOnContainer = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        
        // Check if mouse is over UI elements
        const isOverZoomCtrl = zoomControlsRef.current && zoomControlsRef.current.contains(e.target as Node);
        const isOverHorizontalScroll = horizontalScrollbarRef.current && horizontalScrollbarRef.current.contains(e.target as Node);
        const isOverVerticalScroll = verticalScrollbarRef.current && verticalScrollbarRef.current.contains(e.target as Node);
        if (isOverZoomCtrl || isOverHorizontalScroll || isOverVerticalScroll) {
            if (!isHoveringInteractiveElement) setIsHoveringInteractiveElement(true);
            
            // Hand tool should always show grab cursor, even over UI elements
            if (activeTool?.type === 'hand') {
                if (containerRef.current) containerRef.current.style.cursor = isDragging.current ? "grabbing" : "grab";
            } else {
                if (containerRef.current) containerRef.current.style.cursor = 'default';
            }
            
            setShowBrushCursor(false);
            setShowEraserCursor(false);
            setShowLiquifyCursor(false);
            setShowBlurCursor(false);
            return;
        }
        if (isHoveringInteractiveElement) setIsHoveringInteractiveElement(false);
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const currentScale = zoom / 100;
        const mouseX = (e.clientX - containerRect.left - stagePosition.x) / currentScale;
        const mouseY = (e.clientY - containerRect.top - stagePosition.y) / currentScale;
        setCursorPositionOnCanvas({x: mouseX, y: mouseY});

        // PRIORITY 1: Hand tool always gets grab/grabbing cursor
        if (activeTool?.type === 'hand') {
            if (containerRef.current) containerRef.current.style.cursor = isDragging.current ? "grabbing" : "grab";
            setShowBrushCursor(false);
            setShowEraserCursor(false);
            setShowLiquifyCursor(false);
            setShowBlurCursor(false);
            return;
        }

        // PRIORITY 2: Element creation mode (добавление элементов)
        if (isAddModeActive && (activeTool?.type === 'shape' || activeTool?.type === 'text')) {
            // Crosshair cursor for element creation mode
            if (containerRef.current) containerRef.current.style.cursor = "crosshair";
            setShowBrushCursor(false);
            setShowEraserCursor(false);
            setShowLiquifyCursor(false);
            setShowBlurCursor(false);
        }
        // PRIORITY 3: Specific tool cursors (but not when hovering over interactive elements)
        else if (activeTool?.type === 'brush') {
            if (isBrushTransformModeActive) {
                if (containerRef.current) containerRef.current.style.cursor = "default";
                setShowBrushCursor(false);
            } else if (!isHoveringInteractiveElement) {
                // Show brush cursor only when not hovering over interactive elements
                if (containerRef.current) containerRef.current.style.cursor = "none";
                setShowBrushCursor(true);
            } else {
                // When hovering over interactive elements, hide brush cursor but keep 'none' cursor
                if (containerRef.current) containerRef.current.style.cursor = "none";
                setShowBrushCursor(false);
            }
            setShowEraserCursor(false);
            setShowLiquifyCursor(false);
            setShowBlurCursor(false);
        } else if (activeTool?.type === 'eraser') {
            if (!isHoveringInteractiveElement) {
                if (containerRef.current) containerRef.current.style.cursor = "none";
                setShowEraserCursor(true);
            } else {
                if (containerRef.current) containerRef.current.style.cursor = "none";
                setShowEraserCursor(false);
            }
            setShowBrushCursor(false);
            setShowLiquifyCursor(false);
            setShowBlurCursor(false);
        } else if (activeTool?.type === 'liquify') {
            if (!isHoveringInteractiveElement) {
                if (containerRef.current) containerRef.current.style.cursor = "none";
                setShowLiquifyCursor(true);
            } else {
                if (containerRef.current) containerRef.current.style.cursor = "none";
                setShowLiquifyCursor(false);
            }
            setShowBrushCursor(false);
            setShowEraserCursor(false);
            setShowBlurCursor(false);
        } else if (activeTool?.type === 'blur') {
            if (!isHoveringInteractiveElement) {
                if (containerRef.current) containerRef.current.style.cursor = "none";
                setShowBlurCursor(true);
            } else {
                if (containerRef.current) containerRef.current.style.cursor = "none";
                setShowBlurCursor(false);
            }
            setShowBrushCursor(false);
            setShowEraserCursor(false);
            setShowLiquifyCursor(false);
        } else {
            // For cursor and text tools, and default case - use centralized function
            setCursorBasedOnTool();
            setShowBrushCursor(false);
            setShowEraserCursor(false);
            setShowLiquifyCursor(false);
            setShowBlurCursor(false);
        }
        
        if (isDragging.current) {
            if ((e.buttons === 4 && activeTool?.type !== 'brush' && activeTool?.type !== 'eraser') || 
                (e.buttons === 1 && activeTool?.type === 'hand')) {
                isManuallyDragging.current = true;
                const dx = e.clientX - lastMousePosition.current.x;
                const dy = e.clientY - lastMousePosition.current.y;
                
                const newX = stagePosition.x + dx;
                const newY = stagePosition.y + dy;
                
                setStagePosition({ x: newX, y: newY });
            } else if ((activeTool?.type === 'brush' || activeTool?.type === 'eraser') &&
                (e.buttons === 1 || e.buttons === 2) &&
                drawingManager.getIsDrawing()) {
                drawingManager.continueDrawing({x: mouseX, y: mouseY});
            }
        }
        lastMousePosition.current = {x: e.clientX, y: e.clientY};
    };

    const handleMouseLeave = () => {
        // Force reset cursor to default when leaving canvas area, unless Hand tool is active
        if (containerRef.current) {
            if (activeTool?.type === 'hand') {
                containerRef.current.style.cursor = 'grab';
            } else {
                containerRef.current.style.cursor = 'default';
            }
        }
        
        if (drawingManager.getIsDrawing()) drawingManager.endDrawing();
        if (liquifyManager.getIsLiquifying()) liquifyManager.endLiquify();
        if (blurManager.getIsBlurring()) blurManager.endBlurring();
        
        // Reset element creation state
        if (isCreatingElement) {
            setIsCreatingElement(false);
            setCreationStartPoint(null);
            setPreviewElement(null);
        }
        
        setShowBrushCursor(false);
        setShowEraserCursor(false);
        setShowLiquifyCursor(false);
        setShowBlurCursor(false);
        setCursorPositionOnCanvas(null);
        
        if (isDragging.current || isManuallyDragging.current) {
            applyPositionConstraints();
        }
        isDragging.current = false;
        isManuallyDragging.current = false;
        setIsHoveringInteractiveElement(false);
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!containerRef.current || !stageRef.current) return;
        const evt = e.evt;
        const stage = stageRef.current;
        const pointerPosition = stage.getPointerPosition();

        if (!pointerPosition) return;

        if (isAddModeActive && currentAddToolType && activeTool) {
            let creationType: ShapeType | "text" | "custom-image" | null = null;

            if (activeTool.type === "text" && currentAddToolType === "text") {
                creationType = "text";
            } else if (activeTool.type === "shape") {
                if (currentAddToolType !== "brush" && currentAddToolType !== "eraser" && currentAddToolType !== "text") {
                    creationType = currentAddToolType as ShapeType | "custom-image";
                }
            }

            if (creationType) {
                // Start creating element by dragging instead of immediate creation
                setIsCreatingElement(true);
                setCreationStartPoint(pointerPosition);
                isDragging.current = true;
                
                // Create preview element
                const previewId = `preview-${Date.now()}`;
                let minSize = 20;
                
                let previewElementData: ElementData;
                if (creationType === "text") {
                    previewElementData = {
                        id: previewId,
                        type: "text",
                        x: pointerPosition.x,
                        y: pointerPosition.y,
                        width: minSize,
                        height: minSize,
                        text: "Type text here...",
                        color: textColor || color,
                        textColorOpacity: textColorOpacity || 100,
                        fontSize: defaultFontSize,
                        fontFamily: defaultFontFamily,
                        fontStyles: fontStyles || { bold: false, italic: false, underline: false, strikethrough: false },
                        textCase: textCase || "none",
                        textAlignment: textAlignment || "left",
                        lineHeight: lineHeight || 1,
                        backgroundColor: textBgColor || "transparent",
                        backgroundOpacity: textBgOpacity || 0,
                        borderColor: "#000000",
                        borderWidth: 0,
                        borderStyle: "hidden",
                        opacity: 100,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        draggable: true,
                        preserveAspectRatio: true,
                    };
                } else if (creationType === "custom-image") {
                    const imageElement = activeElement as ElementData & {
                        src?: string,
                        width?: number,
                        height?: number
                    };
                    previewElementData = {
                        id: previewId,
                        type: "custom-image",
                        x: pointerPosition.x,
                        y: pointerPosition.y,
                        width: minSize,
                        height: minSize,
                        src: imageElement?.src,
                        borderColor: borderColor || "#000000",
                        borderColorOpacity: borderColorOpacity || 100,
                        borderWidth: 0,
                        borderStyle: "hidden",
                        color: color,
                        opacity: 100,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        draggable: true,
                        preserveAspectRatio: true,
                    };
                } else {
                    // Shape elements
                    const shapeFillColor = fillColor === 'transparent' ? undefined : (fillColor || "#ffffff");
                    const shapeFillOpacity = fillColorOpacity || 100;
                    
                    previewElementData = {
                        id: previewId,
                        type: creationType as ShapeType,
                        x: pointerPosition.x,
                        y: pointerPosition.y,
                        width: minSize,
                        height: minSize,
                        color: borderColor || "#000000",
                        fillColor: shapeFillColor,
                        fillColorOpacity: shapeFillOpacity,
                        borderColor: borderColor || "#000000",
                        borderWidth: borderWidth || 2,
                        borderStyle: borderStyle || "solid",
                        borderColorOpacity: borderColorOpacity || 100,
                        cornerRadius: creationType === "rounded-rectangle" ? (cornerRadius || 0) : undefined,
                        opacity: 100,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        draggable: true,
                        preserveAspectRatio: true,
                    };
                }
                
                setPreviewElement(previewElementData);
                return;
            }
        }

        if (activeTool?.type === 'brush' || activeTool?.type === 'eraser') {
            if ((activeTool.type === 'brush' && !isBrushTransformModeActive) || activeTool.type === 'eraser') {
                isDragging.current = true;
                const isRightClick = evt.button === 2;
                if (activeTool?.type === 'brush') {
                    drawingManager.startDrawing('brush', pointerPosition, isRightClick);
                } else if (activeTool?.type === 'eraser') {
                    drawingManager.startDrawing('eraser', pointerPosition);
                }
            }
            return;
        }

        if (activeTool?.type === 'liquify') {
            if (evt.button === 0 && backgroundImageNodeRef.current?.image()) liquifyManager.startLiquify(e);
            else if (evt.button === 0) console.warn("Liquify: No image");
        }

        if (activeTool?.type === 'blur') {
            if (evt.button === 0 && backgroundImageNodeRef.current?.image()) blurManager.startBlurring(e);
            else if (evt.button === 0) console.warn("Blur: No image");
        }

        if (activeTool?.type === 'liquify' || activeTool?.type === 'blur') {
            if (evt.button === 0) evt.preventDefault();
        }
        
        if (activeTool?.type === 'hand' && evt.button === 0) {
            isDragging.current = true;
            isManuallyDragging.current = true;
            if (containerRef.current) containerRef.current.style.cursor = "grabbing";
            return;
        }
        
        const target = e.target;
        const clickedOnStageBackground = target === stageRef.current || target.name() === "background";

        if (clickedOnStageBackground) {
            // Only deselect elements when using appropriate tools
            if (elementsManager.selectedElementId && activeTool) {
                const shouldDeselect = 
                    activeTool.type === "shape" || 
                    activeTool.type === "text" || 
                    activeTool.type === "cursor" || 
                    activeTool.type === "image-transform";
                
                if (shouldDeselect) {
                    elementsManager.setSelectedElementId(null);
                    // Use centralized cursor function when deselecting element
                    setCursorBasedOnTool();
                }
            }
            if (evt.button === 1) {
                isDragging.current = true;
                isManuallyDragging.current = true;
                // Middle mouse button always shows grabbing cursor regardless of active tool
                if (containerRef.current) containerRef.current.style.cursor = "grabbing";
            }
            return;
        }

        if (evt.button === 1) {
            isDragging.current = true;
            isManuallyDragging.current = true;
            // Middle mouse button always shows grabbing cursor regardless of active tool
            if (containerRef.current) containerRef.current.style.cursor = "grabbing";
        }
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent> | React.MouseEvent<HTMLDivElement>) => {
        if ('evt' in e) {
            const stage = stageRef.current;
            const position = stage?.getPointerPosition();
            if (!position) return;

            // Handle element creation dragging
            if (isCreatingElement && creationStartPoint && previewElement) {
                const startX = Math.min(creationStartPoint.x, position.x);
                const startY = Math.min(creationStartPoint.y, position.y);
                const endX = Math.max(creationStartPoint.x, position.x);
                const endY = Math.max(creationStartPoint.y, position.y);
                
                let newWidth = Math.max(20, endX - startX); // Minimum 20px
                let newHeight = Math.max(20, endY - startY); // Minimum 20px
                
                if (previewElement.type === 'square') {
                    const size = Math.max(newWidth, newHeight);
                    newWidth = size;
                    newHeight = size;
                }

                const updatedPreview: ElementData = {
                    ...previewElement,
                    x: startX,
                    y: startY,
                    width: newWidth,
                    height: newHeight
                };
                
                setPreviewElement(updatedPreview);
                return;
            }

            if (position && isDragging.current && drawingManager.getIsDrawing()) {
                drawingManager.continueDrawing(position);
            }

            if (activeTool?.type === 'liquify' && liquifyManager.getIsLiquifying() && backgroundImageNodeRef.current?.image()) {
                setCursorPositionOnCanvas({x: position.x, y: position.y});
                liquifyManager.processLiquify(e);
            }
            if (activeTool?.type === 'blur' && blurManager.getIsBlurring() && backgroundImageNodeRef.current?.image()) {
                setCursorPositionOnCanvas({x: position.x, y: position.y});
                blurManager.processBlurring(e);
            }
        }
    };

    const handleMouseUp = () => {
        // Element creation
        if (isCreatingElement && creationStartPoint && previewElement && (activeTool?.type === 'shape' || activeTool?.type === 'text')) {
            const creationType = currentAddToolType;
            if (creationType && (creationType !== 'brush' && creationType !== 'eraser')) {
                const settings: Partial<ElementData> = {
                    width: previewElement.width,
                    height: previewElement.height,
                };

                if (creationType === "text") {
                    settings.text = previewElement.text || "Type text here...";
                }
                
                elementsManager.addElement(
                    creationType, 
                    { x: previewElement.x, y: previewElement.y },
                    creationType === "text" ? previewElement.text : undefined,
                    settings
                );
            }
            
            // Reset creation state
            setIsCreatingElement(false);
            setCreationStartPoint(null);
            setPreviewElement(null);
            setIsAddModeActive(false);
            setCurrentAddToolType(null);
            isDragging.current = false;
            
            // Reset cursor after element creation
            setCursorBasedOnTool();
            return;
        }

        if (drawingManager.getIsDrawing()) {
            drawingManager.endDrawing();
        }
        if (liquifyManager.getIsLiquifying()) {
            liquifyManager.endLiquify();
        }
        if (blurManager.getIsBlurring()) {
            blurManager.endBlurring();
        }

        if (isDragging.current) {
            isDragging.current = false;
            if (activeTool?.type === 'hand' && containerRef.current) {
                containerRef.current.style.cursor = "grab";
            }
            
            if (isManuallyDragging.current) {
                setTimeout(() => {
                    applyPositionConstraints();
                    isManuallyDragging.current = false;
                    // Use centralized cursor function to set appropriate cursor
                    setCursorBasedOnTool();
                }, 50);
            } else {
                // For element dragging, immediately set appropriate cursor
                setTimeout(() => {
                    setCursorBasedOnTool();
                }, 10);
            }
        } else {
            // Always ensure cursor is set correctly even if not dragging
            setTimeout(() => {
                setCursorBasedOnTool();
            }, 10);
        }
    };

    const applyPositionConstraints = () => {
        if (!contextStageSize || !containerSize) return;
        
        const scaleValue = zoom / 100;
        const scaledContentWidth = contextStageSize.width * scaleValue;
        const scaledContentHeight = contextStageSize.height * scaleValue;
        const containerWidth = containerSize.width;
        const containerHeight = containerSize.height;

        let newX = stagePosition.x;
        let newY = stagePosition.y;

        if (scaledContentWidth > containerWidth) {
            newX = Math.max(containerWidth - scaledContentWidth, Math.min(0, stagePosition.x));
        } else {
            newX = (containerWidth - scaledContentWidth) / 2;
        }

        if (scaledContentHeight > containerHeight) {
            newY = Math.max(containerHeight - scaledContentHeight, Math.min(0, stagePosition.y));
        } else {
            newY = (containerHeight - scaledContentHeight) / 2;
        }

        if (newX !== stagePosition.x || newY !== stagePosition.y) {
            setStagePosition({x: newX, y: newY});
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        return false;
    };

    const currentDisplayScale = zoom / 100;

    useEffect(() => {
        if (triggerApplyCrop) {
            croppingManager.applyCrop();
        }
    }, [triggerApplyCrop, croppingManager]);

    const handleSetStagePositionFromMiniMap = useCallback((coords: { x: number, y: number }, type: 'center' | 'drag') => {
        if (!stageRef.current || !contextStageSize || !containerRef.current) return;
        const currentScale = zoom / 100;
        const { width: stageWidth, height: stageHeight } = contextStageSize;
        const { clientWidth: containerWidth, clientHeight: containerHeight } = containerRef.current;
        let newStageX = stagePosition.x;
        let newStageY = stagePosition.y;
        if (type === 'center') {
            const targetCanvasX = coords.x * stageWidth;
            const targetCanvasY = coords.y * stageHeight;
            newStageX = containerWidth / 2 - targetCanvasX * currentScale;
            newStageY = containerHeight / 2 - targetCanvasY * currentScale;
        } else if (type === 'drag') {
            newStageX = -coords.x * stageWidth * currentScale;
            newStageY = -coords.y * stageHeight * currentScale;
        }
        const scaledContentWidth = stageWidth * currentScale;
        const scaledContentHeight = stageHeight * currentScale;
        if (scaledContentWidth > containerWidth) {
            newStageX = Math.max(containerWidth - scaledContentWidth, Math.min(0, newStageX));
        } else {
            newStageX = (containerWidth - scaledContentWidth) / 2;
        }
        if (scaledContentHeight > containerHeight) {
            newStageY = Math.max(containerHeight - scaledContentHeight, Math.min(0, newStageY));
        } else {
            newStageY = (containerHeight - scaledContentHeight) / 2;
        }
        setStagePosition({ x: newStageX, y: newStageY });
    }, [contextStageSize, zoom, stagePosition, containerRef, setStagePosition]);

    useEffect(() => {
        if (registerStagePositionUpdater) {
            registerStagePositionUpdater(handleSetStagePositionFromMiniMap);
        }
    }, [registerStagePositionUpdater, handleSetStagePositionFromMiniMap]);

    useEffect(() => {
        if (registerRenderableObjectsRestorer) {
            registerRenderableObjectsRestorer(setRenderableObjects);
        }
    }, [registerRenderableObjectsRestorer, setRenderableObjects]);

    useEffect(() => {
        if (stageRef.current && contextStageSize && containerRef.current) {
            try {
                const canvasWidth = contextStageSize.width;
                const canvasHeight = contextStageSize.height;
                const viewPortWidth = containerRef.current.clientWidth;
                const viewPortHeight = containerRef.current.clientHeight;
                const visibleXOnCanvas = -stagePosition.x / currentDisplayScale;
                const visibleYOnCanvas = -stagePosition.y / currentDisplayScale;
                const visibleWidthOnCanvas = viewPortWidth / currentDisplayScale;
                const visibleHeightOnCanvas = viewPortHeight / currentDisplayScale;
                const relX = Math.max(0, Math.min(1, visibleXOnCanvas / canvasWidth));
                const relY = Math.max(0, Math.min(1, visibleYOnCanvas / canvasHeight));
                const relWidth = Math.max(0, Math.min(1, visibleWidthOnCanvas / canvasWidth));
                const relHeight = Math.max(0, Math.min(1, visibleHeightOnCanvas / canvasHeight));
                setVisibleCanvasRectOnMiniMap({
                    x: relX, y: relY, width: relWidth, height: relHeight,
                });
            } catch (error) {
                console.warn('Error updating minimap viewport position:', error);
                setVisibleCanvasRectOnMiniMap(null);
            }
        } else {
            setVisibleCanvasRectOnMiniMap(null);
        }
    }, [
        zoom,
        stagePosition,
        contextStageSize,
        containerSize,
        setVisibleCanvasRectOnMiniMap,
        currentDisplayScale
    ]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (stageRef.current && contextStageSize && containerRef.current) {
                try {
                    const canvasArea = contextStageSize.width * contextStageSize.height;
                    let pixelRatio = 0.3;
                    
                    if (canvasArea > 2000000) {
                        pixelRatio = 0.2;
                    } else if (canvasArea > 5000000) {
                        pixelRatio = 0.15;
                    } else if (canvasArea < 500000) {
                        pixelRatio = 0.4;
                    }
                    
                    const dataURL = stageRef.current.toDataURL({ 
                        pixelRatio: pixelRatio,
                        quality: 0.85,
                        mimeType: 'image/png'
                    });
                    setMiniMapDataURL(dataURL);
                    setMiniMapDataURLState(dataURL);
                } catch (error) {
                    setMiniMapDataURL(null);
                    setMiniMapDataURLState(null);
                }
            } else {
                setMiniMapDataURL(null);
                setMiniMapDataURLState(null);
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [
        renderableObjects,
        backgroundImage,
        contextStageSize,
        setMiniMapDataURL
    ]);

    const trRef = useRef<Konva.Transformer>(null);
    const [selectedKonvaNode, setSelectedKonvaNode] = useState<Konva.Node | null>(null);

    useEffect(() => {
        if (selectedLineId && stageRef.current && isBrushTransformModeActive && activeTool?.type === 'brush') {
            const node = stageRef.current.findOne('.' + selectedLineId); // Konva selector by name/id
            if (node) {
                setSelectedKonvaNode(node);
            } else {
                setSelectedKonvaNode(null);
            }
        } else {
            setSelectedKonvaNode(null);
        }
    }, [selectedLineId, isBrushTransformModeActive, activeTool, renderableObjects]);

    useEffect(() => {
        if (selectedKonvaNode && trRef.current) {
            trRef.current.nodes([selectedKonvaNode]);
            trRef.current.getLayer()?.batchDraw();
            
            // Configuration similar to ElementRenderer's Transformer
            trRef.current.keepRatio(true); // Ensure aspect ratio is maintained
            trRef.current.rotationSnaps([0, 45, 90, 135, 180, 225, 270, 315]);
            trRef.current.rotationSnapTolerance(5); // Tolerance for rotation snapping
            trRef.current.rotateAnchorOffset(30); // Distance of rotation anchor from shape
            trRef.current.borderDash([3, 3]); // Dashed border for transformer
            trRef.current.anchorStroke('#0096FF'); // Anchor stroke color
            trRef.current.anchorFill('#FFFFFF'); // Anchor fill color
            trRef.current.anchorSize(8); // Size of anchors
            trRef.current.borderStroke('#0096FF'); // Transformer border color
            trRef.current.padding(2); // Padding around the node

            trRef.current.enabledAnchors([
                'top-left', 'top-center', 'top-right',
                'middle-left', 'middle-right',
                'bottom-left', 'bottom-center', 'bottom-right'
            ]);

            // Bound box function to enforce minimum size
            trRef.current.boundBoxFunc((oldBox, newBox) => {
                const minSize = 20;
                newBox.width = Math.max(minSize, newBox.width);
                newBox.height = Math.max(minSize, newBox.height);

                if (trRef.current?.keepRatio()) {
                    const aspectRatio = oldBox.width / oldBox.height;
                    if (Math.abs(newBox.width / newBox.height - aspectRatio) > 1e-2) { 
                        const widthChangedMore = Math.abs(newBox.width - oldBox.width) > Math.abs(newBox.height - oldBox.height);
                        if (widthChangedMore) {
                            newBox.height = newBox.width / aspectRatio;
                        } else {
                            newBox.width = newBox.height * aspectRatio;
                        }
                    }
                }
                return newBox;
            });

        } else if (trRef.current) {
            trRef.current.nodes([]); // Clear nodes if none selected
            trRef.current.getLayer()?.batchDraw();
        }
    }, [selectedKonvaNode]);

    const elementsManagerHook = useElementsManager();

    return (
        <div
            className="w-full h-full bg-[#171719FF] overflow-hidden relative"
            ref={containerRef}
            onMouseMove={handleMouseMoveOnContainer}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseDown={(e) => (activeTool?.type === "cursor" || activeTool?.type === "hand") && handleMouseDown({evt: e} as any)}
            onContextMenu={handleContextMenu}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
        >
            <div
                className="relative"
                style={{
                    transform: `scale(${currentDisplayScale})`,
                    transformOrigin: "0 0",
                    width: contextStageSize?.width ?? 0,
                    height: contextStageSize?.height ?? 0,
                    position: "absolute",
                    left: stagePosition.x,
                    top: stagePosition.y,
                }}
            >
                {((activeTool?.type === 'brush' && brushMirrorMode !== 'None') ||
                    (activeTool?.type === 'eraser' && eraserMirrorMode !== 'None')) && (
                    <div
                        className="absolute top-0 left-0 pointer-events-none"
                        style={{
                            width: contextStageSize?.width ?? 0,
                            height: contextStageSize?.height ?? 0,
                            zIndex: 500
                        }}
                    >
                        {((activeTool?.type === 'brush' && (brushMirrorMode === 'Vertical' || brushMirrorMode === 'Four-way')) ||
                            (activeTool?.type === 'eraser' && (eraserMirrorMode === 'Vertical' || eraserMirrorMode === 'Four-way'))) && (
                            <div
                                className="absolute top-0 bottom-0 border-dashed border-l border-white/40"
                                style={{
                                    left: (contextStageSize?.width ?? 0) / 2,
                                    height: "100%",
                                }}
                            />
                        )}
                        {((activeTool?.type === 'brush' && (brushMirrorMode === 'Horizontal' || brushMirrorMode === 'Four-way')) ||
                            (activeTool?.type === 'eraser' && (eraserMirrorMode === 'Horizontal' || eraserMirrorMode === 'Four-way'))) && (
                            <div
                                className="absolute left-0 right-0 border-dashed border-t border-white/40"
                                style={{
                                    top: (contextStageSize?.height ?? 0) / 2,
                                    width: "100%",
                                }}
                            />
                        )}
                    </div>
                )}

                <BrushCursor
                    brushSize={brushSize}
                    color={color}
                    opacity={opacity}
                    isVisible={showBrushCursor}
                    position={cursorPositionOnCanvas}
                />
                <EraserCursor
                    size={eraserSize}
                    isVisible={showEraserCursor}
                    position={cursorPositionOnCanvas}
                />
                <LiquifyCursor isVisible={showLiquifyCursor} position={cursorPositionOnCanvas} />
                <BlurCursor isVisible={showBlurCursor} position={cursorPositionOnCanvas} />

                <Stage
                    width={contextStageSize?.width ?? 0}
                    height={contextStageSize?.height ?? 0}
                    onMouseDown={handleMouseDown}
                    onMousemove={handleMouseMove}
                    onMouseup={handleMouseUp}
                    ref={stageRef}
                >
                    <Layer>
                        <Rect
                            name="background"
                            x={0}
                            y={0}
                            width={contextStageSize?.width ?? 0}
                            height={contextStageSize?.height ?? 0}
                            fillPatternImage={createCheckerboardPattern(7, "#1D2023FF", "#2D2F34FF")}
                        />
                        {backgroundImage && contextStageSize && (
                            <KonvaImage
                                image={backgroundImage}
                                x={backgroundImageParams?.x || 0}
                                y={backgroundImageParams?.y || 0}
                                width={backgroundImageParams?.width || contextStageSize.width}
                                height={backgroundImageParams?.height || contextStageSize.height}
                                listening={false}
                                ref={backgroundImageNodeRef}
                            />
                        )}
                    </Layer>

                    <Layer perfectDrawEnabled={false}>
                        {renderableObjects
                            .filter(obj => 'tool' in obj)
                            .map((obj) => {
                                const line = obj as LineData;
                                return (
                                    <KonvaLine
                                        key={line.id}
                                        points={line.points}
                                        stroke={line.tool === "eraser" ? "#ffffff" : line.color}
                                        strokeWidth={line.strokeWidth}
                                        tension={0.5}
                                        lineCap="round"
                                        lineJoin="round"
                                        opacity={line.opacity}
                                        globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"}
                                        x={(line as any).x ?? 0}
                                        y={(line as any).y ?? 0}
                                        rotation={(line as any).rotation ?? 0}
                                        scaleX={(line as any).scaleX ?? 1}
                                        scaleY={(line as any).scaleY ?? 1}
                                        offsetX={(line as any).offsetX ?? 0}
                                        offsetY={(line as any).offsetY ?? 0}
                                        listening={isBrushTransformModeActive && activeTool?.type === 'brush'}
                                        name={line.id}
                                        draggable={isBrushTransformModeActive && activeTool?.type === 'brush' && !!(line as any).offsetX && !!(line as any).offsetY}
                                        onDragEnd={(e) => {
                                            if (isBrushTransformModeActive && activeTool?.type === 'brush') {
                                                // Ensure the line was prepared for transform (has offsetX/Y)
                                                if ((line as any).offsetX !== undefined && (line as any).offsetY !== undefined) {
                                                    drawingManager.updateLinePositionAndHistory(line.id, e.target.x(), e.target.y());
                                                }
                                            }
                                        }}
                                        onClick={(e) => {
                                            if (isBrushTransformModeActive && activeTool?.type === 'brush') {
                                                e.cancelBubble = true;
                                                if (!(line as any).offsetX && !(line as any).offsetY) {
                                                    drawingManager.prepareLineForTransform(line.id);
                                                }
                                                setSelectedLineId(line.id);
                                                const node = stageRef.current?.findOne('.' + line.id);
                                                if (node) setSelectedKonvaNode(node);
                                            }
                                        }}
                                        onTap={(e) => {
                                            if (isBrushTransformModeActive && activeTool?.type === 'brush') {
                                                e.cancelBubble = true;
                                                if (!(line as any).offsetX && !(line as any).offsetY) {
                                                    drawingManager.prepareLineForTransform(line.id);
                                                }
                                                setSelectedLineId(line.id);
                                                const node = stageRef.current?.findOne('.' + line.id);
                                                if (node) setSelectedKonvaNode(node);
                                            }
                                        }}
                                    />
                                );
                            })}

                        {selectedKonvaNode && isBrushTransformModeActive && activeTool?.type === 'brush' && (
                            <Transformer
                                ref={trRef}
                                onTransformEnd={() => {
                                    if (selectedKonvaNode && selectedLineId) {
                                        drawingManager.updateLineTransform(selectedLineId, {
                                            x: selectedKonvaNode.x(),
                                            y: selectedKonvaNode.y(),
                                            rotation: selectedKonvaNode.rotation(),
                                            scaleX: selectedKonvaNode.scaleX(),
                                            scaleY: selectedKonvaNode.scaleY(),
                                        });
                                    }
                                }}
                                anchorStroke="#0096FF"
                                anchorFill="#FFFFFF"
                                anchorSize={8}
                                borderStroke="#0096FF"
                                borderDash={[3, 3]}
                                rotateAnchorOffset={30}
                                padding={2}
                            />
                        )}
                    </Layer>

                    <Layer>
                        {renderableObjects
                            .filter(obj => !('tool' in obj))
                            .map((obj) => {
                                const element = obj as ElementData;
                                return (
                                    <ElementRenderer
                                        key={element.id}
                                        element={element}
                                        onDragEnd={(id, newX, newY) => elementsManager.handleDragEnd(id, newX, newY)}
                                        onClick={(id, KonvaE) => elementsManager.handleElementClick(id, KonvaE)}
                                        onTextEdit={(id, newText) => elementsManager.updateTextElement(id, newText)}
                                        onTransform={(id, attrs) => elementsManager.updateElement(id, attrs as Partial<ElementData>)}
                                        isSelected={element.id === elementsManager.selectedElementId}
                                        allElements={elementsManagerHook.getElementDataFromRenderables()}
                                        stageSize={contextStageSize ? { width: contextStageSize.width, height: contextStageSize.height } : undefined}
                                        setActiveSnapLines={setActiveSnapLines}
                                        onHoverInteractiveElement={setIsHoveringInteractiveElement}
                                    />
                                );
                            })}

                        {/* Render preview element during creation */}
                        {previewElement && (
                            <ElementRenderer
                                key={previewElement.id}
                                element={{...previewElement, opacity: 0.6}} // Make preview semi-transparent
                                isSelected={false}
                                allElements={[]}
                                stageSize={contextStageSize ? { width: contextStageSize.width, height: contextStageSize.height } : undefined}
                                setActiveSnapLines={() => {}} // No snapping for preview
                            />
                        )}

                        <CropTool
                            stageSize={contextStageSize}
                            scale={currentDisplayScale}
                            cropRectRef={croppingManager.cropRectRef as any}
                            transformerRef={croppingManager.transformerRef as any}
                            handleCropRectDragEnd={croppingManager.handleCropRectDragEnd}
                            handleCropRectTransformEnd={croppingManager.handleCropRectTransformEnd}
                        />

                        {activeSnapLines.map((line, i) => (
                            <KonvaLine
                                key={`snapline-${i}`}
                                points={line.points}
                                stroke="#6A5ACD"
                                strokeWidth={2}
                                dash={[7, 4]}
                                listening={false}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>
            <div
                ref={zoomControlsRef}
                className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md select-none flex items-center gap-2"
                style={{zIndex: 1000}}
            >
                <span>
                    {(contextStageSize ? formatDimensionDisplay(contextStageSize.width) : "0")} x {(contextStageSize ? formatDimensionDisplay(contextStageSize.height) : "0")} |
                    <button
                        onClick={handleZoomOutClick}
                        className="cursor-pointer px-1.5 ml-1 mr-1 hover:bg-white/20 rounded"
                        aria-label="Уменьшить масштаб"
                        tabIndex={0}
                    >
                        -
                    </button>
                    {zoom}%
                    <button
                        onClick={handleZoomInClick}
                        className="cursor-pointer px-1 ml-1 hover:bg-white/20 rounded"
                        aria-label="Увеличить масштаб"
                        tabIndex={0}
                    >
                        +
                    </button>
                </span>
            </div>
            <div ref={horizontalScrollbarRef}>
                <ScrollBar
                    orientation="horizontal"
                    containerSize={containerSize?.width ?? 0}
                    contentSize={contentWidth}
                    position={-stagePosition.x}
                    onScroll={(newPos) => handleScroll("horizontal", newPos)}
                />
            </div>
            <div ref={verticalScrollbarRef}>
                <ScrollBar
                    orientation="vertical"
                    containerSize={containerSize?.height ?? 0}
                    contentSize={contentHeight}
                    position={-stagePosition.y}
                    onScroll={(newPos) => handleScroll("vertical", newPos)}
                />
            </div>
        </div>
    );
};

export default Canvas;