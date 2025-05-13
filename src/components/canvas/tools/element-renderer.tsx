import React, { useState, useEffect, useRef } from "react";
import { Rect, Circle, RegularPolygon, Star, Line, Text, Group, Transformer, Shape } from "react-konva";
import type { ElementData, TextCase, BorderStyle } from "@/types/canvas";
import type Konva from "konva";

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
const getBorderStyle = (borderStyle: BorderStyle = "solid", borderWidth: number = 1): { dash?: number[], dashEnabled?: boolean, shadowOffset?: {x: number, y: number}, shadowColor?: string, shadowBlur?: number } => {
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
    if (element.type === "text" && textRef.current) {
      targetNode = textRef.current;
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

  // Effect for text editor
  useEffect(() => {
    if (isEditing && textAreaRef.current && textRef.current) {
      const textNode = textRef.current;
      const textareaElement = textAreaRef.current;
      
      // Position textarea over text element
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
        textareaElement.style.position = 'absolute';
        textareaElement.style.top = `${areaPosition.y}px`;
        textareaElement.style.left = `${areaPosition.x}px`;
        textareaElement.style.width = `${textNode.width() * stage.scaleX()}px`;
        textareaElement.style.height = `${textNode.height() * stage.scaleY()}px`;
        textareaElement.style.fontSize = `${element.fontSize || 16}px`;
        textareaElement.style.fontFamily = element.fontFamily || 'Arial';
        textareaElement.style.lineHeight = `${element.lineHeight || 1}`;
        textareaElement.style.color = element.color;
        
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
          
          textareaElement.style.background = hexToRgba(bgColor, bgOpacity);
        } else {
          textareaElement.style.background = 'transparent';
        }
        
        textareaElement.style.padding = '0';
        textareaElement.style.margin = '0';
        textareaElement.style.border = 'none';
        textareaElement.style.outline = '1px dashed #0096FF';
        textareaElement.style.resize = 'none';
        textareaElement.style.transformOrigin = 'left top';
        
        // Apply font styles
        if (element.fontStyles?.bold) {
          textareaElement.style.fontWeight = 'bold';
        }
        if (element.fontStyles?.italic) {
          textareaElement.style.fontStyle = 'italic';
        }
        if (element.fontStyles?.underline) {
          textareaElement.style.textDecoration = textareaElement.style.textDecoration + ' underline';
        }
        if (element.fontStyles?.strikethrough) {
          textareaElement.style.textDecoration = textareaElement.style.textDecoration + ' line-through';
        }
        
        // Apply text alignment
        textareaElement.style.textAlign = element.textAlignment || 'left';
        
        textareaElement.focus();
      }
    }
  }, [isEditing, element]);
  
  // Handler for end of transformation
  const handleTransformEnd = () => {
    if (!onTransform) return;
    
    let newAttrs: Partial<ElementData> = {};
    let node: any = null;
    
    if (element.type === "text" && textRef.current) {
      node = textRef.current;
    } else if (element.type === "heart" && groupRef.current) {
      node = groupRef.current;
    } else if (element.type === "rectangle" || element.type === "square" || 
               element.type === "rounded-rectangle" || element.type === "squircle") {
      node = rectRef.current;
    } else if (element.type === "circle") {
      node = circleRef.current;
    } else if (element.type === "line" || element.type === "arrow") {
      node = lineRef.current;
    } else if (element.type === "triangle" || element.type === "pentagon" || element.type === "hexagon") {
      node = polygonRef.current;
    } else if (element.type === "star") {
      node = starRef.current;
    } else {
      node = shapeRef.current;
    }
    
    if (!node) return;
    
    if (element.type === "circle" || element.type === "triangle" || 
        element.type === "pentagon" || element.type === "hexagon" || 
        element.type === "star") {
      // For shapes that use radius
      const scale = Math.max(Math.abs(node.scaleX()), Math.abs(node.scaleY()));
      const width = element.width * scale;
      const height = element.height * scale;
      const centerX = node.x();
      const centerY = node.y();
      
      newAttrs = {
        x: centerX - width / 2,
        y: centerY - height / 2,
        width,
        height,
        rotation: node.rotation(),
        scaleX: 1,
        scaleY: 1
      };
    } else {
      // For rectangles and other shapes
      newAttrs = {
        x: node.x(),
        y: node.y(),
        width: Math.max(10, node.width() * Math.abs(node.scaleX())),
        height: Math.max(10, node.height() * Math.abs(node.scaleY())),
        rotation: node.rotation(),
        scaleX: node.scaleX() < 0 ? -1 : 1, // Keep sign for reflection
        scaleY: node.scaleY() < 0 ? -1 : 1
      };
    }
    
    onTransform(index, newAttrs);
  };
  
  // Common properties for all element types
  const commonProps = {
    draggable: true,
    opacity: element.opacity,
    fill: element.color,
    stroke: element.borderColor,
    strokeWidth: element.borderWidth || 0,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => onClick?.(index, e),
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

  // Double click handler for text
  const handleDoubleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (element.type === "text") {
      setIsEditing(true);
      setEditText(element.text || "");
      
      // Add textarea for editing
      if (!textAreaRef.current) {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textAreaRef.current = textarea;
      }
      
      const textarea = textAreaRef.current;
      textarea.value = element.text || "";
      textarea.style.display = 'block';
      
      // Event listeners for textarea
      const handleBlur = () => {
        textarea.style.display = 'none';
        setIsEditing(false);
        if (onTextEdit) {
          onTextEdit(index, textarea.value);
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
            onTextEdit(index, textarea.value);
          }
        }
      };
      
      textarea.addEventListener('blur', handleBlur);
      textarea.addEventListener('keydown', handleKeyDown);
      
      // Remove listeners when unmounting
      return () => {
        textarea.removeEventListener('blur', handleBlur);
        textarea.removeEventListener('keydown', handleKeyDown);
      };
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
          <Text
            ref={textRef}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            text={element.text ? applyTextCase(element.text, element.textCase) : "Текст"}
            fontSize={element.fontSize || 16}
            fontFamily={element.fontFamily || "Arial"}
            fontStyle={getFontStyle(element)}
            textDecoration={getTextDecoration(element)}
            align={element.textAlignment || "left"}
            lineHeight={element.lineHeight || 1}
            padding={5}
            // Apply background with opacity
            fillPriority="color"
            fillEnabled={true}
            // Use Konva fill for text color and background for the shape
            fillAfterStrokeEnabled={true}
            {...commonProps}
            {...getElementProps()}
            onDblClick={handleDoubleClick}
            visible={!isEditing}
          />
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
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
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
        />
      )}
    </>
  );
};

export default ElementRenderer; 