import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Rect, Circle, RegularPolygon, Star, Line, Text, Group, Transformer, Shape } from "react-konva";
import type { ElementData, TextCase, BorderStyle } from "@/types/canvas";
import type Konva from "konva";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ElementRendererProps {
  element: ElementData;
  index: number;
  onDragEnd?: (index: number, newX: number, newY: number) => void;
  onClick?: (index: number, e: Konva.KonvaEventObject<MouseEvent>) => void;
  onTextEdit?: (index: number, newText: string) => void;
  onTransform?: (index: number, newAttrs: Partial<ElementData>) => void;
  isSelected?: boolean;
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
const getBorderStyle = (borderStyle: BorderStyle = "solid", borderWidth: number = 1): { dash?: number[], dashEnabled?: boolean, shadowOffset?: { x: number, y: number }, shadowColor?: string, shadowBlur?: number } => {
  switch (borderStyle) {
    case "dashed":
      return { dash: [10, 5], dashEnabled: true };
    case "dotted":
      return { dash: [2, 2], dashEnabled: true };
    case "double":
      if (borderWidth > 2) {
        return {
          shadowOffset: { x: 0, y: 0 },
          shadowColor: "inherit",
          shadowBlur: borderWidth * 0.5
        };
      }
      return {};
    case "hidden":
    case "solid":
    default:
      return {};
  }
};

// Create a single interface
interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  opacity?: number;
  setOpacity?: (opacity: number) => void;
  presetColors?: string[];
  allowTransparent?: boolean;
  onClose?: () => void;
}

// Add support for custom colors
interface ColorPickerState {
  customColors: string[];
  recentColors: string[];
  format: 'hex' | 'rgb' | 'hsl';
}

const validateColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
  return hexRegex.test(color) || rgbRegex.test(color);
};

