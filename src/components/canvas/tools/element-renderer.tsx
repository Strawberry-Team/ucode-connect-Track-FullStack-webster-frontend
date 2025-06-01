import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Rect, Circle, RegularPolygon, Star, Line, Text, Group, Transformer, Image as KonvaImage } from "react-konva";
import type { ElementData, TextCase, BorderStyle, ShapeType } from "@/types/canvas";
import Konva from "konva";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTool } from "@/context/tool-context";
import { getSnappingGuides, type BoxProps, type SnapLine as SnapLineType } from "@/hooks/use-snapping.ts";

interface ElementRendererProps {
    element: ElementData;
    onDragEnd?: (id: string, newX: number, newY: number) => void;
    onClick?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
    onTextEdit?: (id: string, newText: string) => void;
    onTransform?: (id: string, newAttrs: Partial<ElementData>) => void;
    isSelected?: boolean;
    allElements: ElementData[];
    stageSize?: { width: number; height: number };
    setActiveSnapLines: React.Dispatch<React.SetStateAction<SnapLineType[]>>;
    onHoverInteractiveElement?: (isHovering: boolean) => void;
}

// Function for applying case to text
const applyTextCase = (text: string, textCase: TextCase = "none"): string => {
    switch (textCase) {
        case "uppercase":
            return text.toUpperCase();
        case "lowercase":
            return text.toLowerCase();
        case "capitalize":
            return text.split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
        case "none":
        default:
            return text;
    }
};

// Function for getting font style
const getFontStyle = (element: ElementData): string => {
    const fontStyles = element.fontStyles || { bold: false, italic: false, underline: false, strikethrough: false };
    const styles = [];

    if (fontStyles.bold) styles.push("bold");
    if (fontStyles.italic) styles.push("italic");

    return styles.join(" ");
};

// Function for getting text decoration
const getTextDecoration = (element: ElementData): string => {
    const fontStyles = element.fontStyles || { bold: false, italic: false, underline: false, strikethrough: false };
    const decorations = [];

    if (fontStyles.underline) decorations.push("underline");
    if (fontStyles.strikethrough) decorations.push("line-through");

    return decorations.join(" ");
};

// Function to get border/stroke style
const getBorderStyleProperties = (borderStyle: BorderStyle = "solid", borderWidth: number = 1): { dash?: number[], dashEnabled?: boolean } => {
    switch (borderStyle) {
        case "dashed":
            return { dash: [borderWidth * 3, borderWidth * 2], dashEnabled: true };
        case "dotted":
            return { dash: [borderWidth, borderWidth], dashEnabled: true };
        case "hidden":
        case "solid":
        case "double":
        default:
            return { dashEnabled: false };
    }
};

// Helper function to convert hex/rgb/named color and opacity (0-100) to RGBA string
const convertColorToRGBA = (color: string | undefined, opacityPercent: number | undefined): string => {
    if (color === undefined || color === 'transparent') {
        return 'rgba(0,0,0,0)'; // Or handle as fully transparent or default
    }
    if (opacityPercent === undefined) {
        return color; // No opacity change
    }

    const opacity = Math.max(0, Math.min(100, opacityPercent)) / 100;

    // Use Konva's parser if available, otherwise a simpler one
    if (window.Konva && window.Konva.Util) {
        const parsed = window.Konva.Util.getRGB(color);
        return `rgba(${parsed.r},${parsed.g},${parsed.b},${opacity})`;
    } else {
        // Basic fallback for hex (very simplified)
        let r = 0, g = 0, b = 0;
        if (color.startsWith('#')) {
            const hex = color.substring(1);
            if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
            } else if (hex.length === 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }
        }
        // This fallback doesn't handle named colors or rgb() strings well without Konva
        // For simplicity, if not hex, and Konva isn't there, it might not apply opacity correctly.
        // Consider a more robust color parsing library if Konva.Util is not guaranteed.
        if (r === 0 && g === 0 && b === 0 && !color.startsWith('#')) {
            // Could be a named color, return as is with warning or try to use a canvas context to parse
            console.warn("Basic color parser cannot derive RGB from named color without Konva: ", color);
            return color; // Or apply opacity if it's a CSS context that understands it.
        }
        return `rgba(${r},${g},${b},${opacity})`;
    }
};

