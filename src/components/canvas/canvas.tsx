import type React from "react"
import { useTool } from "@/context/tool-context"
import { useRef, useState, useEffect, useCallback } from "react"
import { Stage, Layer, Line as KonvaLine, Rect, Image as KonvaImage, Transformer, Group } from "react-konva"
import type Konva from "konva"
import jsPDF from "jspdf"
import { toast } from "sonner"
import { createCheckerboardPattern } from "@/utils/canvas-utils.ts"
import { useDrawing, useElementsManagement, useCropping, useLiquify, useBlur } from "@/hooks"
import useHand from "@/hooks/use-hand"
import ScrollBar from "@/components/ui/scroll-bar"
import BrushCursor from "@/components/canvas/tools/brush-cursor"
import EraserCursor from "@/components/canvas/tools/eraser-cursor"
import ElementRenderer from "@/components/canvas/tools/element-renderer"
import CropTool from "@/components/canvas/tools/crop-tool"
import LiquifyCursor from "@/components/canvas/tools/liquify-cursor"
import BlurCursor from "@/components/canvas/tools/blur-cursor"

import { formatDimensionDisplay } from "@/utils/format-utils"
import type { LineData, ElementData, ShapeType } from "@/types/canvas"
import type { SnapLine as SnapLineType } from "@/hooks/use-snapping.ts"
import { useElementsManager } from "@/context/elements-manager-context"
import { useUser } from "@/context/user-context"
import { useProjectManager } from "@/hooks/use-project-manager"
import { addWatermark } from "@/utils/watermark"

export let resetLiquifyFunction: (() => void) | null = null
export let resetBlurFunction: (() => void) | null = null

export const setResetLiquifyFunction = (fn: () => void) => {
    resetLiquifyFunction = fn
}

export const setResetBlurFunction = (fn: () => void) => {
    resetBlurFunction = fn
}