const ColorFormatSelector = ({ format, setFormat }: { format: string, setFormat: (format: string) => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      {format.toUpperCase()}
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => setFormat('hex')}>HEX</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setFormat('rgb')}>RGB</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setFormat('hsl')}>HSL</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  index,
  onDragEnd,
  onClick,
  onTextEdit,
  onTransform,
  isSelected
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(element.text || "");
  const shapeRef = useRef<Konva.Shape>(null);
  const rectRef = useRef<Konva.Rect>(null);
  const circleRef = useRef<Konva.Circle>(null);
  const lineRef = useRef<Konva.Line>(null);
  const polygonRef = useRef<Konva.RegularPolygon>(null);
  const starRef = useRef<Konva.Star>(null);
  const textRef = useRef<Konva.Text | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const groupRef = useRef<Konva.Group | null>(null);

  // Effect for transformer
  useEffect(() => {
    if (!isSelected || !transformerRef.current) {
      return;
    }

    let targetNode = null;
    if (element.type === "text" && groupRef.current) {
      targetNode = groupRef.current;
      // Configure transformer for text elements
      transformerRef.current.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']);
      transformerRef.current.rotateEnabled(true);
      transformerRef.current.rotationSnaps([0, 45, 90, 135, 180, 225, 270, 315]);
      transformerRef.current.rotationSnapTolerance(5);
      transformerRef.current.padding(5);
      transformerRef.current.boundBoxFunc((oldBox, newBox) => {
        // Maintain minimum size
        newBox.width = Math.max(50, newBox.width);
        newBox.height = Math.max(20, newBox.height);
        return newBox;
      });
    } else if (element.type === "heart" && groupRef.current) {
      targetNode = groupRef.current;
    } else if (element.type === "rectangle" || element.type === "square" ||
      element.type === "rounded-rectangle" || element.type === "squircle") {
      targetNode = rectRef.current;
    } else if (element.type === "circle") {
      targetNode = circleRef.current;
    } else if (element.type === "line" || element.type === "arrow") {
      targetNode = lineRef.current;
    } else if (element.type === "triangle" || element.type === "pentagon" || element.type === "hexagon") {
      targetNode = polygonRef.current;
    } else if (element.type === "star") {
      targetNode = starRef.current;
    } else if (shapeRef.current) {
      targetNode = shapeRef.current;
    }

    if (!targetNode) return;

    transformerRef.current.nodes([targetNode]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [isSelected, element.type]);

  // Handler for end of transformation
  const handleTransformEnd = () => {
    if (!onTransform || !groupRef.current) return;

    // let newAttrs: Partial<ElementData> = {};
    // let node: any = null;

    // if (element.type === "text" && textRef.current) {
    //   node = textRef.current;
      
    //   // Calculate new dimensions while preserving text properties
    //   const scaleX = node.scaleX();
    //   const scaleY = node.scaleY();
    //   const rotation = node.rotation();
      
    //   // Update container dimensions
    //   newAttrs = {
    //     x: node.x(),
    //     y: node.y(),
    //     width: Math.max(50, node.width() * Math.abs(scaleX)),
    //     height: Math.max(20, node.height() * Math.abs(scaleY)),
    //     rotation: rotation,
    //     // Reset scale to prevent text distortion
    //     scaleX: 1,
    //     scaleY: 1,
    //     // Preserve all text properties
    //     fontSize: element.fontSize,
    //     fontFamily: element.fontFamily,
    //     fontStyles: element.fontStyles,
    //     textCase: element.textCase,
    //     textAlignment: element.textAlignment,
    //     lineHeight: element.lineHeight,
    //     color: element.color,
    //     backgroundColor: element.backgroundColor,
    //     backgroundOpacity: element.backgroundOpacity,
    //     borderColor: element.borderColor,
    //     borderWidth: element.borderWidth,
    //     borderStyle: element.borderStyle
    //   };
    // } else if (element.type === "heart" && groupRef.current) {
    //   node = groupRef.current;
    // } else if (element.type === "rectangle" || element.type === "square" ||
    //   element.type === "rounded-rectangle" || element.type === "squircle") {
    //   node = rectRef.current;
    // } else if (element.type === "circle") {
    //   node = circleRef.current;
    // } else if (element.type === "line" || element.type === "arrow") {
    //   node = lineRef.current;
    // } else if (element.type === "triangle" || element.type === "pentagon" || element.type === "hexagon") {
    //   node = polygonRef.current;
    // } else if (element.type === "star") {
    //   node = starRef.current;
    // } else {
    //   node = shapeRef.current;
    // }

    // if (!node) return;

    // if (element.type === "circle" || element.type === "triangle" ||
    //   element.type === "pentagon" || element.type === "hexagon" ||
    //   element.type === "star") {
    //   // For shapes that use radius
    //   const scale = Math.max(Math.abs(node.scaleX()), Math.abs(node.scaleY()));
    //   const width = element.width * scale;
    //   const height = element.height * scale;
    //   const centerX = node.x();
    //   const centerY = node.y();

    //   newAttrs = {
    //     x: centerX - width / 2,
    //     y: centerY - height / 2,
    //     width,
    //     height,
    //     rotation: node.rotation(),
    //     scaleX: 1,
    //     scaleY: 1
    //   };
    // } else {
    //   // For rectangles and other shapes
    //   newAttrs = {
    //     x: node.x(),
    //     y: node.y(),
    //     width: Math.max(10, node.width() * Math.abs(node.scaleX())),
    //     height: Math.max(10, node.height() * Math.abs(node.scaleY())),
    //     rotation: node.rotation(),
    //     scaleX: node.scaleX() < 0 ? -1 : 1, // Keep sign for reflection
    //     scaleY: node.scaleY() < 0 ? -1 : 1
    //   };
    // }
    
    
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to prevent accumulation
    node.scaleX(1);
    node.scaleY(1);

    const newAttrs = {
      x: node.x(),
      y: node.y(),
      width: Math.max(20, node.width() * Math.abs(scaleX)),
      height: Math.max(20, node.height() * Math.abs(scaleY)),
      rotation: node.rotation(),
    };

    onTransform(index, newAttrs);
  };

  // Common properties for all element types
  const commonProps = {
    draggable: true,
    opacity: element.opacity,
    fill: element.color,
    stroke: element.borderColor,
    strokeWidth: element.borderWidth || 0,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Stop event propagation to prevent clicking on the stage
      e.cancelBubble = true;
      
      // For text elements, start editing with a single click
      if (element.type === "text" && !isEditing) {
        handleTextEdit(e);
      }
      
      // Handle click on the element
      onClick?.(index, e);
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      if (onDragEnd) {
        const node = e.target;
        onDragEnd(index, node.x(), node.y());
      }
    },
    onTransformEnd: handleTransformEnd,
    rotation: element.rotation || 0,
    scaleX: element.scaleX || 1,
    scaleY: element.scaleY || 1
  };

  // For text elements, we create a separate set of properties to ensure proper scaling
  const textProps = {
    ...commonProps,
    // Override scaleX and scaleY to always be 1 for text to prevent distortion
    scaleX: 1,
    scaleY: 1,
  };

  // Handle border styles
  const getStrokeStyles = () => {
    const borderStyleProps = getBorderStyle(element.borderStyle, element.borderWidth);

    if (element.borderStyle === "hidden") {
      return {
        dash: borderStyleProps.dash,
        dashEnabled: borderStyleProps.dashEnabled,
        stroke: element.borderColor,
        strokeWidth: 0
      };
    } else if (element.borderStyle === "double" && element.borderWidth && element.borderWidth > 2) {
      // For double border we create an effect with inner and outer stroke
      return {
        stroke: element.borderColor,
        strokeWidth: Math.ceil(element.borderWidth * 0.6),
        shadowColor: element.borderColor,
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowOpacity: 1,
        shadowEnabled: true,
        // Create inner stroke effect
        dashEnabled: false
      };
    } else if (element.borderStyle === "dotted" || element.borderStyle === "dashed") {
      return {
        dash: borderStyleProps.dash,
        dashEnabled: borderStyleProps.dashEnabled,
        stroke: element.borderColor,
        strokeWidth: element.borderWidth || 0
      };
    } else {
      return {
        stroke: element.borderColor,
        strokeWidth: element.borderWidth || 0
      };
    }
  };

  // Handler for text editing (used for both single and double click)
  const handleTextEdit = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (element.type !== "text") return;
    
    // Stop event propagation
    e.cancelBubble = true;
    
    setIsEditing(true);
    
    // Clear the placeholder text on first edit
    const currentText = element.text || "";
    const isPlaceholder = currentText === "Type text here...";
    setEditText(isPlaceholder ? "" : currentText);

    // Add textarea for editing
    if (!textAreaRef.current) {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textAreaRef.current = textarea;
    }

    const textarea = textAreaRef.current;
    textarea.value = isPlaceholder ? "" : currentText;
    textarea.style.display = 'block';

    // Event listeners for textarea
    const handleBlur = () => {
      textarea.style.display = 'none';
      setIsEditing(false);
      if (onTextEdit) {
        // Don't save empty text, revert to placeholder
        let newText = textarea.value.trim() === "" ? "Type text here..." : textarea.value;
        
        // Store the raw text without applying case transformations
        // The text case will be applied during rendering by the applyTextCase function
        onTextEdit(index, newText);
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
          // Don't save empty text, revert to placeholder
          let newText = textarea.value.trim() === "" ? "Type text here..." : textarea.value;
          
          // Store the raw text without applying case transformations
          // The text case will be applied during rendering by the applyTextCase function
          onTextEdit(index, newText);
        }
      }
    };

    textarea.addEventListener('blur', handleBlur);
    textarea.addEventListener('keydown', handleKeyDown);

    // Position the textarea with a small delay to ensure it's correctly positioned
    setTimeout(() => {
      if (textRef.current && textarea) {
        positionTextarea(textRef.current, textarea);
      }
    }, 0);

    // Return cleanup function
    return () => {
      textarea.removeEventListener('blur', handleBlur);
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  };

  // Position textarea over the text element
  const positionTextarea = (textNode: Konva.Text, textarea: HTMLTextAreaElement) => {
    const position = textNode.getAbsolutePosition();
    const stage = textNode.getStage();

    if (stage) {
      const stageContainer = stage.container();
      const stageBox = stageContainer.getBoundingClientRect();

      const areaPosition = {
        x: stageBox.left + position.x,
        y: stageBox.top + position.y,
      };

      // Set position and size of textarea
      textarea.style.position = 'absolute';
      textarea.style.top = `${areaPosition.y}px`;
      textarea.style.left = `${areaPosition.x}px`;
      textarea.style.width = `${textNode.width() * stage.scaleX()}px`;
      textarea.style.height = `${textNode.height() * stage.scaleY()}px`;
      textarea.style.fontSize = `${element.fontSize || 16}px`;
      textarea.style.fontFamily = element.fontFamily || 'Arial';
      textarea.style.lineHeight = `${element.lineHeight || 1}`;
      textarea.style.color = element.color;
      textarea.style.padding = '5px';
      textarea.style.margin = '0';
      textarea.style.overflow = 'hidden';
      textarea.style.border = 'none';
      textarea.style.outline = '1px dashed #0096FF';
      textarea.style.resize = 'none';
      textarea.style.transformOrigin = 'left top';
      textarea.style.boxSizing = 'border-box';

      // Apply background with opacity
      const bgColor = element.backgroundColor || 'transparent';
      const bgOpacity = element.backgroundOpacity !== undefined ? element.backgroundOpacity / 100 : 1;

      if (bgColor !== 'transparent') {
        // Convert hex to rgba
        const hexToRgba = (hex: string, alpha: number): string => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        textarea.style.background = hexToRgba(bgColor, bgOpacity);
      } else {
        textarea.style.background = 'transparent';
      }

      // Apply font styles
      if (element.fontStyles?.bold) {
        textarea.style.fontWeight = 'bold';
      }
      if (element.fontStyles?.italic) {
        textarea.style.fontStyle = 'italic';
      }
      if (element.fontStyles?.underline) {
        textarea.style.textDecoration = textarea.style.textDecoration + ' underline';
      }
      if (element.fontStyles?.strikethrough) {
        textarea.style.textDecoration = textarea.style.textDecoration + ' line-through';
      }

      // Apply text alignment
      textarea.style.textAlign = element.textAlignment || 'center';
      
      // Apply text transform based on textCase
      switch (element.textCase) {
        case 'uppercase':
          textarea.style.textTransform = 'uppercase';
          break;
        case 'lowercase':
          textarea.style.textTransform = 'lowercase';
          break;
        case 'capitalize':
          textarea.style.textTransform = 'capitalize';
          break;
        default:
          textarea.style.textTransform = 'none';
      }

      // Focus and select all text if it's not the placeholder
      textarea.focus();
      if (element.text !== "Type text here...") {
        textarea.select();
      }
    }
  };

  // Double click handler for text - now just delegates to handleTextEdit
  const handleDoubleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (element.type === "text") {
      handleTextEdit(e);
    }
  };

  // Add attributes for identifying element
  const getElementProps = () => {
    return {
      id: `element-${index}`,
      'data-selected': isSelected ? 'true' : 'false',
      'data-type': element.type
    };
  };

  // Process background color with opacity for text
  const getBackgroundWithOpacity = () => {
    const bgColor = element.backgroundColor || 'transparent';
    if (bgColor === 'transparent') return 'transparent';

    const bgOpacity = element.backgroundOpacity !== undefined ? element.backgroundOpacity / 100 : 1;

    // If opacity is 100%, just return the color
    if (bgOpacity >= 1) return bgColor;

    // Convert hex to rgba for opacity
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${bgOpacity})`;
  };

  // Rendering elements depending on type
  const renderElement = () => {
    switch (element.type) {
      case "text":
        return (
          <Group
            ref={groupRef}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            draggable={true}
            onDragEnd={(e) => {
              if (onDragEnd) {
                const node = e.target;
                onDragEnd(index, node.x(), node.y());
              }
            }}
            onClick={(e) => {
              e.cancelBubble = true;
              if (element.type === "text" && !isEditing) {
                handleTextEdit(e);
              }
              onClick?.(index, e);
            }}
            onDblClick={handleDoubleClick}
            onTransformEnd={handleTransformEnd}
            {...getElementProps()}
          >
            {/* Background rectangle */}
            <Rect
              width={element.width}
              height={element.height}
              fill={element.backgroundColor || "transparent"}
              opacity={element.backgroundOpacity !== undefined ? element.backgroundOpacity / 100 : 1}
              {...getStrokeStyles()}
            />
            {/* Text element */}
            <Text
              ref={textRef}
              width={element.width}
              height={element.height}
              text={element.text ? applyTextCase(element.text, element.textCase) : "Type text here..."}
              fontSize={element.fontSize || 16}
              fontFamily={element.fontFamily || "Arial"}
              fontStyle={getFontStyle(element)}
              textDecoration={getTextDecoration(element)}
              align={element.textAlignment || "center"}
              verticalAlign="middle"
              lineHeight={element.lineHeight || 1}
              padding={5}
              fillPriority="color"
              fillEnabled={true}
              fillAfterStrokeEnabled={true}
              fill={element.color || "#ffffff"}
              visible={!isEditing}
              // transformsEnabled="all"
              // keepRatio={false}
            />
          </Group>
        );
      case "rectangle":
      case "square":
        return (
          <Rect
            ref={rectRef}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            {...commonProps}
            {...getStrokeStyles()}
            {...getElementProps()}
          />
        );
      case "rounded-rectangle":
        return (
          <Rect
            ref={rectRef}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            cornerRadius={element.cornerRadius || 10}
            {...commonProps}
            {...getStrokeStyles()}
            {...getElementProps()}
          />
        );
      case "squircle":
        return (
          <Rect
            ref={rectRef}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            cornerRadius={Math.min(element.width, element.height) / 4}
            {...commonProps}
            {...getStrokeStyles()}
            {...getElementProps()}
          />
        );
      case "circle":
        return (
          <Circle
            ref={circleRef}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2}
            radius={element.width / 2}
            {...commonProps}
            {...getStrokeStyles()}
            {...getElementProps()}
          />
        );
      case "line":
        return (
          <Line
            ref={lineRef}
            x={element.x}
            y={element.y}
            points={[0, 0, element.width, 0]}
            {...commonProps}
            fill={undefined} // Override fill property for line
            {...getStrokeStyles()}
            {...getElementProps()}
          />
        );
      case "triangle":
        return (
          <RegularPolygon
            ref={polygonRef}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2}
            sides={3}
            radius={element.width / 2}
            {...commonProps}
            {...getStrokeStyles()}
            {...getElementProps()}
          />
        );
      case "pentagon":
        return (
          <RegularPolygon
            ref={polygonRef}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2}
            sides={5}
            radius={element.width / 2}
            {...commonProps}
            {...getStrokeStyles()}
            {...getElementProps()}
          />
        );
      case "hexagon":
        return (
          <RegularPolygon
            ref={polygonRef}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2}
            sides={6}
            radius={element.width / 2}
            {...commonProps}
            {...getStrokeStyles()}
            {...getElementProps()}
          />
        );
      case "star":
        return (
          <Star
            ref={starRef}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2}
            numPoints={5}
            innerRadius={element.width / 4}
            outerRadius={element.width / 2}
            {...commonProps}
            {...getStrokeStyles()}
            {...getElementProps()}
          />
        );
      case "heart":
        // Implementation of custom heart shape
        const heartPath = [
          // Coordinates for rounded heart
          element.width / 2, element.height / 5,
          // Left top arc
          element.width / 4, 0,
          0, element.height / 4,
          0, element.height / 2,
          // Bottom part
          element.width / 2, element.height,
          // Right top arc
          element.width, element.height / 2,
          element.width, element.height / 4,
          element.width * 3 / 4, 0,
          element.width / 2, element.height / 5
        ];
        return (
          <Group
            ref={groupRef}
            x={element.x}
            y={element.y}
            draggable={true}
            rotation={element.rotation || 0}
            scaleX={element.scaleX || 1}
            scaleY={element.scaleY || 1}
            onClick={(e) => onClick?.(index, e)}
            onDragEnd={(e) => {
              if (onDragEnd) {
                const node = e.target;
                onDragEnd(index, node.x(), node.y());
              }
            }}
            onTransformEnd={handleTransformEnd}
            {...getElementProps()}
          >
            <Line
              points={heartPath}
              fill={element.color}
              opacity={element.opacity}
              closed={true}
              {...getStrokeStyles()}
            />
          </Group>
        );
      case "arrow":
        // Implementation of arrow
        return (
          <Line
            ref={lineRef}
            x={element.x}
            y={element.y}
            points={[0, element.height / 2, element.width * 0.8, element.height / 2, element.width * 0.8, element.height * 0.2, element.width, element.height / 2, element.width * 0.8, element.height * 0.8, element.width * 0.8, element.height / 2]}
            {...commonProps}
            {...getStrokeStyles()}
            {...getElementProps()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderElement()}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            newBox.width = Math.max(20, newBox.width);
            newBox.height = Math.max(20, newBox.height);
            return newBox;
          }}
          // Set anchors appearance
          anchorStroke="#0096FF"
          anchorFill="#FFFFFF"
          anchorSize={8}
          borderStroke="#0096FF"
          borderDash={[4, 4]}
          rotateAnchorOffset={20}
          enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']}
          // Add padding to make it easier to grab the transformer
          padding={5}
        />
      )}
    </>
  );
};

export default ElementRenderer; 