const ElementRenderer: React.FC<ElementRendererProps> = ({
                                                             element,
                                                             onDragEnd,
                                                             onClick,
                                                             onTextEdit,
                                                             onTransform,
                                                             isSelected,
                                                             allElements,
                                                             stageSize,
                                                             setActiveSnapLines,
                                                             onHoverInteractiveElement
                                                         }) => {
    const { activeTool } = useTool();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(element.text || "");

    // Consolidate refs
    const nodeRef = useRef<Konva.Shape | Konva.Group | Konva.Text | null>(null);
    const transformerRef = useRef<Konva.Transformer | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const textNodeRef = useRef<Konva.Text | null>(null); // Ref for direct Konva.Text node access

    // Clean up textarea when component unmounts
    useEffect(() => {
        return () => {
            if (textAreaRef.current) {
                if (textAreaRef.current.parentNode) {
                    textAreaRef.current.parentNode.removeChild(textAreaRef.current);
                }
                textAreaRef.current = null;
            }
        };
    }, []);

    const canInteractWithElement = useCallback(() => {
        if (!activeTool) return true;
        if (activeTool.type === "cursor") return true;

        const elementType = element.type as ShapeType | "text" | "custom-image";

        if (elementType === "text") {
            return activeTool.type === "text";
        }
        if (elementType === "custom-image") {
            // Custom images can be selected with any tool except text tool
            return activeTool.type !== "text";
        }
        if (activeTool.type === "shape") {
            return true;
        }
        return false;
    }, [activeTool, element.type]);

    // Handle cursor change when element becomes selected
    // Removed useEffect that sets cursor to 'move' to avoid conflicts with canvas.tsx cursor logic

    useEffect(() => {
        if (isSelected && transformerRef.current && nodeRef.current && canInteractWithElement()) {
            const tr = transformerRef.current;
            const node = nodeRef.current; // This is the Group for text elements

            // Reset transformer first
            tr.detach();

            // Create a new configuration
            tr.nodes([node]);

            // Enable rotation for all elements
            tr.rotateEnabled(true);

            // Handle aspect ratio differently for different shapes
            if (element.type === 'rectangle'
                || element.type === 'text'
                || element.type === 'rounded-rectangle'
                || element.type === 'squircle'
                || element.type === 'line'
                || element.type === 'arrow') {
                // Allow rectangle, text, and rounded-rectangle to be freely resized without keeping aspect ratio
                tr.keepRatio(false);
            } else if (element.type === 'square') {
                // Square should always maintain 1:1 aspect ratio
                tr.keepRatio(true);
            } else {
                // Keep aspect ratio for other shapes (circles, polygons, star, heart, custom-image)
                tr.keepRatio(true);
            }

            // Enable all anchors
            tr.enabledAnchors([
                'top-left', 'top-center', 'top-right',
                'middle-left', 'middle-right',
                'bottom-left', 'bottom-center', 'bottom-right'
            ]);

            // Set rotation snapping
            tr.rotationSnaps([0, 45, 90, 135, 180, 225, 270, 315]);
            tr.rotationSnapTolerance(5);

            // Visual properties
            tr.borderDash([3, 3]);
            tr.anchorStroke('#0096FF');
            tr.anchorFill('#FFFFFF');
            tr.anchorSize(8);
            tr.borderStroke('#0096FF');

            // Adjust padding based on element type
            const paddingValue = 0;
            tr.padding(paddingValue);

            // Make rotation anchor more visible
            tr.rotateAnchorOffset(30);

            // Set minimum size and handle aspect ratio in boundBoxFunc if keepRatio is true
            const currentKeepRatio = tr.keepRatio();
            tr.boundBoxFunc((oldBox, newBox) => {
                newBox.width = Math.max(20, newBox.width);
                newBox.height = Math.max(20, newBox.height);

                if (element.type === 'square') {
                    const size = Math.max(newBox.width, newBox.height);
                    newBox.width = size;
                    newBox.height = size;
                  } else if (tr.keepRatio()) {
                    const aspectRatio = oldBox.width / oldBox.height;
                    const widthChangedMore = Math.abs(newBox.width - oldBox.width) > Math.abs(newBox.height - oldBox.height);
                    if (widthChangedMore) {
                      newBox.height = newBox.width / aspectRatio;
                    } else {
                      newBox.width = newBox.height * aspectRatio;
                    }
                  }
                  return newBox;
                });

            // Force redraw
            tr.getLayer()?.batchDraw();

            const handleContinuousTransform = () => {
                if (element.type === 'text' && node instanceof Konva.Group && textNodeRef.current) {
                    const groupNode = node as Konva.Group;
                    const konvaTextNode = textNodeRef.current;

                    const designWidth = element.width || 0;
                    const designHeight = element.height || 0;
                    const originalFontSize = element.fontSize || 16;

                    const groupScaleX = groupNode.scaleX();
                    const groupScaleY = groupNode.scaleY();

                    // Calculate new dimensions based on the group's scale
                    const newWidth = designWidth * Math.abs(groupScaleX);
                    const newHeight = designHeight * Math.abs(groupScaleY);

                    // Set the text node's attributes
                    konvaTextNode.setAttrs({
                        fontSize: originalFontSize, // Keep original font size
                        width: newWidth / Math.abs(groupScaleX), // Adjust width for text reflow
                        height: newHeight / Math.abs(groupScaleY), // Adjust height for text reflow
                        scaleX: 1,
                        scaleY: 1
                    });

                    // Force redraw
                    konvaTextNode.getLayer()?.batchDraw();
                }
            };

            tr.on('transform', handleContinuousTransform);

            // Cleanup listener when effect re-runs or component unmounts
            return () => {
                tr.off('transform', handleContinuousTransform);
            };

        } else if (transformerRef.current) {
            transformerRef.current.detach();
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected, element, canInteractWithElement]); // element contains fontSize, type etc.

    const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
        const node = e.target as Konva.Node;
        const type = element.type;
        const newElementX = node.x();
        const newElementY = node.y();
        const newRotation = node.rotation();

        let newDesignWidth: number;
        let newDesignHeight: number;

        if (type === 'text') {
            newDesignWidth = node.width() * node.scaleX();
            newDesignHeight = node.height() * node.scaleY();
        } else if (type === 'line' || type === 'arrow') {
            const lineNode = node as Konva.Line;
            const points = lineNode.points();
            if (points.length >= 4) {
                const dx = points[2] - points[0];
                const dy = points[3] - points[1];
                newDesignWidth = Math.abs(dx);
                newDesignHeight = Math.abs(dy);
            } else {
                newDesignWidth = element.width || 100;
                newDesignHeight = element.height || 10;
            }
        } else {
            newDesignWidth = Math.abs(node.width() * node.scaleX());
            newDesignHeight = Math.abs(node.height() * node.scaleY());
        }

        node.scaleX(1);
        node.scaleY(1);

        const newAttrs: Partial<ElementData> = {
            x: newElementX,
            y: newElementY,
            width: newDesignWidth,
            height: newDesignHeight,
            rotation: newRotation,
            scaleX: 1,
            scaleY: 1,
        };

        if (onTransform) {
            console.log(`Transform completed for ${element.id} (type: ${type}):`, {
                newDesignWidth, newDesignHeight, newElementX, newElementY, newRotation,
                nodePos: { x: node.x(), y: node.y() },
                nodeOffsets: { x: node.offsetX(), y: node.offsetY() },
                finalNodeScale: { x: node.scaleX(), y: node.scaleY() }, // Should reflect baseScaleX/Y
                element: {...element}
            });

            onTransform(element.id, newAttrs);
        }
        
        // Reset cursor to default after transform ends, but only if not Hand tool
        if (activeTool?.type !== 'hand') {
            const stage = nodeRef.current?.getStage();
            const container = stage?.container();
            if (container) {
                container.style.cursor = 'default';
            }
        }
    };

    const commonProps = {
        id: element.id,
        draggable: canInteractWithElement(),
        opacity: element.opacity ?? 1,
        stroke: element.borderColor,
        strokeWidth: element.borderStyle === 'hidden' ? 0 : element.borderWidth ?? 0,
        onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
            e.cancelBubble = true;
            onClick?.(element.id, e);
            if (element.type === "text" && activeTool?.type === "text" && !isEditing && canInteractWithElement()) {
                handleTextEdit(e);
            }
        },
        onDblClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (element.type === "text" && canInteractWithElement()) {
                handleTextEdit(e);
            }
        },
        onMouseEnter: () => {
            if (canInteractWithElement()) {
                onHoverInteractiveElement?.(true);
                // Only change cursor to move for cursor and text tools when element is selected
                // Don't change cursor if Hand tool is active
                if (activeTool?.type !== 'hand' && isSelected && (activeTool?.type === 'cursor' || (activeTool?.type === 'text' && element.type === 'text'))) {
                    const stage = nodeRef.current?.getStage();
                    const container = stage?.container();
                    if (container) {
                        container.style.cursor = 'move';
                    }
                }
            }
        },
        onMouseLeave: () => {
            if (canInteractWithElement()) {
                onHoverInteractiveElement?.(false);
                // Reset cursor to default when leaving element, but only if not Hand tool
                if (activeTool?.type !== 'hand') {
                    const stage = nodeRef.current?.getStage();
                    const container = stage?.container();
                    if (container) {
                        container.style.cursor = 'default';
                    }
                }
            }
        },
        onDragStart: () => {
            if (canInteractWithElement()) {
                setActiveSnapLines([]);
                // Set grabbing cursor during drag only for cursor and text tools, not for Hand tool
                if (activeTool?.type !== 'hand' && (activeTool?.type === 'cursor' || (activeTool?.type === 'text' && element.type === 'text'))) {
                    const stage = nodeRef.current?.getStage();
                    const container = stage?.container();
                    if (container) {
                        container.style.cursor = 'grabbing';
                    }
                }
            }
        },
        onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
            if (!canInteractWithElement() || !stageSize || stageSize.width === 0 || stageSize.height === 0) {
                setActiveSnapLines([]);
                return;
            }

            const node = e.target;
            const designWidth = node.width();
            const designHeight = node.height();
            
            // Get top-left coordinates for snapping
            let topLeftX = node.x();
            let topLeftY = node.y();
            
            // Convert coordinates depending on element type
            if (node.offsetX() > 0 || node.offsetY() > 0) {
                // Element is centered (text, images)
                const elementWidth = element.width || 0;
                const elementHeight = element.height || 0;
                topLeftX = node.x() - elementWidth / 2;
                topLeftY = node.y() - elementHeight / 2;
            } else if (element.type === 'circle' || element.type === 'triangle' || 
                      element.type === 'pentagon' || element.type === 'hexagon' || element.type === 'star') {
                // Elements positioned centrally without offsetX/Y
                const elementWidth = element.width || 0;
                const elementHeight = element.height || 0;
                topLeftX = node.x() - elementWidth / 2;
                topLeftY = node.y() - elementHeight / 2;
            }

            const draggingBox: BoxProps = {
                id: element.id,
                x: topLeftX,
                y: topLeftY,
                width: designWidth * Math.abs(node.scaleX()),
                height: designHeight * Math.abs(node.scaleY()),
                rotation: node.rotation(),
            };

            const staticKonvaElements: BoxProps[] = allElements
                .filter(el => el.id !== element.id)
                .map(el => ({
                    id: el.id,
                    x: el.x ?? 0,
                    y: el.y ?? 0,
                    width: (el.width ?? 0) * Math.abs(el.scaleX ?? 1),
                    height: (el.height ?? 0) * Math.abs(el.scaleY ?? 1),
                    rotation: el.rotation ?? 0,
                }));

            const { snapLines, snappedPosition } = getSnappingGuides(
                draggingBox,
                staticKonvaElements,
                stageSize.width,
                stageSize.height
            );

            setActiveSnapLines(snapLines);

            let targetX = snappedPosition.x;
            let targetY = snappedPosition.y;
            
            if (node.offsetX() > 0 || node.offsetY() > 0) {
                // For centered elements, convert back to center
                const elementWidth = element.width || 0;
                const elementHeight = element.height || 0;
                targetX = snappedPosition.x + elementWidth / 2;
                targetY = snappedPosition.y + elementHeight / 2;
            } else if (element.type === 'circle' || element.type === 'triangle' || 
                      element.type === 'pentagon' || element.type === 'hexagon' || element.type === 'star') {
                // For elements positioned centrally
                const elementWidth = element.width || 0;
                const elementHeight = element.height || 0;
                targetX = snappedPosition.x + elementWidth / 2;
                targetY = snappedPosition.y + elementHeight / 2;
            }

            if (node.x() !== targetX || node.y() !== targetY) {
               node.position({ x: targetX, y: targetY });
            }
        },
        onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
            setActiveSnapLines([]);
            
            // Reset cursor to default after drag ends, but only if not Hand tool
            if (activeTool?.type !== 'hand') {
                const stage = nodeRef.current?.getStage();
                const container = stage?.container();
                if (container) {
                    container.style.cursor = 'default';
                }
            }
            
            if (onDragEnd && canInteractWithElement()) {
                const node = e.target;
                let newX = node.x();
                let newY = node.y();
                
                // Convert coordinates depending on element type
                // For elements with offsetX/Y (text, images) node.x() returns center
                // Need to convert to top-left coordinates
                if (node.offsetX() > 0 || node.offsetY() > 0) {
                    // Element is centered (text, images)
                    const elementWidth = element.width || 0;
                    const elementHeight = element.height || 0;
                    newX = node.x() - elementWidth / 2;
                    newY = node.y() - elementHeight / 2;
                } else if (element.type === 'circle' || element.type === 'triangle' || 
                          element.type === 'pentagon' || element.type === 'hexagon' || element.type === 'star') {
                    // Elements positioned centrally without offsetX/Y
                    const elementWidth = element.width || 0;
                    const elementHeight = element.height || 0;
                    newX = node.x() - elementWidth / 2;
                    newY = node.y() - elementHeight / 2;
                }
                // For rectangles, lines and other elements node.x() already returns top-left
                
                onDragEnd(element.id, newX, newY);
            }
        },
        onTransformEnd: handleTransformEnd,
        rotation: element.rotation || 0,
        scaleX: element.scaleX ?? 1,
        scaleY: element.scaleY ?? 1,
    };

    const borderStyleProps = getBorderStyleProperties(element.borderStyle, element.borderWidth);

    const getStrokeStyles = () => {
        if (element.borderStyle === "hidden" || !element.borderWidth || element.borderWidth === 0) {
            return { strokeWidth: 0, dashEnabled: false };
        }
        const borderColorWithOpacity = convertColorToRGBA(element.borderColor, element.borderColorOpacity);

        if (element.borderStyle === "double" && element.borderWidth && element.borderWidth > 1) {
            return {
                stroke: borderColorWithOpacity,
                strokeWidth: element.borderWidth / 2,
                shadowColor: borderColorWithOpacity,
                shadowBlur: 0,
                shadowOffsetX: element.borderWidth / 2,
                shadowOffsetY: element.borderWidth / 2,
                shadowOpacity: 1,
                dashEnabled: false,
                shadowEnabled: true
            };
        }
        return {
            stroke: borderColorWithOpacity,
            strokeWidth: element.borderWidth,
            ...borderStyleProps
        };
    };

    const handleTextEdit = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (element.type !== "text" || !canInteractWithElement()) return;
        e.cancelBubble = true;
        setIsEditing(true);
        const currentText = element.text || "";
        const isPlaceholder = currentText === "Type text here...";
        setEditText(isPlaceholder ? "" : currentText);

        if (!textAreaRef.current) {
            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);
            textAreaRef.current = textarea;
        }
        const textarea = textAreaRef.current;
        textarea.value = isPlaceholder ? "" : currentText;
        textarea.style.display = 'block';

        const groupNodeForPositioning = nodeRef.current as Konva.Group; // Corrected type to Konva.Group

        const handleBlur = () => {
            textarea.style.display = 'none';
            setIsEditing(false);
            if (onTextEdit) {
                let newText = textarea.value.trim() === "" ? "Type text here..." : textarea.value;
                onTextEdit(element.id, newText);
            }
        };
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                textarea.style.display = 'none';
                setIsEditing(false);
            }
            if (e.key === 'Enter' && !e.shiftKey) {
                textarea.style.display = 'none';
                setIsEditing(false);
                if (onTextEdit) {
                    let newText = textarea.value.trim() === "" ? "Type text here..." : textarea.value;
                    onTextEdit(element.id, newText);
                }
            }
        };
        
        // Function to update textarea position when stage scales or moves
        const updateTextareaPosition = () => {
            if (groupNodeForPositioning && textarea && textarea.style.display === 'block') {
                positionTextarea(groupNodeForPositioning, textarea);
            }
        };
        
        textarea.addEventListener('blur', handleBlur);
        textarea.addEventListener('keydown', handleKeyDown);
        
        // Track stage changes to update textarea position
        const stage = groupNodeForPositioning?.getStage();
        if (stage) {
            stage.on('scaleChange', updateTextareaPosition);
            stage.on('positionChange', updateTextareaPosition);
        }
        
        setTimeout(() => {
            if (groupNodeForPositioning && textarea) {
                positionTextarea(groupNodeForPositioning, textarea); // Pass groupNode
            }
        }, 0);
        
        return () => {
            textarea.removeEventListener('blur', handleBlur);
            textarea.removeEventListener('keydown', handleKeyDown);
            if (stage) {
                stage.off('scaleChange', updateTextareaPosition);
                stage.off('positionChange', updateTextareaPosition);
            }
        };
    };

    const positionTextarea = (groupNode: Konva.Group, textarea: HTMLTextAreaElement) => {
        const stage = groupNode.getStage();
        if (!stage) return;

        const box = groupNode.getClientRect(); // Get bounding box of the group in stage coordinates

        const stageContainer = stage.container();
        const stageRect = stageContainer.getBoundingClientRect(); // Stage position on page
        
        // Get stage scale and position from Canvas component
        const stageScaleX = stage.scaleX();
        const stageScaleY = stage.scaleY();
        const stagePosition = stage.position();
        
        // Get Canvas container position
        const canvasContainer = stageContainer.parentElement;
        const canvasRect = canvasContainer ? canvasContainer.getBoundingClientRect() : stageRect;

        // Calculate textarea position considering stage scale and Canvas position
        const adjustedX = canvasRect.left + (box.x * stageScaleX) + stagePosition.x;
        const adjustedY = canvasRect.top + (box.y * stageScaleY) + stagePosition.y;
        const adjustedWidth = box.width * stageScaleX;
        const adjustedHeight = box.height * stageScaleY;

        textarea.style.position = 'fixed'; // Використовуємо fixed для кращого контролю
        textarea.style.top = `${adjustedY}px`;
        textarea.style.left = `${adjustedX}px`;
        textarea.style.width = `${adjustedWidth}px`;
        textarea.style.height = `${adjustedHeight}px`;

        textarea.style.transformOrigin = 'left top';
        textarea.style.transform = `rotate(${groupNode.rotation()}deg)`;

        // Consider stage scale when calculating font size
        const visualFontSize = (element.fontSize || 16) * Math.abs(groupNode.scaleY()) * stageScaleY;
        textarea.style.fontSize = `${visualFontSize}px`;

        textarea.style.fontFamily = element.fontFamily || 'Arial';
        textarea.style.lineHeight = `${element.lineHeight || 1}`;
        textarea.style.color = convertColorToRGBA(element.color, element.textColorOpacity) || "#ffffff";

        textarea.style.padding = '0px';
        textarea.style.margin = '0';
        textarea.style.overflow = 'hidden';
        textarea.style.border = '1px dashed #0096FF';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.boxSizing = 'border-box';

        const bgColor = element.backgroundColor || 'transparent';
        textarea.style.background = convertColorToRGBA(bgColor, element.backgroundOpacity);

        textarea.style.fontWeight = element.fontStyles?.bold ? 'bold' : 'normal';
        textarea.style.fontStyle = element.fontStyles?.italic ? 'italic' : 'normal';
        let textDecorationLine = "";
        if (element.fontStyles?.underline) textDecorationLine += ' underline';
        if (element.fontStyles?.strikethrough) textDecorationLine += ' line-through';
        textarea.style.textDecoration = textDecorationLine.trim() || 'none';

        textarea.style.textAlign = element.textAlignment || 'left';
        switch (element.textCase) {
            case 'uppercase': textarea.style.textTransform = 'uppercase'; break;
            case 'lowercase': textarea.style.textTransform = 'lowercase'; break;
            case 'capitalize': textarea.style.textTransform = 'capitalize'; break;
            default: textarea.style.textTransform = 'none';
        }
        
        // Add zIndex to display above all elements
        textarea.style.zIndex = '9999';

        textarea.focus();
        if (element.text !== "Type text here...") {
            textarea.select();
        }
    };

    const renderElement = () => {
        const strokeStyleProps = getStrokeStyles();

        // ElementData x, y are always top-left.
        // No longer using universal centerX, centerY, offsetX, offsetY for all shapes.
        // Positioning will be according to user's provided snippet logic.

        switch (element.type) {
            case "text":
                // Text Group is centered using offsetX/Y, its x/y in ElementData is top-left
                const textCenterX = element.x + (element.width ?? 0) / 2;
                const textCenterY = element.y + (element.height ?? 0) / 2;
                const textOffsetX = (element.width ?? 0) / 2;
                const textOffsetY = (element.height ?? 0) / 2;
                return (
                    <Group
                        ref={nodeRef as React.RefObject<Konva.Group>}
                        x={textCenterX}
                        y={textCenterY}
                        offsetX={textOffsetX}
                        offsetY={textOffsetY}
                        width={element.width}
                        height={element.height}
                        {...commonProps}
                        draggable={isSelected && activeTool?.type === 'text' ? commonProps.draggable : false}
                    >
                        <Rect
                            width={element.width}
                            height={element.height}
                            fill={element.backgroundColor || "transparent"}
                            opacity={element.backgroundOpacity !== undefined ? element.backgroundOpacity / 100 : (element.backgroundColor === "transparent" ? 0 : 1)}
                            stroke={convertColorToRGBA(element.borderColor, element.borderColorOpacity)} // Use opacity
                            strokeWidth={element.borderStyle === 'hidden' || !element.borderWidth ? 0 : element.borderWidth}
                            {...getBorderStyleProperties(element.borderStyle, element.borderWidth)}
                            x={0} // Relative to group
                            y={0} // Relative to group
                        />
                        <Text
                            ref={textNodeRef} // Assign ref to Konva.Text
                            width={element.width}
                            height={element.height}
                            text={element.text ? applyTextCase(element.text, element.textCase) : "Type text here..."}
                            fontSize={element.fontSize || 16}
                            fontFamily={element.fontFamily || "Arial"}
                            fontStyle={getFontStyle(element)}
                            textDecoration={getTextDecoration(element)}
                            align={element.textAlignment || "left"}
                            verticalAlign="middle"
                            lineHeight={element.lineHeight || 1}
                            padding={5}
                            fill={convertColorToRGBA(element.color, element.textColorOpacity) || "#000000"}
                            visible={!isEditing}
                            listening={!isEditing}
                            x={0} // Relative to group
                            y={0} // Relative to group
                        />
                    </Group>
                );
            case "rectangle":
                return (
                    <Rect
                        ref={nodeRef as React.Ref<Konva.Rect>}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                        {...commonProps}
                        {...strokeStyleProps}
                    />
                );
            case "square":
                // Square should maintain aspect ratio but use normal top-left positioning
                return (
                    <Rect
                        ref={nodeRef as React.Ref<Konva.Rect>}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                        {...commonProps}
                        {...strokeStyleProps}
                    />
                );
            case "rounded-rectangle":
                return (
                    <Rect
                        ref={nodeRef as React.Ref<Konva.Rect>}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                        cornerRadius={element.cornerRadius ?? 10}
                        {...commonProps}
                        {...strokeStyleProps}
                    />
                );
            case "squircle":
                return (
                    <Rect
                        ref={nodeRef as React.Ref<Konva.Rect>}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                        cornerRadius={Math.min(element.width ?? 0, element.height ?? 0) / 4}
                        {...commonProps}
                        {...strokeStyleProps}
                    />
                );
            case "circle":
                return (
                    <Circle
                        ref={nodeRef as React.Ref<Konva.Circle>}
                        x={element.x + (element.width ?? 0) / 2}
                        y={element.y + (element.height ?? 0) / 2}
                        radius={Math.min(element.width ?? 0, element.height ?? 0) / 2} // Keep robust radius
                        fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                        {...commonProps}
                        {...strokeStyleProps}
                    />
                );
            case "line":
                return (
                    <Line
                        ref={nodeRef as React.Ref<Konva.Line>}
                        x={element.x}
                        y={element.y}
                        points={[0, 0, element.width ?? 0, 0]}
                        closed={false}
                        {...commonProps}
                        {...strokeStyleProps}
                        fillEnabled={false}
                    />
                );
            case "triangle":
                return (
                    <RegularPolygon
                        ref={nodeRef as React.Ref<Konva.RegularPolygon>}
                        x={element.x + (element.width ?? 0) / 2}
                        y={element.y + (element.height ?? 0) / 2}
                        sides={3}
                        radius={Math.min(element.width ?? 0, element.height ?? 0) / 2} // Keep robust radius
                        fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                        {...commonProps}
                        {...strokeStyleProps}
                    />
                );
            case "pentagon":
                return (
                    <RegularPolygon
                        ref={nodeRef as React.Ref<Konva.RegularPolygon>}
                        x={element.x + (element.width ?? 0) / 2}
                        y={element.y + (element.height ?? 0) / 2}
                        sides={5}
                        radius={Math.min(element.width ?? 0, element.height ?? 0) / 2} // Keep robust radius
                        fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                        {...commonProps}
                        {...strokeStyleProps}
                    />
                );
            case "hexagon":
                return (
                    <RegularPolygon
                        ref={nodeRef as React.Ref<Konva.RegularPolygon>}
                        x={element.x + (element.width ?? 0) / 2}
                        y={element.y + (element.height ?? 0) / 2}
                        sides={6}
                        radius={Math.min(element.width ?? 0, element.height ?? 0) / 2} // Keep robust radius
                        fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                        {...commonProps}
                        {...strokeStyleProps}
                    />
                );
            case "star":
                return (
                    <Star
                        ref={nodeRef as React.Ref<Konva.Star>}
                        x={element.x + (element.width ?? 0) / 2}
                        y={element.y + (element.height ?? 0) / 2}
                        numPoints={5}
                        // Use element.width for radii as per user snippet style, but ensure min for robustness if height is too small
                        innerRadius={Math.min(element.width ?? 0, element.height ?? 0) / 4}
                        outerRadius={Math.min(element.width ?? 0, element.height ?? 0) / 2}
                        fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                        {...commonProps}
                        {...strokeStyleProps}
                    />
                );
            case "heart":
                const heartW = element.width ?? 0;
                const heartH = element.height ?? 0;
                const heartPath = [
                    heartW / 2, heartH / 5,
                    heartW / 4, 0,
                    0, heartH / 4,
                    0, heartH / 2,
                    heartW / 2, heartH,
                    heartW, heartH / 2,
                    heartW, heartH / 4,
                    heartW * 3 / 4, 0,
                    heartW / 2, heartH / 5
                ];
                return (
                    <Group
                        ref={nodeRef as React.RefObject<Konva.Group>}
                        x={element.x}
                        y={element.y}
                        width={heartW} // Set group width/height for transformer
                        height={heartH}
                        {...commonProps} // Includes draggable, rotation, scale, events
                    >
                        <Line // Use the imported Line from react-konva
                            points={heartPath}
                            fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                            closed={true}
                            {...strokeStyleProps} // Includes stroke, strokeWidth, dash, etc.
                            // commonProps from Group are not needed here again, opacity is on Group
                        />
                    </Group>
                );
            case "arrow":
                const arrowW = element.width ?? 0;
                const arrowH = element.height ?? 0;
                // Arrow body (line)
                const arrowBodyPoints = [0, arrowH / 2, arrowW * 0.8, arrowH / 2];
                // Arrow head (filled triangle)
                const arrowHeadPoints = [
                    arrowW * 0.8, arrowH * 0.2,
                    arrowW, arrowH / 2,
                    arrowW * 0.8, arrowH * 0.8
                ];
                return (
                    <Group
                        ref={nodeRef as React.RefObject<Konva.Group>}
                        x={element.x}
                        y={element.y}
                        width={arrowW}
                        height={arrowH}
                        {...commonProps}
                    >
                        {/* Arrow body (line) */}
                        <Line
                            points={arrowBodyPoints}
                            closed={false}
                            {...strokeStyleProps}
                            fillEnabled={false}
                        />
                        {/* Arrow head (filled) */}
                        <Line
                            points={arrowHeadPoints}
                            closed={true}
                            fill={convertColorToRGBA(element.fillColor, element.fillColorOpacity)}
                            stroke={convertColorToRGBA(element.borderColor, element.borderColorOpacity)}
                            strokeWidth={element.borderStyle === 'hidden' ? 0 : element.borderWidth ?? 0}
                            {...getBorderStyleProperties(element.borderStyle, element.borderWidth)}
                            fillEnabled={true}
                        />
                    </Group>
                );
            case "custom-image":
                // Custom Image is centered using offsetX/Y, its x/y in ElementData is top-left
                const imgCenterX = element.x + (element.width ?? 0) / 2;
                const imgCenterY = element.y + (element.height ?? 0) / 2;
                const imgOffsetX = (element.width ?? 0) / 2;
                const imgOffsetY = (element.height ?? 0) / 2;
                
                const [imageLoaded, setImageLoaded] = useState(false);
                const [imageInstance, setImageInstance] = useState<HTMLImageElement | null>(null);
                
                useEffect(() => {
                    if (element.src) {
                        const img = new window.Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => {
                            setImageInstance(img);
                            setImageLoaded(true);
                        };
                        img.onerror = () => {
                            console.error('Failed to load image:', element.src);
                            setImageLoaded(false);
                        };
                        img.src = element.src;
                        
                        return () => {
                            setImageInstance(null);
                            setImageLoaded(false);
                        };
                    }
                }, [element.src]);
                
                if (element.src && imageLoaded && imageInstance) {
                    return (
                        <KonvaImage
                            ref={nodeRef as React.RefObject<Konva.Image>}
                            image={imageInstance}
                            x={imgCenterX}
                            y={imgCenterY}
                            offsetX={imgOffsetX}
                            offsetY={imgOffsetY}
                            width={element.width}
                            height={element.height}
                            {...commonProps}
                            {...strokeStyleProps} // Borders for image
                        />
                    );
                } else if (element.src && !imageLoaded) {
                    // Show placeholder while loading
                    return (
                        <Group
                            ref={nodeRef as React.RefObject<Konva.Group>}
                            x={imgCenterX}
                            y={imgCenterY}
                            offsetX={imgOffsetX}
                            offsetY={imgOffsetY}
                            width={element.width}
                            height={element.height}
                            {...commonProps}
                        >
                            <Rect
                                width={element.width}
                                height={element.height}
                                fill="#f0f0f0"
                                stroke="#ddd"
                                strokeWidth={1}
                                x={0}
                                y={0}
                            />
                            <Text
                                width={element.width}
                                height={element.height}
                                text="Loading..."
                                fontSize={16}
                                fontFamily="Arial"
                                fill="#666"
                                align="center"
                                verticalAlign="middle"
                                x={0}
                                y={0}
                            />
                        </Group>
                    );
                }
                return null;
            default:
                return null;
        }
    };

    return (
        <>
            {renderElement()}
            {isSelected && canInteractWithElement() && (
                <Transformer
                    ref={transformerRef}
                    // Visual properties
                    borderDash={[3, 3]}
                    anchorStroke="#0096FF"
                    anchorFill="#FFFFFF"
                    anchorSize={8}
                    borderStroke="#0096FF"
                    rotateAnchorOffset={30}

                    // Function properties will be set in useEffect for full control
                    // Just providing additional visual cues here
                    draggable={true}
                    resizeEnabled={true}
                    rotateEnabled={true}
                    keepRatio={element.preserveAspectRatio !== false && element.type !== 'rectangle' && element.type !== 'text' && element.type !== 'rounded-rectangle' && element.type !== 'squircle' && element.type !== 'line' && element.type !== 'arrow'}
                    centeredScaling={false}
                    enabledAnchors={[
                        'top-left', 'top-center', 'top-right',
                        'middle-left', 'middle-right',
                        'bottom-left', 'bottom-center', 'bottom-right'
                    ]}
                    padding={0}
                />
            )}
        </>
    );
};

export default memo(ElementRenderer);