const Canvas: React.FC = () => {
    const toolContext = useTool()
    const { loggedInUser } = useUser()
    const { hoveredElementId } = useElementsManager()
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
        selectedLiquifyImageId,
        selectedBlurImageId,
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
        registerCanvasExporter,
        registerStageRef,
    } = toolContext

    const drawingManager = useDrawing({
        canvasWidth: contextStageSize?.width ?? 0,
        canvasHeight: contextStageSize?.height ?? 0,
    })

    const elementsManager = useElementsManagement({
        color: textColor,
        secondaryColor: secondaryColor,
        opacity: opacity,
        fontSize: defaultFontSize,
        fontFamily: defaultFontFamily,
    })

    const isDragging = useRef(false)
    const lastMousePosition = useRef({ x: 0, y: 0 })
    const stageRef = useRef<Konva.Stage | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [showBrushCursor, setShowBrushCursor] = useState(false)
    const [showEraserCursor, setShowEraserCursor] = useState(false)
    const [isHoveringInteractiveElement, setIsHoveringInteractiveElement] = useState(false)
    const zoomControlsRef = useRef<HTMLDivElement>(null)
    const horizontalScrollbarRef = useRef<HTMLDivElement>(null)
    const verticalScrollbarRef = useRef<HTMLDivElement>(null)
    const [showLiquifyCursor, setShowLiquifyCursor] = useState(false)
    const [showBlurCursor, setShowBlurCursor] = useState(false)
    const zoomStep = 20
    const [miniMapDataURLState, setMiniMapDataURLState] = useState<string | null>(null)
    const isManuallyDragging = useRef(false)

    const [activeSnapLines, setActiveSnapLines] = useState<SnapLineType[]>([])

    // Add states for drag-to-create functionality
    const [isCreatingElement, setIsCreatingElement] = useState(false)
    const [creationStartPoint, setCreationStartPoint] = useState<{ x: number; y: number } | null>(null)
    const [previewElement, setPreviewElement] = useState<ElementData | null>(null)
    const [isExporting, setIsExporting] = useState(false)

    const croppingManager = useCropping({
        cropRect: cropRect,
        setCropRect: setCropRect,
        stageSize: contextStageSize,
        setStageSize: setContextStageSize,
        selectedAspectRatio: selectedAspectRatio,
        setSelectedAspectRatio: setSelectedAspectRatio,
        setIsCropping: setIsCropping,
        setIsCanvasManuallyResized: setIsCanvasManuallyResized,
        lines: renderableObjects.filter((obj) => "tool" in obj) as LineData[],
        setLines: (newLines) => {
            const elements = renderableObjects.filter((obj) => !("tool" in obj)) as ElementData[]
            setRenderableObjects([...elements, ...newLines])
        },
        elements: renderableObjects.filter((obj) => !("tool" in obj)) as ElementData[],
        setElements: (newElements) => {
            const lines = renderableObjects.filter((obj) => "tool" in obj) as LineData[]
            setRenderableObjects([...lines, ...newElements])
        },
        containerRef: containerRef as React.RefObject<HTMLDivElement | null>,
        zoom: zoom,
        setStagePosition,
    })

    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
    const [originalBackgroundImage, setOriginalBackgroundImage] = useState<HTMLImageElement | null>(null)
    const backgroundImageNodeRef = useRef<Konva.Image | null>(null)

    // State to store imported image dimensions and position
    const [backgroundImageParams, setBackgroundImageParams] = useState<{
        x: number
        y: number
        width: number
        height: number
    } | null>(null)

    const liquifyManager = useLiquify({
        stageRef,
        selectedImageId: selectedLiquifyImageId,
        brushSize: liquifyBrushSize,
        strength: liquifyStrength,
        mode: liquifyMode,
        twirlDirection: liquifyTwirlDirection,
        containerRef,
        zoom,
        stagePosition,
    })

    const blurManager = useBlur({
        stageRef,
        selectedImageId: selectedBlurImageId,
        brushSize: blurBrushSize,
        strength: blurStrength,
        containerRef,
        zoom,
        stagePosition,
    })

    const handManager = useHand({
        containerRef,
        zoom,
        stagePosition,
        setStagePosition,
        containerSize,
        stageSize: contextStageSize,
    })

    const contentWidth = contextStageSize ? contextStageSize.width * (zoom / 100) : 0
    const contentHeight = contextStageSize ? contextStageSize.height * (zoom / 100) : 0

    // Centralized function to set cursor based on current tool and context
    const setCursorBasedOnTool = useCallback(() => {
        if (!containerRef.current) return

        // HIGHEST PRIORITY: Hand tool should always show grab/grabbing cursor
        if (activeTool?.type === "hand") {
            handManager.setCursor()
            return
        }

        // Don't change cursor if hovering over UI elements (except for hand tool)
        if (isHoveringInteractiveElement) {
            containerRef.current.style.cursor = "default"
            return
        }

        if (isAddModeActive && (activeTool?.type === "shape" || activeTool?.type === "text")) {
            containerRef.current.style.cursor = "crosshair"
        } else if (activeTool?.type === "brush") {
            if (isBrushTransformModeActive) {
                containerRef.current.style.cursor = "default"
            } else {
                containerRef.current.style.cursor = "none"
            }
        } else if (activeTool?.type === "eraser") {
            containerRef.current.style.cursor = "none"
        } else if (activeTool?.type === "liquify") {
            containerRef.current.style.cursor = selectedLiquifyImageId ? "none" : "default"
        } else if (activeTool?.type === "blur") {
            containerRef.current.style.cursor = selectedBlurImageId ? "none" : "default"
        } else if (activeTool?.type === "text" || activeTool?.type === "cursor" || activeTool?.type === "image-transform") {
            containerRef.current.style.cursor = "default"
        } else {
            containerRef.current.style.cursor = "default"
        }
    }, [activeTool, isAddModeActive, isBrushTransformModeActive, isHoveringInteractiveElement, isDragging, handManager])

    // Reset cursor when tool changes, brush transform mode changes, or add mode changes
    useEffect(() => {
        setCursorBasedOnTool()
        // Also hide brush cursor when in transform mode
        if (isBrushTransformModeActive && activeTool?.type === "brush") {
            setShowBrushCursor(false)
        }
    }, [activeTool, isBrushTransformModeActive, isAddModeActive, setCursorBasedOnTool])

    // Force cursor style for add mode on stage container
    useEffect(() => {
        if (stageRef.current) {
            const stageContainer = stageRef.current.container()
            if (stageContainer) {
                if (isAddModeActive && (activeTool?.type === "shape" || activeTool?.type === "text")) {
                    stageContainer.style.cursor = "crosshair"
                    // Also set it on the canvas element inside stage
                    const canvasElement = stageContainer.querySelector("canvas")
                    if (canvasElement) {
                        canvasElement.style.cursor = "crosshair"
                    }
                } else {
                    // Reset cursor when not in add mode
                    stageContainer.style.cursor = ""
                    const canvasElement = stageContainer.querySelector("canvas")
                    if (canvasElement) {
                        canvasElement.style.cursor = ""
                    }
                }
            }
        }
    }, [isAddModeActive, activeTool, stageRef])

    // Global cursor reset on window focus/blur
    useEffect(() => {
        const handleWindowFocus = () => {
            // Reset cursor when window gains focus
            setTimeout(() => {
                setCursorBasedOnTool()
            }, 100)
        }

        const handleWindowBlur = () => {
            // Reset cursor when window loses focus
            if (containerRef.current) {
                containerRef.current.style.cursor = "default"
            }
        }

        window.addEventListener("focus", handleWindowFocus)
        window.addEventListener("blur", handleWindowBlur)

        return () => {
            window.removeEventListener("focus", handleWindowFocus)
            window.removeEventListener("blur", handleWindowBlur)
        }
    }, [setCursorBasedOnTool])

    useProjectManager({
        loggedInUser,
        renderableObjects,
        contextStageSize,
        backgroundImage,
        stageRef,
    })

    // Canvas export function
    const exportCanvas = useCallback(
        async (format: "png" | "jpg" | "pdf" | "json" | "webp" | "svg") => {
            if (!stageRef.current || !contextStageSize) {
                throw new Error("Canvas not ready for export")
            }



            setIsExporting(true)

            try {
                let dataURL: string

                if (format === "png") {
                    // For PNG - create export with transparent background
                    dataURL = await createExportDataURL("png")
                } else if (format === "jpg") {
                    // For JPG - create export with white background
                    dataURL = await createExportDataURL("jpg")
                } else if (format === "webp") {
                    // For WEBP - create export with transparent background
                    dataURL = await createExportDataURL("webp")
                } else if (format === "svg") {
                    // For SVG - generate SVG content
                    const svgContent = await createSVGExport()
                    const blob = new Blob([svgContent], { type: "image/svg+xml" })
                    const url = URL.createObjectURL(blob)
                    const svgFileName = `project_${Date.now()}.svg`
                    downloadURL(url, svgFileName)
                    URL.revokeObjectURL(url)
                    
                    toast.success("Success", {
                        description: `Project saved as "${svgFileName}"`,
                        duration: 5000,
                    })
                    return
                } else if (format === "pdf") {
                    // For PDF - create export with transparent background for now
                    dataURL = await createExportDataURL("png")
                }

                // WEBP exports require logged in user (Pro feature)
                if (format === "webp") {
                    if (!loggedInUser) {
                        toast.error("Error", {
                            description: "Sign in to export in WEBP format",
                            duration: 5000,
                        })
                        return
                    }
                    const webpFileName = `project_${Date.now()}.webp`
                    downloadDataURL(dataURL!, webpFileName)
                    toast.success("Success", {
                        description: `Project saved as "${webpFileName}"`,
                        duration: 5000,
                    })
                    return
                }

                // Add watermark if user is not logged in (for PNG, JPG only)
                if (!loggedInUser && (format === "png" || format === "jpg")) {
                    dataURL = await addWatermark(dataURL!, contextStageSize.width, contextStageSize.height, format)
                }

                switch (format) {
                    case "png":
                        const pngFileName = `project_${Date.now()}.png`
                        downloadDataURL(dataURL!, pngFileName)
                        toast.success("Success", {
                            description: `Project saved as "${pngFileName}"`,
                            duration: 5000,
                        })
                        break

                    case "jpg":
                        const jpgFileName = `project_${Date.now()}.jpg`
                        downloadDataURL(dataURL!, jpgFileName)
                        toast.success("Success", {
                            description: `Project saved as "${jpgFileName}"`,
                            duration: 5000,
                        })
                        break

                    case "pdf":
                        const canvas = document.createElement('canvas')
                        const ctx = canvas.getContext('2d')
                        const img = new Image()
                        
                        await new Promise<void>((resolve) => {
                            img.onload = () => {
                                canvas.width = contextStageSize.width
                                canvas.height = contextStageSize.height
                                ctx!.fillStyle = 'white'
                                ctx!.fillRect(0, 0, canvas.width, canvas.height)
                                ctx!.drawImage(img, 0, 0)
                                resolve()
                            }
                            img.src = dataURL!
                        })

                        const pdf = new jsPDF({
                            orientation: contextStageSize.width > contextStageSize.height ? "landscape" : "portrait",
                            unit: "px",
                            format: [contextStageSize.width, contextStageSize.height],
                        })

                        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, contextStageSize.width, contextStageSize.height)

                        const pdfFileName = `project_${Date.now()}.pdf`
                        pdf.save(pdfFileName)
                        toast.success("Success", {
                            description: `Project saved as "${pdfFileName}"`,
                            duration: 5000,
                        })
                        break

                    default:
                        throw new Error(`Unsupported export format: ${format}`)
                }
            } catch (error) {
                console.error("Error exporting canvas:", error)
                throw error
            } finally {
                setIsExporting(false)
            }
        },
        [contextStageSize, loggedInUser],
    )

    // Helper function to create export data URL without affecting visible canvas
    const createExportDataURL = useCallback(async (format: "png" | "jpg" | "webp"): Promise<string> => {
        if (!stageRef.current || !contextStageSize) {
            throw new Error("Canvas not ready for export")
        }

        const stage = stageRef.current

        // Find and temporarily hide UI elements that shouldn't be in export
        const backgroundNode = stage.findOne(".background-pattern") as Konva.Rect | null
        const wasBackgroundVisible = backgroundNode?.visible()
        
        // Find and hide all transformers specifically
        const transformers = stage.find('Transformer')
        const transformersVisibility: boolean[] = []
        transformers.forEach((transformer) => {
            transformersVisibility.push(transformer.visible())
        })
        
        // Find UI layers that contain selection borders, transformers, snap lines, etc.
        const layers = stage.find('Layer')
        const uiLayers: Konva.Layer[] = []
        const uiLayersVisibility: boolean[] = []
        
        // Hide layers that contain UI elements (typically the last 2-3 layers)
        // We'll hide layers that don't contain actual content (brush lines, elements)
        if (layers.length >= 2) {
            // Usually the last 2 layers are UI layers
            const lastTwoLayers = layers.slice(-2) as Konva.Layer[]
            lastTwoLayers.forEach((layer) => {
                uiLayers.push(layer)
                uiLayersVisibility.push(layer.visible())
            })
        }
        
        let cleanDataURL: string
        
        try {
            // Hide background pattern very briefly (won't be visible to user due to RAF timing)
            if (backgroundNode) {
                backgroundNode.visible(false)
            }
            
            // Hide all transformers specifically
            transformers.forEach((transformer) => {
                transformer.visible(false)
            })
            
            // Hide UI layers (transformers, snap lines, crop tools, etc.)
            uiLayers.forEach((layer) => {
                layer.visible(false)
            })
            
            stage.batchDraw() // Force immediate redraw

            // Get clean stage content without background pattern and UI elements
            const mimeType = format === "webp" ? "image/webp" : format === "jpg" ? "image/jpeg" : "image/png"
            cleanDataURL = stage.toDataURL({ 
                mimeType: mimeType,
                quality: format === "webp" ? 0.9 : 1
            })
        } finally {
            // Immediately restore background pattern
            if (backgroundNode && wasBackgroundVisible) {
                backgroundNode.visible(true)
            }
            
            // Restore transformers visibility
            transformers.forEach((transformer, index) => {
                transformer.visible(transformersVisibility[index])
            })
            
            // Restore UI layers visibility
            uiLayers.forEach((layer, index) => {
                layer.visible(uiLayersVisibility[index])
            })
            
            stage.batchDraw() // Force immediate redraw
        }

        // Create final export canvas
        return new Promise((resolve, reject) => {
            const stageImage = new Image()
            
            stageImage.onload = () => {
                const exportCanvas = document.createElement('canvas')
                exportCanvas.width = contextStageSize.width
                exportCanvas.height = contextStageSize.height
                const exportCtx = exportCanvas.getContext('2d')!

                // Set background based on format
                if (format === "jpg") {
                    exportCtx.fillStyle = 'white'
                    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
                }

                // Draw the clean stage content
                exportCtx.drawImage(stageImage, 0, 0)
                
                const outputMimeType = format === "webp" ? "image/webp" : format === "jpg" ? "image/jpeg" : "image/png"
                const quality = format === "webp" ? 0.9 : format === "jpg" ? 0.9 : 1
                resolve(exportCanvas.toDataURL(outputMimeType, quality))
            }
            
            stageImage.onerror = () => {
                reject(new Error("Failed to load stage image for export"))
            }
            
            stageImage.src = cleanDataURL
        })
    }, [contextStageSize])

    // Helper function to create SVG export
    const createSVGExport = useCallback(async (): Promise<string> => {
        if (!contextStageSize) {
            throw new Error("Canvas not ready for SVG export")
        }

        const { width, height } = contextStageSize
        
        // Debug info - can be removed in production
        console.log('SVG Export: Starting with canvas size:', width, 'x', height)
        console.log('SVG Export: Renderable objects count:', renderableObjects.length)
        
        // Create SVG content with transparent background
        let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="background-color: transparent;">
<defs>
<!-- Gradient and pattern definitions can be added here -->
</defs>`

        // Helper function to convert color with opacity to rgba
        const colorWithOpacity = (color: string | undefined, opacity: number = 100) => {
            if (!color || color === 'transparent') return 'transparent'
            if (opacity === undefined || opacity === null || opacity === 0) return 'transparent'
            if (opacity === 100) return color
            
            // Ensure opacity is between 0 and 100, if it's already between 0 and 1, convert to 0-100 range
            let normalizedOpacity = opacity
            if (opacity <= 1 && opacity > 0) {
                normalizedOpacity = opacity * 100
            }
            
            // Simple RGB extraction for hex colors
            if (color.startsWith('#')) {
                const hex = color.substring(1)
                const r = parseInt(hex.substring(0, 2), 16)
                const g = parseInt(hex.substring(2, 4), 16)
                const b = parseInt(hex.substring(4, 6), 16)
                return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity / 100})`
            }
            
            // Handle rgb/rgba colors
            if (color.startsWith('rgb')) {
                // Extract RGB values from rgb(r,g,b) or rgba(r,g,b,a) format
                const matches = color.match(/\d+/g)
                if (matches && matches.length >= 3) {
                    const r = parseInt(matches[0])
                    const g = parseInt(matches[1])
                    const b = parseInt(matches[2])
                    return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity / 100})`
                }
            }
            
            // For named colors, try to use them as-is with opacity
            if (normalizedOpacity !== 100) {
                // For named colors, we'll have to use a fallback
                const colorMap: { [key: string]: string } = {
                    'black': '#000000',
                    'white': '#ffffff',
                    'red': '#ff0000',
                    'green': '#008000',
                    'blue': '#0000ff',
                    'yellow': '#ffff00',
                    'cyan': '#00ffff',
                    'magenta': '#ff00ff',
                    'gray': '#808080',
                    'grey': '#808080'
                }
                
                const hexColor = colorMap[color.toLowerCase()]
                if (hexColor) {
                    const hex = hexColor.substring(1)
                    const r = parseInt(hex.substring(0, 2), 16)
                    const g = parseInt(hex.substring(2, 4), 16)
                    const b = parseInt(hex.substring(4, 6), 16)
                    return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity / 100})`
                }
            }
            
            return color
        }

        // Helper function to escape XML text
        const escapeXml = (text: string) => {
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
        }

        let elementCount = 0
        let lineCount = 0

        // Process each renderable object
        for (const obj of renderableObjects) {
            if ('tool' in obj) {
                // Handle brush and eraser lines
                const line = obj as LineData
                if (line.tool === 'brush') {
                    lineCount++
                    // Debug: Processing brush line
                    
                    const points = line.points
                    if (points.length >= 4) {
                        let pathData = `M ${points[0]} ${points[1]}`
                        for (let i = 2; i < points.length; i += 2) {
                            if (i + 1 < points.length) {
                                pathData += ` L ${points[i]} ${points[i + 1]}`
                            }
                        }
                        
                        const lineAny = line as any
                        const hasTransform = lineAny.x || lineAny.y || lineAny.rotation || lineAny.scaleX !== 1 || lineAny.scaleY !== 1
                        const transform = hasTransform
                            ? `transform="translate(${lineAny.x || 0}, ${lineAny.y || 0}) rotate(${lineAny.rotation || 0}) scale(${lineAny.scaleX || 1}, ${lineAny.scaleY || 1})"` 
                            : ''
                        
                        // Debug: Brush line details
                        const strokeColor = colorWithOpacity(line.color, line.opacity)
                        console.log('SVG Export: Brush line color:', line.color, 'opacity:', line.opacity, 'result:', strokeColor)
                        
                        svgContent += `
<path d="${pathData}" 
      stroke="${strokeColor}" 
      stroke-width="${line.strokeWidth}" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      fill="none" 
      ${transform} />`
                    }
                }
                // Note: Eraser strokes are complex to implement in SVG as they use composite operations
            } else {
                // Handle elements (shapes, text, images)
                const element = obj as ElementData
                elementCount++
                // Debug: Processing element
                console.log('SVG Export: Processing element:', element.type, 'opacity:', element.opacity, 'colors:', {
                    fillColor: element.fillColor,
                    fillColorOpacity: element.fillColorOpacity,
                    borderColor: element.borderColor,
                    borderColorOpacity: element.borderColorOpacity
                })
                
                // Ensure element opacity is properly handled (0-100 range converted to 0-1 for SVG)
                let elementOpacity = element.opacity
                if (elementOpacity === undefined || elementOpacity === null) {
                    elementOpacity = 100
                }
                // If opacity is already in 0-1 range, convert to 0-100 first
                if (elementOpacity <= 1 && elementOpacity > 0) {
                    elementOpacity = elementOpacity * 100
                }
                const commonAttrs = `opacity="${Math.max(0.01, elementOpacity / 100)}"`
                
                // Calculate transform
                const centerX = element.x + (element.width || 0) / 2
                const centerY = element.y + (element.height || 0) / 2
                const rotateTransform = element.rotation ? ` rotate(${element.rotation} ${centerX} ${centerY})` : ''
                const scaleTransform = (element.scaleX !== 1 || element.scaleY !== 1) ? ` scale(${element.scaleX || 1} ${element.scaleY || 1})` : ''
                const transform = (rotateTransform || scaleTransform) ? `transform="${rotateTransform}${scaleTransform}"` : ''

                switch (element.type) {
                    case 'rectangle':
                    case 'square':
                        // Debug: Rectangle element
                        svgContent += `
<rect x="${element.x}" y="${element.y}" 
      width="${element.width}" height="${element.height}" 
      fill="${colorWithOpacity(element.fillColor, element.fillColorOpacity) || 'none'}" 
      stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || 'none'}" 
      stroke-width="${element.borderWidth || 0}" 
      ${commonAttrs} ${transform} />`
                        break
                        
                    case 'rounded-rectangle':
                        svgContent += `
<rect x="${element.x}" y="${element.y}" 
      width="${element.width}" height="${element.height}" 
      rx="${element.cornerRadius || 10}" ry="${element.cornerRadius || 10}"
      fill="${colorWithOpacity(element.fillColor, element.fillColorOpacity) || 'none'}" 
      stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || 'none'}" 
      stroke-width="${element.borderWidth || 0}" 
      ${commonAttrs} ${transform} />`
                        break
                        
                    case 'squircle':
                        const squircleRadius = Math.min(element.width || 0, element.height || 0) / 4
                        svgContent += `
<rect x="${element.x}" y="${element.y}" 
      width="${element.width}" height="${element.height}" 
      rx="${squircleRadius}" ry="${squircleRadius}"
      fill="${colorWithOpacity(element.fillColor, element.fillColorOpacity) || 'none'}" 
      stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || 'none'}" 
      stroke-width="${element.borderWidth || 0}" 
      ${commonAttrs} ${transform} />`
                        break
                        
                    case 'circle':
                        const radius = Math.min(element.width || 0, element.height || 0) / 2
                        // In ElementRenderer, circles are positioned with center coordinates (x + width/2)
                        // But ElementData stores top-left coordinates, so we need to add half width/height
                        const cx = element.x + (element.width || 0) / 2
                        const cy = element.y + (element.height || 0) / 2
                        // Debug: Circle element
                        svgContent += `
<circle cx="${cx}" cy="${cy}" r="${radius}" 
        fill="${colorWithOpacity(element.fillColor, element.fillColorOpacity) || 'none'}" 
        stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || 'none'}" 
        stroke-width="${element.borderWidth || 0}" 
        ${commonAttrs} ${transform} />`
                        break
                        
                    case 'triangle':
                        const triRadius = Math.min(element.width || 0, element.height || 0) / 2
                        const triCx = element.x + (element.width || 0) / 2
                        const triCy = element.y + (element.height || 0) / 2
                        // Create triangle points (equilateral triangle)
                        const triPoints = [
                            `${triCx},${triCy - triRadius}`, // top point
                            `${triCx - triRadius * 0.866},${triCy + triRadius * 0.5}`, // bottom left
                            `${triCx + triRadius * 0.866},${triCy + triRadius * 0.5}`  // bottom right
                        ].join(' ')
                        svgContent += `
<polygon points="${triPoints}" 
         fill="${colorWithOpacity(element.fillColor, element.fillColorOpacity) || 'none'}" 
         stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || 'none'}" 
         stroke-width="${element.borderWidth || 0}" 
         ${commonAttrs} ${transform} />`
                        break
                        
                    case 'pentagon':
                        const pentRadius = Math.min(element.width || 0, element.height || 0) / 2
                        const pentCx = element.x + (element.width || 0) / 2
                        const pentCy = element.y + (element.height || 0) / 2
                        const pentPoints = []
                        for (let i = 0; i < 5; i++) {
                            const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2)
                            const x = pentCx + pentRadius * Math.cos(angle)
                            const y = pentCy + pentRadius * Math.sin(angle)
                            pentPoints.push(`${x},${y}`)
                        }
                        svgContent += `
<polygon points="${pentPoints.join(' ')}" 
         fill="${colorWithOpacity(element.fillColor, element.fillColorOpacity) || 'none'}" 
         stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || 'none'}" 
         stroke-width="${element.borderWidth || 0}" 
         ${commonAttrs} ${transform} />`
                        break
                        
                    case 'hexagon':
                        const hexRadius = Math.min(element.width || 0, element.height || 0) / 2
                        const hexCx = element.x + (element.width || 0) / 2
                        const hexCy = element.y + (element.height || 0) / 2
                        const hexPoints = []
                        for (let i = 0; i < 6; i++) {
                            const angle = (i * 2 * Math.PI / 6) - (Math.PI / 2)
                            const x = hexCx + hexRadius * Math.cos(angle)
                            const y = hexCy + hexRadius * Math.sin(angle)
                            hexPoints.push(`${x},${y}`)
                        }
                        svgContent += `
<polygon points="${hexPoints.join(' ')}" 
         fill="${colorWithOpacity(element.fillColor, element.fillColorOpacity) || 'none'}" 
         stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || 'none'}" 
         stroke-width="${element.borderWidth || 0}" 
         ${commonAttrs} ${transform} />`
                        break
                        
                    case 'star':
                        const starRadius = Math.min(element.width || 0, element.height || 0) / 2
                        const starCx = element.x + (element.width || 0) / 2
                        const starCy = element.y + (element.height || 0) / 2
                        const starInnerRadius = starRadius / 2
                        const starPoints = []
                        for (let i = 0; i < 10; i++) {
                            const angle = (i * Math.PI / 5) - (Math.PI / 2)
                            const radius = i % 2 === 0 ? starRadius : starInnerRadius
                            const x = starCx + radius * Math.cos(angle)
                            const y = starCy + radius * Math.sin(angle)
                            starPoints.push(`${x},${y}`)
                        }
                        svgContent += `
<polygon points="${starPoints.join(' ')}" 
         fill="${colorWithOpacity(element.fillColor, element.fillColorOpacity) || 'none'}" 
         stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || 'none'}" 
         stroke-width="${element.borderWidth || 0}" 
         ${commonAttrs} ${transform} />`
                        break
                        
                    case 'heart':
                        const heartCx = element.x + (element.width || 0) / 2
                        const heartCy = element.y + (element.height || 0) / 2
                        const heartWidth = element.width || 0
                        const heartHeight = element.height || 0
                        // SVG heart path (scaled and positioned)
                        const heartPath = `M ${heartCx} ${heartCy + heartHeight * 0.3} 
                                         C ${heartCx} ${heartCy - heartHeight * 0.1}, ${heartCx - heartWidth * 0.5} ${heartCy - heartHeight * 0.1}, ${heartCx - heartWidth * 0.5} ${heartCy + heartHeight * 0.1}
                                         C ${heartCx - heartWidth * 0.5} ${heartCy + heartHeight * 0.2}, ${heartCx} ${heartCy + heartHeight * 0.4}, ${heartCx} ${heartCy + heartHeight * 0.5}
                                         C ${heartCx} ${heartCy + heartHeight * 0.4}, ${heartCx + heartWidth * 0.5} ${heartCy + heartHeight * 0.2}, ${heartCx + heartWidth * 0.5} ${heartCy + heartHeight * 0.1}
                                         C ${heartCx + heartWidth * 0.5} ${heartCy - heartHeight * 0.1}, ${heartCx} ${heartCy - heartHeight * 0.1}, ${heartCx} ${heartCy + heartHeight * 0.3} Z`
                        svgContent += `
<path d="${heartPath}" 
      fill="${colorWithOpacity(element.fillColor, element.fillColorOpacity) || 'none'}" 
      stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || 'none'}" 
      stroke-width="${element.borderWidth || 0}" 
      ${commonAttrs} ${transform} />`
                        break
                        
                    case 'arrow':
                        const arrowBodyY = element.y + (element.height || 0) / 2
                        const arrowHeadWidth = (element.width || 0) * 0.2
                        const arrowHeadHeight = (element.height || 0) * 0.6
                        const arrowPath = `M ${element.x} ${arrowBodyY} 
                                         L ${element.x + (element.width || 0) - arrowHeadWidth} ${arrowBodyY}
                                         L ${element.x + (element.width || 0) - arrowHeadWidth} ${element.y + (element.height || 0) * 0.2}
                                         L ${element.x + (element.width || 0)} ${element.y + (element.height || 0) / 2}
                                         L ${element.x + (element.width || 0) - arrowHeadWidth} ${element.y + (element.height || 0) * 0.8}
                                         L ${element.x + (element.width || 0) - arrowHeadWidth} ${arrowBodyY} Z`
                        svgContent += `
<path d="${arrowPath}" 
      fill="${colorWithOpacity(element.fillColor, element.fillColorOpacity) || 'none'}" 
      stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || 'none'}" 
      stroke-width="${element.borderWidth || 0}" 
      ${commonAttrs} ${transform} />`
                        break
                        
                    case 'text':
                        const textX = element.x + (element.width || 0) / 2
                        const textY = element.y + (element.height || 0) / 2
                        const fontSize = element.fontSize || 16
                        let textContent = element.text || ''
                        
                        // Apply text case
                        switch (element.textCase) {
                            case 'uppercase':
                                textContent = textContent.toUpperCase()
                                break
                            case 'lowercase':
                                textContent = textContent.toLowerCase()
                                break
                            case 'capitalize':
                                textContent = textContent.split(' ').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                ).join(' ')
                                break
                        }
                        
                        // Debug: Text element
                        
                        // Add background rectangle if background color is set
                        if (element.backgroundColor && element.backgroundColor !== 'transparent' && element.backgroundOpacity && element.backgroundOpacity > 0) {
                            svgContent += `
<rect x="${element.x}" y="${element.y}" 
      width="${element.width}" height="${element.height}" 
      fill="${colorWithOpacity(element.backgroundColor, element.backgroundOpacity)}" 
      ${commonAttrs} ${transform} />`
                        }
                        
                        svgContent += `
<text x="${textX}" y="${textY}" 
      font-size="${fontSize}" 
      font-family="${element.fontFamily || 'Arial'}" 
      text-anchor="middle" 
      dominant-baseline="middle" 
      fill="${colorWithOpacity(element.color, element.textColorOpacity) || '#000000'}" 
      ${element.fontStyles?.bold ? 'font-weight="bold"' : ''} 
      ${element.fontStyles?.italic ? 'font-style="italic"' : ''} 
      ${commonAttrs} ${transform}>${escapeXml(textContent)}</text>`
                        break
                        
                    case 'line':
                        const x2 = element.x + (element.width || 0)
                        const y2 = element.y
                        // Debug: Line element
                        svgContent += `
<line x1="${element.x}" y1="${element.y}" x2="${x2}" y2="${y2}" 
      stroke="${colorWithOpacity(element.borderColor, element.borderColorOpacity) || '#000000'}" 
      stroke-width="${element.borderWidth || 1}" 
      ${commonAttrs} ${transform} />`
                        break
                        
                    case 'custom-image':
                        if (element.src) {
                            // Custom images use center positioning, so convert to top-left for SVG
                            const imgX = element.x - (element.width || 0) / 2
                            const imgY = element.y - (element.height || 0) / 2
                            // Debug: Image element
                            svgContent += `
<image x="${imgX}" y="${imgY}" 
       width="${element.width}" height="${element.height}" 
       href="${element.src}" 
       ${commonAttrs} ${transform} />`
                        }
                        break
                }
            }
        }

        svgContent += '\n</svg>'
        
        console.log('SVG Export: Completed. Total elements:', elementCount, 'Total lines:', lineCount)
        console.log('SVG Export: Final SVG length:', svgContent.length)
        
        return svgContent
    }, [contextStageSize, renderableObjects])

    // Helper function to download URL
    const downloadURL = (url: string, filename: string) => {
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Helper function to download data URL
    const downloadDataURL = (dataURL: string, filename: string) => {
        const link = document.createElement("a")
        link.href = dataURL
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Register the export function
    useEffect(() => {
        registerCanvasExporter(exportCanvas)
    }, [registerCanvasExporter, exportCanvas])

    // Register stage reference for sharing functionality
    useEffect(() => {
        if (registerStageRef) {
            registerStageRef(stageRef);
        }
    }, [registerStageRef]);

    useEffect(() => {
        const checkAndUpdateImageStatus = () => {
            // Check if there are any image objects available
            const hasImages = renderableObjects.some((obj) => !("tool" in obj) && obj.type === "custom-image")
            setIsImageReadyForLiquify(hasImages)
        }

        checkAndUpdateImageStatus()

        const originalLiquifyReset = liquifyManager.resetLiquify
        const wrappedLiquifyReset = () => {
            originalLiquifyReset()
            checkAndUpdateImageStatus()
        }
        setResetLiquifyFunction(wrappedLiquifyReset)

        const originalBlurReset = blurManager.resetBlur
        const wrappedBlurReset = () => {
            originalBlurReset()
            checkAndUpdateImageStatus()
        }
        setResetBlurFunction(wrappedBlurReset)

        return () => {
            setResetLiquifyFunction(() => { })
            setResetBlurFunction(() => { })
        }
    }, [liquifyManager.resetLiquify, blurManager.resetBlur, setIsImageReadyForLiquify, renderableObjects])

    useEffect(() => {
        const imageNode = backgroundImageNodeRef.current
        if (imageNode) {
            const handleImageChange = () => {
                setIsImageReadyForLiquify(!!imageNode.image())
            }
            imageNode.on("imageChange", handleImageChange)
            handleImageChange()
            return () => {
                if (imageNode.isListening()) {
                    imageNode.off("imageChange", handleImageChange)
                }
            }
        } else {
            setIsImageReadyForLiquify(false)
        }
    }, [backgroundImage, setIsImageReadyForLiquify])

    // Global event handlers for hand tool dragging
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging.current && activeTool?.type === "hand" && isManuallyDragging.current) {
                handManager.processPanning(e.clientX, e.clientY)
            }
        }

        const handleGlobalMouseUp = (e: MouseEvent) => {
            if (isDragging.current && activeTool?.type === "hand") {
                isDragging.current = false
                isManuallyDragging.current = false
                handManager.endPanning()
            }
        }

        if (activeTool?.type === "hand") {
            document.addEventListener("mousemove", handleGlobalMouseMove)
            document.addEventListener("mouseup", handleGlobalMouseUp)
        }

        return () => {
            document.removeEventListener("mousemove", handleGlobalMouseMove)
            document.removeEventListener("mouseup", handleGlobalMouseUp)
        }
    }, [activeTool, handManager])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if we're in an input field or textarea
            const activeElement = document.activeElement
            const isInTextInput = activeElement && (
                activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                (activeElement as HTMLElement).isContentEditable
            )

            if (e.key === "Delete" || e.key === "Backspace") {
                // Don't delete objects if user is typing in text input
                if (isInTextInput) {
                    return;
                }
                
                // Check if we have a selected brush/eraser line to delete
                if (selectedLineId && isBrushTransformModeActive && (activeTool?.type === "brush" || activeTool?.type === "eraser")) {
                    const success = drawingManager.removeSelectedLine(selectedLineId);
                    if (success) {
                        setSelectedLineId(null); // Clear selection after successful deletion
                    }
                } else {
                    // Otherwise delete selected element (shape, text, image)
                    elementsManager.removeSelectedElement();
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key === "d") {
                // Handle Command+D (or Ctrl+D on Windows/Linux) for duplication
                e.preventDefault() // Prevent browser's bookmark dialog
                
                // Check if we have a selected brush line to duplicate
                if (selectedLineId && isBrushTransformModeActive && activeTool?.type === "brush") {
                    const newLineId = drawingManager.duplicateSelectedLine(selectedLineId)
                    if (newLineId) {
                        setSelectedLineId(newLineId) // Select the newly duplicated line
                    }
                } else {
                    // Otherwise duplicate selected element (shape, text, image)
                    elementsManager.duplicateSelectedElement()
                }
            } else if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight")) {
                // Handle Ctrl+Alt+Arrow (or Cmd+Alt+Arrow on Mac) for rotation
                if (isInTextInput) {
                    return 
                }

                e.preventDefault() // Prevent browser shortcuts

                // Determine rotation degrees based on arrow key direction
                let rotationDegrees = 0
                switch (e.key) {
                    case "ArrowUp":
                    case "ArrowRight":
                        rotationDegrees = e.shiftKey ? 45 : 15 // Shift for larger rotation
                        break
                    case "ArrowDown":
                    case "ArrowLeft":
                        rotationDegrees = e.shiftKey ? -45 : -15 // Shift for larger rotation
                        break
                }

                // Handle rotation for brush lines or elements
                if (selectedLineId && isBrushTransformModeActive && activeTool?.type === "brush") {
                    drawingManager.rotateSelectedLine(selectedLineId, rotationDegrees)
                } else if (elementsManager.selectedElementId) {
                    elementsManager.rotateSelectedElement(rotationDegrees)
                }
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                
                if (isInTextInput) {
                    return 
                }

                e.preventDefault() 

                const distance = e.shiftKey ? 10 : 1

                if (selectedLineId && isBrushTransformModeActive && activeTool?.type === "brush") {
                    switch (e.key) {
                        case "ArrowUp":
                            drawingManager.moveSelectedLine(selectedLineId, "up", distance)
                            break
                        case "ArrowDown":
                            drawingManager.moveSelectedLine(selectedLineId, "down", distance)
                            break
                        case "ArrowLeft":
                            drawingManager.moveSelectedLine(selectedLineId, "left", distance)
                            break
                        case "ArrowRight":
                            drawingManager.moveSelectedLine(selectedLineId, "right", distance)
                            break
                    }
                } else {
                    switch (e.key) {
                        case "ArrowUp":
                            elementsManager.moveSelectedElement("up", distance)
                            break
                        case "ArrowDown":
                            elementsManager.moveSelectedElement("down", distance)
                            break
                        case "ArrowLeft":
                            elementsManager.moveSelectedElement("left", distance)
                            break
                        case "ArrowRight":
                            elementsManager.moveSelectedElement("right", distance)
                            break
                    }
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [elementsManager, drawingManager, selectedLineId, isBrushTransformModeActive, activeTool])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                setContainerSize({ width, height })
            }
        })

        resizeObserver.observe(container)

        // Initial size update
        setContainerSize({ width: container.offsetWidth, height: container.offsetHeight })

        return () => {
            resizeObserver.unobserve(container)
            resizeObserver.disconnect()
        }
    }, [setContainerSize])

    useEffect(() => {
        if (isProgrammaticZoomRef.current) {
            return
        }

        if (isApplyingCrop) {
            return
        }

        if (contextStageSize && containerRef.current && containerSize && !isManuallyDragging.current) {
            const scaleValue = zoom / 100

            const scaledContentWidth = contextStageSize.width * scaleValue
            const scaledContentHeight = contextStageSize.height * scaleValue

            let newX = stagePosition.x
            let newY = stagePosition.y

            const currentContainerW = containerSize.width
            const currentContainerH = containerSize.height

            if (scaledContentWidth <= currentContainerW) {
                newX = (currentContainerW - scaledContentWidth) / 2
            } else {
                newX = Math.max(currentContainerW - scaledContentWidth, Math.min(0, stagePosition.x))
            }

            if (scaledContentHeight <= currentContainerH) {
                newY = (currentContainerH - scaledContentHeight) / 2
            } else {
                newY = Math.max(currentContainerH - scaledContentHeight, Math.min(0, stagePosition.y))
            }

            if (newX !== stagePosition.x || newY !== stagePosition.y) {
                setStagePosition({ x: newX, y: newY })
            }
        }
    }, [contextStageSize, containerSize, zoom, stagePosition, setStagePosition, isProgrammaticZoomRef, isApplyingCrop])

    const handleScroll = (direction: "horizontal" | "vertical", newPosition: number) => {
        const currentX = stagePosition.x
        const currentY = stagePosition.y
        setStagePosition({
            x: direction === "horizontal" ? -newPosition : currentX,
            y: direction === "vertical" ? -newPosition : currentY,
        })
    }

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault()

        if (!containerRef.current || !stageRef.current || !contextStageSize || !containerSize) return

        const containerRect = containerRef.current.getBoundingClientRect()
        const currentScale = zoom / 100
        const scaleBy = 1.1
        const newScaleDirection = e.deltaY < 0 ? currentScale * scaleBy : currentScale / scaleBy
        const boundedScale = Math.min(Math.max(newScaleDirection, 0.1), 5)
        const newZoom = Math.round(boundedScale * 100)
        if (newZoom === zoom) return
        const { width: currentContainerWidth, height: currentContainerHeight } = containerSize
        const newContentWidth = contextStageSize.width * boundedScale
        const newContentHeight = contextStageSize.height * boundedScale
        const scrollbarsWillBeVisible = newContentWidth > currentContainerWidth || newContentHeight > currentContainerHeight
        let newPosition
        if (scrollbarsWillBeVisible) {
            const mouseXInContainer = e.clientX - containerRect.left
            const mouseYInContainer = e.clientY - containerRect.top
            const canvasPointBefore = {
                x: (mouseXInContainer - stagePosition.x) / currentScale,
                y: (mouseYInContainer - stagePosition.y) / currentScale,
            }
            newPosition = {
                x: mouseXInContainer - canvasPointBefore.x * boundedScale,
                y: mouseYInContainer - canvasPointBefore.y * boundedScale,
            }
        } else {
            newPosition = {
                x: (currentContainerWidth - newContentWidth) / 2,
                y: (currentContainerHeight - newContentHeight) / 2,
            }
        }
        setZoom(newZoom)
        setStagePosition(newPosition)
    }

    const handleDoubleClick = () => {
        const newZoom = 100
        setZoom(newZoom, true)

        if (!containerRef.current || !contextStageSize || !containerSize) return

        const containerWidth = containerSize.width
        const containerHeight = containerSize.height
        const scaleValue = newZoom / 100
        const scaledContentWidth = contextStageSize.width * scaleValue
        const scaledContentHeight = contextStageSize.height * scaleValue

        let newX, newY

        if (scaledContentWidth <= containerWidth) {
            newX = (containerWidth - scaledContentWidth) / 2
        } else {
            newX = 0
        }

        if (scaledContentHeight <= containerHeight) {
            newY = (containerHeight - scaledContentHeight) / 2
        } else {
            newY = 0
        }

        setStagePosition({ x: newX, y: newY })
    }

    const handleZoomButtonClick = (zoomChange: number) => {
        if (!containerRef.current || !stageRef.current || !contextStageSize || !containerSize) return

        const currentScale = zoom / 100
        const containerCenterX = containerSize.width / 2
        const containerCenterY = containerSize.height / 2

        const canvasPointBefore = {
            x: (containerCenterX - stagePosition.x) / currentScale,
            y: (containerCenterY - stagePosition.y) / currentScale,
        }

        const newZoom = Math.min(Math.max(zoom + zoomChange, 10), 500)
        if (newZoom === zoom) return
        const newScale = newZoom / 100

        const newPosition = {
            x: containerCenterX - canvasPointBefore.x * newScale,
            y: containerCenterY - canvasPointBefore.y * newScale,
        }

        setZoom(newZoom)
        setStagePosition(newPosition)
    }

    const handleZoomInClick = () => handleZoomButtonClick(zoomStep)
    const handleZoomOutClick = () => handleZoomButtonClick(-zoomStep)

    // Handlers for the outer div (container)
    const handleMouseMoveOnContainer = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return

        // Check if mouse is over UI elements
        const isOverZoomCtrl = zoomControlsRef.current && zoomControlsRef.current.contains(e.target as Node)
        const isOverHorizontalScroll =
            horizontalScrollbarRef.current && horizontalScrollbarRef.current.contains(e.target as Node)
        const isOverVerticalScroll = verticalScrollbarRef.current && verticalScrollbarRef.current.contains(e.target as Node)
        if (isOverZoomCtrl || isOverHorizontalScroll || isOverVerticalScroll) {
            if (!isHoveringInteractiveElement) setIsHoveringInteractiveElement(true)

            // Hand tool should always show grab cursor, even over UI elements
            if (activeTool?.type === "hand") {
                handManager.setCursor()
            } else {
                if (containerRef.current) containerRef.current.style.cursor = "default"
            }

            setShowBrushCursor(false)
            setShowEraserCursor(false)
            setShowLiquifyCursor(false)
            setShowBlurCursor(false)
            return
        }
        if (isHoveringInteractiveElement) setIsHoveringInteractiveElement(false)

        const containerRect = containerRef.current.getBoundingClientRect()
        const currentScale = zoom / 100
        const mouseX = (e.clientX - containerRect.left - stagePosition.x) / currentScale
        const mouseY = (e.clientY - containerRect.top - stagePosition.y) / currentScale
        setCursorPositionOnCanvas({ x: mouseX, y: mouseY })

        // PRIORITY 1: Hand tool always gets grab/grabbing cursor
        if (activeTool?.type === "hand") {
            handManager.setCursor()
            setShowBrushCursor(false)
            setShowEraserCursor(false)
            setShowLiquifyCursor(false)
            setShowBlurCursor(false)
            return
        }

        // PRIORITY 2: Element creation mode (adding elements)
        if (isAddModeActive && (activeTool?.type === "shape" || activeTool?.type === "text")) {
            // Crosshair cursor for element creation mode
            if (containerRef.current) containerRef.current.style.cursor = "crosshair"
            setShowBrushCursor(false)
            setShowEraserCursor(false)
            setShowLiquifyCursor(false)
            setShowBlurCursor(false)
        }
        // PRIORITY 3: Specific tool cursors (but not when hovering over interactive elements)
        else if (activeTool?.type === "brush") {
            if (isBrushTransformModeActive) {
                if (containerRef.current) containerRef.current.style.cursor = "default"
                setShowBrushCursor(false)
            } else if (!isHoveringInteractiveElement) {
                // Show brush cursor only when not hovering over interactive elements
                if (containerRef.current) containerRef.current.style.cursor = "none"
                setShowBrushCursor(true)
            } else {
                // When hovering over interactive elements, hide brush cursor but keep 'none' cursor
                if (containerRef.current) containerRef.current.style.cursor = "none"
                setShowBrushCursor(false)
            }
            setShowEraserCursor(false)
            setShowLiquifyCursor(false)
            setShowBlurCursor(false)
        } else if (activeTool?.type === "eraser") {
            if (!isHoveringInteractiveElement) {
                if (containerRef.current) containerRef.current.style.cursor = "none"
                setShowEraserCursor(true)
            } else {
                if (containerRef.current) containerRef.current.style.cursor = "none"
                setShowEraserCursor(false)
            }
            setShowBrushCursor(false)
            setShowLiquifyCursor(false)
            setShowBlurCursor(false)
        } else if (activeTool?.type === "liquify") {
            if (!isHoveringInteractiveElement && selectedLiquifyImageId) {
                if (containerRef.current) containerRef.current.style.cursor = "none"
                setShowLiquifyCursor(true)
            } else {
                if (containerRef.current) containerRef.current.style.cursor = "default"
                setShowLiquifyCursor(false)
            }
            setShowBrushCursor(false)
            setShowEraserCursor(false)
            setShowBlurCursor(false)
        } else if (activeTool?.type === "blur") {
            if (!isHoveringInteractiveElement && selectedBlurImageId) {
                if (containerRef.current) containerRef.current.style.cursor = "none"
                setShowBlurCursor(true)
            } else {
                if (containerRef.current) containerRef.current.style.cursor = "default"
                setShowBlurCursor(false)
            }
            setShowBrushCursor(false)
            setShowEraserCursor(false)
            setShowLiquifyCursor(false)
        } else {
            // For cursor and text tools, and default case - use centralized function
            setCursorBasedOnTool()
            setShowBrushCursor(false)
            setShowEraserCursor(false)
            setShowLiquifyCursor(false)
            setShowBlurCursor(false)
        }

        if (isDragging.current) {
            if (activeTool?.type === "hand" && e.buttons === 1) {
                // Handle dragging for hand tool
                isManuallyDragging.current = true
                handManager.processPanning(e.clientX, e.clientY)
            } else if (e.buttons === 4 && activeTool?.type !== "brush" && activeTool?.type !== "eraser") {
                // Middle mouse button drag for other tools
                isManuallyDragging.current = true
                const dx = e.clientX - lastMousePosition.current.x
                const dy = e.clientY - lastMousePosition.current.y

                const newX = stagePosition.x + dx
                const newY = stagePosition.y + dy

                setStagePosition({ x: newX, y: newY })
            } else if (
                (activeTool?.type === "brush" || activeTool?.type === "eraser") &&
                (e.buttons === 1 || e.buttons === 2) &&
                drawingManager.getIsDrawing()
            ) {
                drawingManager.continueDrawing({ x: mouseX, y: mouseY })
            }
        }
        lastMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
        // Force reset cursor to default when leaving canvas area, unless Hand tool is active
        if (containerRef.current) {
            if (activeTool?.type === "hand") {
                handManager.setCursor()
            } else {
                containerRef.current.style.cursor = "default"
            }
        }

        if (drawingManager.getIsDrawing()) drawingManager.endDrawing()
        if (liquifyManager.getIsLiquifying()) liquifyManager.endLiquify()
        if (blurManager.getIsBlurring()) blurManager.endBlurring()

        // Reset element creation state
        if (isCreatingElement) {
            setIsCreatingElement(false)
            setCreationStartPoint(null)
            setPreviewElement(null)
        }

        setShowBrushCursor(false)
        setShowEraserCursor(false)
        setShowLiquifyCursor(false)
        setShowBlurCursor(false)
        setCursorPositionOnCanvas(null)

        if (isDragging.current || isManuallyDragging.current) {
            if (activeTool?.type === "hand") {
                handManager.endPanning()
            } else {
                applyPositionConstraints()
            }
        }
        isDragging.current = false
        isManuallyDragging.current = false
        setIsHoveringInteractiveElement(false)
    }

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!containerRef.current || !stageRef.current) return
        const evt = e.evt
        const stage = stageRef.current
        const pointerPosition = stage.getPointerPosition()

        if (!pointerPosition) return

        if (isAddModeActive && currentAddToolType && activeTool) {
            let creationType: ShapeType | "text" | "custom-image" | null = null

            if (activeTool.type === "text" && currentAddToolType === "text") {
                creationType = "text"
            } else if (activeTool.type === "shape") {
                if (currentAddToolType !== "brush" && currentAddToolType !== "eraser" && currentAddToolType !== "text") {
                    creationType = currentAddToolType as ShapeType | "custom-image"
                }
            }

            if (creationType) {
                // Start creating element by dragging instead of immediate creation
                setIsCreatingElement(true)
                setCreationStartPoint(pointerPosition)
                isDragging.current = true

                // Create preview element
                const previewId = `preview-${Date.now()}`
                const minSize = 20

                let previewElementData: ElementData
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
                    }
                } else if (creationType === "custom-image") {
                    const imageElement = activeElement as ElementData & {
                        src?: string
                        width?: number
                        height?: number
                    }
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
                    }
                } else {
                    // Shape elements
                    const shapeFillColor = fillColor === "transparent" ? undefined : fillColor || "#ffffff"
                    const shapeFillOpacity = fillColorOpacity || 100

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
                        cornerRadius: creationType === "rounded-rectangle" ? cornerRadius || 0 : undefined,
                        opacity: 100,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        draggable: true,
                        preserveAspectRatio: true,
                    }
                }

                setPreviewElement(previewElementData)
                return
            }
        }

        if (activeTool?.type === "brush" || activeTool?.type === "eraser") {
            if ((activeTool.type === "brush" && !isBrushTransformModeActive) || activeTool.type === "eraser") {
                // Universal deselection logic for drawing tools - deselect all objects when starting to draw
                let hasDeselectedSomething = false

                // Deselect elements (shapes, text, images)
                if (elementsManager.selectedElementId) {
                    elementsManager.setSelectedElementId(null)
                    hasDeselectedSomething = true
                }

                // Deselect brush lines when using eraser (brush lines should remain selected when drawing with brush)
                if (selectedLineId && activeTool.type === "eraser") {
                    setSelectedLineId(null)
                    hasDeselectedSomething = true
                }

                // Update cursor only if something was deselected
                if (hasDeselectedSomething) {
                    setCursorBasedOnTool()
                }

                isDragging.current = true
                const isRightClick = evt.button === 2
                if (activeTool?.type === "brush") {
                    drawingManager.startDrawing("brush", pointerPosition, isRightClick)
                } else if (activeTool?.type === "eraser") {
                    drawingManager.startDrawing("eraser", pointerPosition)
                }
            }
            return
        }

        if (activeTool?.type === "liquify") {
            if (evt.button === 0 && selectedLiquifyImageId) {
                // Universal deselection logic for liquify tool
                let hasDeselectedSomething = false

                // Deselect elements (shapes, text, images)
                if (elementsManager.selectedElementId) {
                    elementsManager.setSelectedElementId(null)
                    hasDeselectedSomething = true
                }

                // Deselect brush lines
                if (selectedLineId) {
                    setSelectedLineId(null)
                    hasDeselectedSomething = true
                }

                // Update cursor only if something was deselected
                if (hasDeselectedSomething) {
                    setCursorBasedOnTool()
                }

                liquifyManager.startLiquify(e)
            } else if (evt.button === 0) {
                console.warn("Liquify: No image")
            }
        }

        if (activeTool?.type === "blur") {
            if (evt.button === 0 && selectedBlurImageId) {
                // Universal deselection logic for blur tool
                let hasDeselectedSomething = false

                // Deselect elements (shapes, text, images)
                if (elementsManager.selectedElementId) {
                    elementsManager.setSelectedElementId(null)
                    hasDeselectedSomething = true
                }

                // Deselect brush lines
                if (selectedLineId) {
                    setSelectedLineId(null)
                    hasDeselectedSomething = true
                }

                // Update cursor only if something was deselected
                if (hasDeselectedSomething) {
                    setCursorBasedOnTool()
                }

                blurManager.startBlurring(e)
            } else if (evt.button === 0) {
                console.warn("Blur: No image")
            }
        }

        if (activeTool?.type === "liquify" || activeTool?.type === "blur") {
            if (evt.button === 0) evt.preventDefault()
        }

        // Skip hand tool as it's handled at container level
        if (activeTool?.type === "hand") {
            return
        }

        const target = e.target
        const clickedOnStageBackground = target === stageRef.current || target.name() === "background"

        if (clickedOnStageBackground) {
            // Universal deselection logic - deselect all types of objects when clicking on background
            let hasDeselectedSomething = false

            // Deselect elements (shapes, text, images)
            if (elementsManager.selectedElementId) {
                elementsManager.setSelectedElementId(null)
                hasDeselectedSomething = true
            }

            // Deselect brush lines
            if (selectedLineId) {
                setSelectedLineId(null)
                hasDeselectedSomething = true
            }

            // Update cursor only if something was deselected
            if (hasDeselectedSomething) {
                setCursorBasedOnTool()
            }

            if (evt.button === 1) {
                isDragging.current = true
                isManuallyDragging.current = true
                // Middle mouse button always shows grabbing cursor regardless of active tool
                if (containerRef.current) containerRef.current.style.cursor = "grabbing"
            }
            return
        }

        if (evt.button === 1) {
            isDragging.current = true
            isManuallyDragging.current = true
            // Middle mouse button always shows grabbing cursor regardless of active tool
            if (containerRef.current) containerRef.current.style.cursor = "grabbing"
        }
    }

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent> | React.MouseEvent<HTMLDivElement>) => {
        if ("evt" in e) {
            const stage = stageRef.current
            const position = stage?.getPointerPosition()
            if (!position) return

            // Force crosshair cursor for add mode even in stage mouse move
            if (isAddModeActive && (activeTool?.type === "shape" || activeTool?.type === "text") && stage) {
                const stageContainer = stage.container()
                if (stageContainer) {
                    stageContainer.style.cursor = "crosshair"
                    const canvasElement = stageContainer.querySelector("canvas")
                    if (canvasElement) {
                        canvasElement.style.cursor = "crosshair"
                    }
                }
            }

            // Handle element creation dragging
            if (isCreatingElement && creationStartPoint && previewElement) {
                const startX = Math.min(creationStartPoint.x, position.x)
                const startY = Math.min(creationStartPoint.y, position.y)
                const endX = Math.max(creationStartPoint.x, position.x)
                const endY = Math.max(creationStartPoint.y, position.y)

                let newWidth = Math.max(20, endX - startX) // Minimum 20px
                let newHeight = Math.max(20, endY - startY) // Minimum 20px

                if (previewElement.type === "square") {
                    const size = Math.max(newWidth, newHeight)
                    newWidth = size
                    newHeight = size
                }

                const updatedPreview: ElementData = {
                    ...previewElement,
                    x: startX,
                    y: startY,
                    width: newWidth,
                    height: newHeight,
                }

                setPreviewElement(updatedPreview)
                return
            }

            if (position && isDragging.current && drawingManager.getIsDrawing()) {
                drawingManager.continueDrawing(position)
            }

            if (activeTool?.type === "liquify" && liquifyManager.getIsLiquifying() && selectedLiquifyImageId) {
                setCursorPositionOnCanvas({ x: position.x, y: position.y })
                liquifyManager.processLiquify(e)
            }
            if (activeTool?.type === "blur" && blurManager.getIsBlurring() && selectedBlurImageId) {
                setCursorPositionOnCanvas({ x: position.x, y: position.y })
                blurManager.processBlurring(e)
            }
        }
    }

    const handleMouseUp = () => {
        // Element creation
        if (
            isCreatingElement &&
            creationStartPoint &&
            previewElement &&
            (activeTool?.type === "shape" || activeTool?.type === "text")
        ) {
            const creationType = currentAddToolType
            if (creationType && creationType !== "brush" && creationType !== "eraser") {
                const settings: Partial<ElementData> = {
                    width: previewElement.width,
                    height: previewElement.height,
                }

                if (creationType === "text") {
                    settings.text = previewElement.text || "Type text here..."
                }

                elementsManager.addElement(
                    creationType,
                    { x: previewElement.x, y: previewElement.y },
                    creationType === "text" ? previewElement.text : undefined,
                    settings,
                )
            }

            // Reset creation state
            setIsCreatingElement(false)
            setCreationStartPoint(null)
            setPreviewElement(null)
            setIsAddModeActive(false)
            setCurrentAddToolType(null)
            isDragging.current = false

            // Reset cursor after element creation
            setCursorBasedOnTool()
            return
        }

        if (drawingManager.getIsDrawing()) {
            drawingManager.endDrawing()
        }
        if (liquifyManager.getIsLiquifying()) {
            liquifyManager.endLiquify()
        }
        if (blurManager.getIsBlurring()) {
            blurManager.endBlurring()
        }

        if (isDragging.current) {
            isDragging.current = false
            if (activeTool?.type === "hand") {
                handManager.endPanning()
            }

            if (isManuallyDragging.current) {
                setTimeout(() => {
                    if (activeTool?.type !== "hand") {
                        applyPositionConstraints()
                    }
                    isManuallyDragging.current = false
                    // Use centralized cursor function to set appropriate cursor
                    setCursorBasedOnTool()
                }, 50)
            } else {
                // For element dragging, immediately set appropriate cursor
                setTimeout(() => {
                    setCursorBasedOnTool()
                }, 10)
            }
        } else {
            // Always ensure cursor is set correctly even if not dragging
            setTimeout(() => {
                setCursorBasedOnTool()
            }, 10)
        }
    }

    const applyPositionConstraints = () => {
        if (!contextStageSize || !containerSize) return

        const scaleValue = zoom / 100
        const scaledContentWidth = contextStageSize.width * scaleValue
        const scaledContentHeight = contextStageSize.height * scaleValue
        const containerWidth = containerSize.width
        const containerHeight = containerSize.height

        let newX = stagePosition.x
        let newY = stagePosition.y

        if (scaledContentWidth > containerWidth) {
            newX = Math.max(containerWidth - scaledContentWidth, Math.min(0, stagePosition.x))
        } else {
            newX = (containerWidth - scaledContentWidth) / 2
        }

        if (scaledContentHeight > containerHeight) {
            newY = Math.max(containerHeight - scaledContentHeight, Math.min(0, stagePosition.y))
        } else {
            newY = (containerHeight - scaledContentHeight) / 2
        }

        if (newX !== stagePosition.x || newY !== stagePosition.y) {
            setStagePosition({ x: newX, y: newY })
        }
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        return false
    }

    const currentDisplayScale = zoom / 100

    useEffect(() => {
        if (triggerApplyCrop) {
            croppingManager.applyCrop()
        }
    }, [triggerApplyCrop, croppingManager])

    const handleSetStagePositionFromMiniMap = useCallback(
        (coords: { x: number; y: number }, type: "center" | "drag") => {
            if (!stageRef.current || !contextStageSize || !containerRef.current) return
            const currentScale = zoom / 100
            const { width: stageWidth, height: stageHeight } = contextStageSize
            const { clientWidth: containerWidth, clientHeight: containerHeight } = containerRef.current
            let newStageX = stagePosition.x
            let newStageY = stagePosition.y
            if (type === "center") {
                const targetCanvasX = coords.x * stageWidth
                const targetCanvasY = coords.y * stageHeight
                newStageX = containerWidth / 2 - targetCanvasX * currentScale
                newStageY = containerHeight / 2 - targetCanvasY * currentScale
            } else if (type === "drag") {
                newStageX = -coords.x * stageWidth * currentScale
                newStageY = -coords.y * stageHeight * currentScale
            }
            const scaledContentWidth = stageWidth * currentScale
            const scaledContentHeight = stageHeight * currentScale
            if (scaledContentWidth > containerWidth) {
                newStageX = Math.max(containerWidth - scaledContentWidth, Math.min(0, newStageX))
            } else {
                newStageX = (containerWidth - scaledContentWidth) / 2
            }
            if (scaledContentHeight > containerHeight) {
                newStageY = Math.max(containerHeight - scaledContentHeight, Math.min(0, newStageY))
            } else {
                newStageY = (containerHeight - scaledContentHeight) / 2
            }
            setStagePosition({ x: newStageX, y: newStageY })
        },
        [contextStageSize, zoom, stagePosition, containerRef, setStagePosition],
    )

    useEffect(() => {
        if (registerStagePositionUpdater) {
            registerStagePositionUpdater(handleSetStagePositionFromMiniMap)
        }
    }, [registerStagePositionUpdater, handleSetStagePositionFromMiniMap])

    useEffect(() => {
        if (registerRenderableObjectsRestorer) {
            registerRenderableObjectsRestorer(setRenderableObjects)
        }
    }, [registerRenderableObjectsRestorer, setRenderableObjects])

    useEffect(() => {
        if (stageRef.current && contextStageSize && containerRef.current) {
            try {
                const canvasWidth = contextStageSize.width
                const canvasHeight = contextStageSize.height
                const viewPortWidth = containerRef.current.clientWidth
                const viewPortHeight = containerRef.current.clientHeight
                const visibleXOnCanvas = -stagePosition.x / currentDisplayScale
                const visibleYOnCanvas = -stagePosition.y / currentDisplayScale
                const visibleWidthOnCanvas = viewPortWidth / currentDisplayScale
                const visibleHeightOnCanvas = viewPortHeight / currentDisplayScale
                const relX = Math.max(0, Math.min(1, visibleXOnCanvas / canvasWidth))
                const relY = Math.max(0, Math.min(1, visibleYOnCanvas / canvasHeight))
                const relWidth = Math.max(0, Math.min(1, visibleWidthOnCanvas / canvasWidth))
                const relHeight = Math.max(0, Math.min(1, visibleHeightOnCanvas / canvasHeight))
                setVisibleCanvasRectOnMiniMap({
                    x: relX,
                    y: relY,
                    width: relWidth,
                    height: relHeight,
                })
            } catch (error) {
                console.warn("Error updating minimap viewport position:", error)
                setVisibleCanvasRectOnMiniMap(null)
            }
        } else {
            setVisibleCanvasRectOnMiniMap(null)
        }
    }, [zoom, stagePosition, contextStageSize, containerSize, setVisibleCanvasRectOnMiniMap, currentDisplayScale])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (stageRef.current && contextStageSize && containerRef.current) {
                try {
                    const canvasArea = contextStageSize.width * contextStageSize.height
                    let pixelRatio = 0.3

                    if (canvasArea > 2000000) {
                        pixelRatio = 0.2
                    } else if (canvasArea > 5000000) {
                        pixelRatio = 0.15
                    } else if (canvasArea < 500000) {
                        pixelRatio = 0.4
                    }

                    const dataURL = stageRef.current.toDataURL({
                        pixelRatio: pixelRatio,
                        quality: 0.85,
                        mimeType: "image/png",
                    })
                    setMiniMapDataURL(dataURL)
                    setMiniMapDataURLState(dataURL)
                } catch (error) {
                    setMiniMapDataURL(null)
                    setMiniMapDataURLState(null)
                }
            } else {
                setMiniMapDataURL(null)
                setMiniMapDataURLState(null)
            }
        }, 100)

        return () => clearTimeout(timeoutId)
    }, [renderableObjects, backgroundImage, contextStageSize, setMiniMapDataURL])

    const trRef = useRef<Konva.Transformer>(null)
    const [selectedKonvaNode, setSelectedKonvaNode] = useState<Konva.Node | null>(null)

    useEffect(() => {
        if (selectedLineId && stageRef.current && isBrushTransformModeActive && activeTool?.type === "brush") {
            const node = stageRef.current.findOne("." + selectedLineId) // Konva selector by name/id
            if (node) {
                setSelectedKonvaNode(node)
            } else {
                setSelectedKonvaNode(null)
            }
        } else {
            setSelectedKonvaNode(null)
        }
    }, [selectedLineId, isBrushTransformModeActive, activeTool, renderableObjects])

    useEffect(() => {
        if (selectedKonvaNode && trRef.current) {
            trRef.current.nodes([selectedKonvaNode])
            trRef.current.getLayer()?.batchDraw()

            // Configuration similar to ElementRenderer's Transformer
            trRef.current.keepRatio(true) // Ensure aspect ratio is maintained
            trRef.current.rotationSnaps([0, 45, 90, 135, 180, 225, 270, 315])
            trRef.current.rotationSnapTolerance(5) // Tolerance for rotation snapping
            trRef.current.rotateAnchorOffset(30) // Distance of rotation anchor from shape
            trRef.current.borderDash([3, 3]) // Dashed border for transformer
            trRef.current.anchorStroke("#0096FF") // Anchor stroke color
            trRef.current.anchorFill("#FFFFFF") // Anchor fill color
            trRef.current.anchorSize(8) // Size of anchors
            trRef.current.borderStroke("#0096FF") // Transformer border color
            trRef.current.padding(2) // Padding around the node

            trRef.current.enabledAnchors([
                "top-left",
                "top-center",
                "top-right",
                "middle-left",
                "middle-right",
                "bottom-left",
                "bottom-center",
                "bottom-right",
            ])

            // Bound box function to enforce minimum size
            trRef.current.boundBoxFunc((oldBox, newBox) => {
                const minSize = 20
                newBox.width = Math.max(minSize, newBox.width)
                newBox.height = Math.max(minSize, newBox.height)

                if (trRef.current?.keepRatio()) {
                    const aspectRatio = oldBox.width / oldBox.height
                    if (Math.abs(newBox.width / newBox.height - aspectRatio) > 1e-2) {
                        const widthChangedMore = Math.abs(newBox.width - oldBox.width) > Math.abs(newBox.height - oldBox.height)
                        if (widthChangedMore) {
                            newBox.height = newBox.width / aspectRatio
                        } else {
                            newBox.width = newBox.height * aspectRatio
                        }
                    }
                }
                return newBox
            })
        } else if (trRef.current) {
            trRef.current.nodes([]) // Clear nodes if none selected
            trRef.current.getLayer()?.batchDraw()
        }
    }, [selectedKonvaNode])

    const elementsManagerHook = useElementsManager()

    return (
        <div
            className="w-full h-full bg-[#171719FF] overflow-hidden relative"
            ref={containerRef}
            onMouseMove={handleMouseMoveOnContainer}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseDown={(e) => {
                if (activeTool?.type === "cursor") {
                    handleMouseDown({ evt: e } as any)
                } else if (activeTool?.type === "hand" && e.button === 0) {
                    // For hand tool, handle mousedown directly on container
                    isDragging.current = true
                    isManuallyDragging.current = true
                    handManager.startPanning(e.clientX, e.clientY)
                    e.preventDefault()
                }
            }}
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
                {((activeTool?.type === "brush" && brushMirrorMode !== "None") ||
                    (activeTool?.type === "eraser" && eraserMirrorMode !== "None")) && (
                        <div
                            className="absolute top-0 left-0 pointer-events-none"
                            style={{
                                width: contextStageSize?.width ?? 0,
                                height: contextStageSize?.height ?? 0,
                                zIndex: 500,
                            }}
                        >
                            {((activeTool?.type === "brush" && (brushMirrorMode === "Vertical" || brushMirrorMode === "Four-way")) ||
                                (activeTool?.type === "eraser" &&
                                    (eraserMirrorMode === "Vertical" || eraserMirrorMode === "Four-way"))) && (
                                    <div
                                        className="absolute top-0 bottom-0 border-dashed border-l border-white/40"
                                        style={{
                                            left: (contextStageSize?.width ?? 0) / 2,
                                            height: "100%",
                                        }}
                                    />
                                )}
                            {((activeTool?.type === "brush" && (brushMirrorMode === "Horizontal" || brushMirrorMode === "Four-way")) ||
                                (activeTool?.type === "eraser" &&
                                    (eraserMirrorMode === "Horizontal" || eraserMirrorMode === "Four-way"))) && (
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
                    stageContainer={stageRef.current?.container()}
                    activeTool={activeTool}
                    isBrushTransformModeActive={isBrushTransformModeActive}
                />
                <EraserCursor
                    size={eraserSize}
                    isVisible={showEraserCursor}
                    position={cursorPositionOnCanvas}
                    stageContainer={stageRef.current?.container()}
                    activeTool={activeTool}
                />
                <LiquifyCursor
                    isVisible={showLiquifyCursor}
                    position={cursorPositionOnCanvas}
                    stageContainer={stageRef.current?.container()}
                />
                <BlurCursor
                    isVisible={showBlurCursor}
                    position={cursorPositionOnCanvas}
                    stageContainer={stageRef.current?.container()}
                />

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
                            name="background background-pattern"
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

                    {/* Render objects with individual layers for each brush line */}
                    {(() => {
                        const layers: React.ReactNode[] = []
                        const allErasers = renderableObjects.filter((obj) => "tool" in obj && obj.tool === "eraser") as LineData[]

                        renderableObjects.forEach((obj, index) => {
                            if ("tool" in obj && obj.tool === "brush") {
                                const line = obj as LineData

                                // Find all erasers that come AFTER this brush line in the array
                                const erasersAfterThisLine = allErasers.filter((eraser) => {
                                    const eraserIndex = renderableObjects.findIndex((o) => "id" in o && o.id === eraser.id)
                                    return eraserIndex > index
                                })

                                // Create individual layer for each brush line
                                layers.push(
                                    <Layer key={`brush-line-${line.id}`} perfectDrawEnabled={false}>
                                        <Group>
                                            {/* Render the brush line */}
                                            <KonvaLine
                                                key={line.id}
                                                points={line.points}
                                                stroke={line.color}
                                                strokeWidth={line.strokeWidth}
                                                tension={0.5}
                                                lineCap="round"
                                                lineJoin="round"
                                                opacity={line.opacity}
                                                globalCompositeOperation="source-over"
                                                x={(line as any).x ?? 0}
                                                y={(line as any).y ?? 0}
                                                rotation={(line as any).rotation ?? 0}
                                                scaleX={(line as any).scaleX ?? 1}
                                                scaleY={(line as any).scaleY ?? 1}
                                                offsetX={(line as any).offsetX ?? 0}
                                                offsetY={(line as any).offsetY ?? 0}
                                                listening={isBrushTransformModeActive && activeTool?.type === "brush"}
                                                name={line.id}
                                                draggable={
                                                    isBrushTransformModeActive &&
                                                    activeTool?.type === "brush" &&
                                                    !!(line as any).offsetX &&
                                                    !!(line as any).offsetY
                                                }
                                                onDragEnd={(e) => {
                                                    if (isBrushTransformModeActive && activeTool?.type === "brush") {
                                                        if ((line as any).offsetX !== undefined && (line as any).offsetY !== undefined) {
                                                            drawingManager.updateLinePositionAndHistory(line.id, e.target.x(), e.target.y())
                                                        }
                                                        // Reset cursor to default when dragging ends
                                                        if (containerRef.current) {
                                                            containerRef.current.style.cursor = "default"
                                                        }
                                                        const stage = stageRef.current
                                                        if (stage) {
                                                            const stageContainer = stage.container()
                                                            if (stageContainer) {
                                                                stageContainer.style.cursor = "default"
                                                                const canvasElement = stageContainer.querySelector("canvas")
                                                                if (canvasElement) {
                                                                    canvasElement.style.cursor = "default"
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    if (isBrushTransformModeActive && activeTool?.type === "brush") {
                                                        e.cancelBubble = true
                                                        if (!(line as any).offsetX && !(line as any).offsetY) {
                                                            drawingManager.prepareLineForTransform(line.id)
                                                        }
                                                        setSelectedLineId(line.id)
                                                        const node = stageRef.current?.findOne("." + line.id)
                                                        if (node) setSelectedKonvaNode(node)
                                                    }
                                                }}
                                                onTap={(e) => {
                                                    if (isBrushTransformModeActive && activeTool?.type === "brush") {
                                                        e.cancelBubble = true
                                                        if (!(line as any).offsetX && !(line as any).offsetY) {
                                                            drawingManager.prepareLineForTransform(line.id)
                                                        }
                                                        setSelectedLineId(line.id)
                                                        const node = stageRef.current?.findOne("." + line.id)
                                                        if (node) setSelectedKonvaNode(node)
                                                    }
                                                }}
                                                onMouseEnter={() => {
                                                    if (
                                                        isBrushTransformModeActive &&
                                                        activeTool?.type === "brush" &&
                                                        selectedLineId === line.id
                                                    ) {
                                                        // Set move cursor when hovering over selected brush object
                                                        if (containerRef.current) {
                                                            containerRef.current.style.cursor = "move"
                                                        }
                                                        const stage = stageRef.current
                                                        if (stage) {
                                                            const stageContainer = stage.container()
                                                            if (stageContainer) {
                                                                stageContainer.style.cursor = "move"
                                                                const canvasElement = stageContainer.querySelector("canvas")
                                                                if (canvasElement) {
                                                                    canvasElement.style.cursor = "move"
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                                onMouseLeave={() => {
                                                    if (isBrushTransformModeActive && activeTool?.type === "brush") {
                                                        // Reset to default cursor when leaving brush object
                                                        if (containerRef.current) {
                                                            containerRef.current.style.cursor = "default"
                                                        }
                                                        const stage = stageRef.current
                                                        if (stage) {
                                                            const stageContainer = stage.container()
                                                            if (stageContainer) {
                                                                stageContainer.style.cursor = "default"
                                                                const canvasElement = stageContainer.querySelector("canvas")
                                                                if (canvasElement) {
                                                                    canvasElement.style.cursor = "default"
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                                onDragStart={() => {
                                                    if (isBrushTransformModeActive && activeTool?.type === "brush") {
                                                        // Set grabbing cursor when dragging starts
                                                        if (containerRef.current) {
                                                            containerRef.current.style.cursor = "grabbing"
                                                        }
                                                        const stage = stageRef.current
                                                        if (stage) {
                                                            const stageContainer = stage.container()
                                                            if (stageContainer) {
                                                                stageContainer.style.cursor = "grabbing"
                                                                const canvasElement = stageContainer.querySelector("canvas")
                                                                if (canvasElement) {
                                                                    canvasElement.style.cursor = "grabbing"
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />

                                            {/* Apply only erasers that came after this brush line */}
                                            {erasersAfterThisLine.map((eraserLine) => (
                                                <KonvaLine
                                                    key={`eraser-${eraserLine.id}-for-${line.id}`}
                                                    points={eraserLine.points}
                                                    stroke="#ffffff"
                                                    strokeWidth={eraserLine.strokeWidth}
                                                    tension={0.5}
                                                    lineCap="round"
                                                    lineJoin="round"
                                                    opacity={eraserLine.opacity}
                                                    globalCompositeOperation="destination-out"
                                                    x={(eraserLine as any).x ?? 0}
                                                    y={(eraserLine as any).y ?? 0}
                                                    rotation={(eraserLine as any).rotation ?? 0}
                                                    scaleX={(eraserLine as any).scaleX ?? 1}
                                                    scaleY={(eraserLine as any).scaleY ?? 1}
                                                    offsetX={(eraserLine as any).offsetX ?? 0}
                                                    offsetY={(eraserLine as any).offsetY ?? 0}
                                                    listening={false}
                                                />
                                            ))}
                                        </Group>
                                    </Layer>,
                                )
                            } else if ("tool" in obj && obj.tool === "eraser") {
                                // Eraser lines are handled above, so skip them here
                                return
                            } else {
                                // Render elements (shapes, text, images)
                                const element = obj as ElementData
                                layers.push(
                                    <Layer key={`element-${element.id}`} perfectDrawEnabled={false}>
                                        <ElementRenderer
                                            key={element.id}
                                            element={element}
                                            onDragEnd={(id, newX, newY) => elementsManager.handleDragEnd(id, newX, newY)}
                                            onClick={(id, KonvaE) => elementsManager.handleElementClick(id, KonvaE)}
                                            onTextEdit={(id, newText) => elementsManager.updateTextElement(id, newText)}
                                            onTransform={(id, attrs) => elementsManager.updateElement(id, attrs as Partial<ElementData>)}
                                            isSelected={element.id === elementsManager.selectedElementId}
                                            isHovered={element.id === hoveredElementId}
                                            allElements={elementsManagerHook.getElementDataFromRenderables()}
                                            stageSize={
                                                contextStageSize
                                                    ? { width: contextStageSize.width, height: contextStageSize.height }
                                                    : undefined
                                            }
                                            setActiveSnapLines={setActiveSnapLines}
                                            onHoverInteractiveElement={setIsHoveringInteractiveElement}
                                        />
                                    </Layer>,
                                )
                            }
                        })

                        return layers
                    })()}

                    {/* UI Layer for tools */}
                    <Layer perfectDrawEnabled={false}>
                        {/* Render preview element during creation */}
                        {previewElement && (
                            <ElementRenderer
                                key={previewElement.id}
                                element={{ ...previewElement, opacity: 0.6 }}
                                isSelected={false}
                                isHovered={false}
                                allElements={[]}
                                stageSize={
                                    contextStageSize ? { width: contextStageSize.width, height: contextStageSize.height } : undefined
                                }
                                setActiveSnapLines={() => { }}
                            />
                        )}

                        {/* Brush transformer */}
                        {selectedKonvaNode && isBrushTransformModeActive && activeTool?.type === "brush" && (
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
                                        })
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

                    {/* UI Elements Layer - always on top */}
                    <Layer perfectDrawEnabled={false}>
                        {/* Crop tool - always on top */}
                        <CropTool
                            stageSize={contextStageSize}
                            scale={currentDisplayScale}
                            cropRectRef={croppingManager.cropRectRef as any}
                            transformerRef={croppingManager.transformerRef as any}
                            handleCropRectDragEnd={croppingManager.handleCropRectDragEnd}
                            handleCropRectTransformEnd={croppingManager.handleCropRectTransformEnd}
                        />

                        {/* Snap lines - always on top */}
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
                style={{ zIndex: 1000 }}
            >
                <span>
                    {contextStageSize ? formatDimensionDisplay(contextStageSize.width) : "0"} x{" "}
                    {contextStageSize ? formatDimensionDisplay(contextStageSize.height) : "0"} |
                    <button
                        onClick={handleZoomOutClick}
                        className="cursor-pointer px-1.5 ml-1 mr-1 hover:bg-white/20 rounded"
                        aria-label="Zoom out"
                        tabIndex={0}
                    >
                        -
                    </button>
                    {zoom}%
                    <button
                        onClick={handleZoomInClick}
                        className="cursor-pointer px-1 ml-1 hover:bg-white/20 rounded"
                        aria-label="Zoom in"
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
    )
}

export default Canvas
