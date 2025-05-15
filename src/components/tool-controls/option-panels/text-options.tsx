import React, { useState, useEffect } from "react";
import { useTool } from "@/context/tool-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Type,
  PlusCircle,
  Trash2,
  Copy,
  FileUp,
  Strikethrough,
  Baseline,
  ChevronDown,
  CaseSensitive,
  CaseUpper,
  CaseLower,
  Check
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import { TooltipContent, TooltipTrigger, Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { lightenColor } from "./common";
import type { TextCase, Element, ElementData, FontStyles, TextAlignment, BorderStyle } from "@/types/canvas";
import { useElementsManager } from "@/context/elements-manager-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import ColorPicker from "@/components/color-picker/color-picker";

// Adding styles for scrollbar
const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 8px;
    background-color: #292C31;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #44474A;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-track {
    background-color: #292C31;
    border-radius: 4px;
  }
`;

const FontSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
  fonts: string[];
}> = ({ value, onChange, fonts }) => {
  return (
    <div className="flex items-center space-x-2">
      <Label className="text-xs text-[#D4D4D5FF] pl-3">Font:</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
            <span style={{ fontFamily: value }}>{value}</span>
            <ChevronDown size={12} className="text-white" strokeWidth={1.5}/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 relative m-0"
        >
          <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
          <ScrollArea className="h-[200px] w-[200px]">
            <div className="p-1">
              {fonts.map((font) => (
                <DropdownMenuItem
                  key={font}
                  className="flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer"
                  onClick={() => onChange(font)}
                  style={{ fontFamily: font }}
                >
                  {value === font && <Check size={14} className="text-blue-400" />}
                  <span className={value !== font ? "ml-5" : ""}>{font}</span>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
          <div className="sticky bottom-0 bg-[#292C31FF] pt-1 border-t border-[#44474AFF] mt-0">
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer">
              <label className="flex items-center w-full cursor-pointer">
                <FileUp size={14} className="mr-2" />
                Upload font
                <input
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log("Uploading font:", file.name);
                    }
                  }}
                />
              </label>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Define a type to track current text settings
interface TextSettings {
  color: string;
  backgroundColor: string;
  backgroundOpacity: number;
  fontSize: number;
  fontFamily: string;
  fontStyles: FontStyles;
  textCase: TextCase;
  textAlignment: TextAlignment;
  lineHeight: number;
  borderColor: string;
  borderWidth: number;
  borderStyle: BorderStyle;
}

const TextOptions: React.FC = () => {
  const {
    setColor,
    color,
    setBackgroundColor,
    backgroundColor,
    backgroundOpacity,
    setBackgroundOpacity,
    setFontSize,
    fontSize,
    setLineHeight,
    lineHeight,
    setFontFamily,
    fontFamily,
    setTextAlignment,
    textAlignment,
    setFontStyles,
    fontStyles,
    setTextCase,
    textCase,
    setActiveElement,
    setBorderColor,
    borderColor,
    setBorderWidth,
    borderWidth,
    setBorderStyle,
    borderStyle,
    activeElement,
  } = useTool();

  const {
    selectedElementIndex,
    duplicateSelectedElement,
    removeSelectedElement,
    elements,
    updateSelectedElementStyle
  } = useElementsManager();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textBgColor, setTextBgColor] = useState("transparent");
  const [textBgOpacity, setTextBgOpacity] = useState(0);

  // Keep track of the current text settings
  const [textSettings, setTextSettings] = useState<TextSettings>({
    color: "#ffffff",
    backgroundColor: "transparent",
    backgroundOpacity: 0,
    fontSize: 16,
    fontFamily: "Arial",
    fontStyles: { bold: false, italic: false, underline: false, strikethrough: false },
    textCase: "none",
    textAlignment: "center",
    lineHeight: 1,
    borderColor: "#ffffff",
    borderWidth: 1,
    borderStyle: "solid"
  });

  // Sync tool state with selected element
  useEffect(() => {
    if (selectedElementIndex !== null) {
      const selectedElement = elements[selectedElementIndex];
      if (selectedElement && selectedElement.type === "text") {
        // Update tool state with selected element properties
        setTextColor(selectedElement.color || "#ffffff");
        setTextBgColor(selectedElement.backgroundColor || "transparent");
        setTextBgOpacity(selectedElement.backgroundOpacity !== undefined ? selectedElement.backgroundOpacity : 0);
        setFontSize(selectedElement.fontSize || 16);
        setLineHeight(selectedElement.lineHeight || 1);
        setFontFamily(selectedElement.fontFamily || "Arial");
        setTextAlignment(selectedElement.textAlignment || "center");
        setFontStyles(selectedElement.fontStyles || { bold: false, italic: false, underline: false, strikethrough: false });
        setTextCase(selectedElement.textCase || "none");
        setBorderColor(selectedElement.borderColor || "#ffffff");
        setBorderWidth(selectedElement.borderWidth !== undefined ? selectedElement.borderWidth : 1);
        setBorderStyle(selectedElement.borderStyle || "solid");
      }
    }
  }, [selectedElementIndex, elements]);

  // Update selected element when text settings change
  useEffect(() => {
    if (selectedElementIndex !== null) {
      const selectedElement = elements[selectedElementIndex];
      if (selectedElement && selectedElement.type === "text") {
        const updatedStyles = {
          color: textColor,
          backgroundColor: textBgColor,
          backgroundOpacity: textBgOpacity,
          fontSize,
          lineHeight,
          fontFamily,
          textAlignment,
          fontStyles: { ...fontStyles },
          textCase,
          borderColor,
          borderWidth,
          borderStyle
        };
        
        // Only update if values have actually changed
        const hasChanges = Object.entries(updatedStyles).some(([key, value]) => {
          if (key === 'fontStyles') {
            return Object.entries(value).some(([styleKey, styleValue]) => 
              selectedElement.fontStyles?.[styleKey as keyof FontStyles] !== styleValue
            );
          }
          return selectedElement[key as keyof ElementData] !== value;
        });

        if (hasChanges) {
          updateSelectedElementStyle(updatedStyles);
        }
      }
    }
  }, [
    textColor, textBgColor, textBgOpacity, fontSize, lineHeight,
    fontFamily, textAlignment, fontStyles, textCase, borderColor,
    borderWidth, borderStyle, selectedElementIndex
  ]);

  // Update textSettings when any property changes
  useEffect(() => {
    setTextSettings({
      color,
      backgroundColor,
      backgroundOpacity,
      fontSize,
      fontFamily,
      fontStyles,
      textCase,
      textAlignment,
      lineHeight,
      borderColor,
      borderWidth,
      borderStyle
    });
  }, [
    color, backgroundColor, backgroundOpacity, fontSize, lineHeight,
    fontFamily, textAlignment, fontStyles, textCase, borderColor,
    borderWidth, borderStyle
  ]);

  // Update activeElement when text settings change
  useEffect(() => {
    if (activeElement?.type === "text") {
      const updatedTextElement = {
        ...activeElement,
        text: {
          color: textColor,
          backgroundColor: textBgColor,
          backgroundOpacity: textBgOpacity,
          fontSize: fontSize,
          fontFamily: fontFamily,
          fontStyles: { ...fontStyles },
          textCase: textCase,
          lineHeight: lineHeight,
          textAlignment: textAlignment
        }
      };
      setActiveElement(updatedTextElement);
    }
  }, [
    textColor,
    textBgColor,
    textBgOpacity,
    fontSize,
    fontFamily,
    fontStyles,
    textCase,
    lineHeight,
    textAlignment,
    activeElement?.type
  ]);

  // Available fonts
  const fonts = [
    "Arial", "Helvetica", "Times New Roman", "Courier New",
    "Georgia", "Verdana", "Impact", "Comic Sans MS",
    "Tahoma", "Trebuchet MS", "Arial Black", "Lucida Sans",
    "Lucida Console", "Palatino", "Garamond", "Bookman",
    "Calibri", "Cambria", "Candara", "Century Gothic",
    "Franklin Gothic", "Segoe UI", "Optima", "Baskerville",
    "Consolas", "Monaco", "Andale Mono", "Menlo",
    "Ubuntu", "Open Sans", "Roboto", "Lato"
  ];

  const handleAddText = () => {
    // Create text element with all current text settings
    const textElement = {
      id: "text",
      type: "text",
      icon: Type,
      text: {
        color: textColor,
        backgroundColor: textBgColor,
        backgroundOpacity: textBgOpacity,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontStyles: {
          bold: fontStyles.bold,
          italic: fontStyles.italic,
          underline: fontStyles.underline,
          strikethrough: fontStyles.strikethrough
        },
        textCase: textCase,
        lineHeight: lineHeight,
        textAlignment: textAlignment
      }
    };

    // Set as active element
    setActiveElement(textElement);
  };

  // Check if the selected element is a text element
  const isTextElementSelected = selectedElementIndex !== null && elements[selectedElementIndex]?.type === "text";

  // Handle duplicate button click
  const handleDuplicate = () => {
    if (isTextElementSelected) {
      duplicateSelectedElement();
    }
  };

  // Handle delete button click
  const handleDelete = () => {
    if (isTextElementSelected) {
      removeSelectedElement();
    }
  };

  // Replace the existing color picker buttons with new ones
  const renderColorPickers = () => (
    <>
      {/* Text Color Picker */}
      <div className="relative">
        <Button
          variant="ghost"
          className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <p className="text-xs text-[#D4D4D5FF]">Text</p>
          <div
            className="w-5 h-5 rounded-xl border border-gray-500"
            style={{ backgroundColor: textColor }}
          />
        </Button>
        {showColorPicker && (
          <div className="absolute z-50 top-full left-0 mt-2">
            <ColorPicker
              color={textColor}
              setColor={(newColor) => {
                setTextColor(newColor);
              }}
              onClose={() => setShowColorPicker(false)}
            />
          </div>
        )}
      </div>

      {/* Background Color Picker */}
      <div className="relative">
        <Button
          variant="ghost"
          className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]"
          onClick={() => setShowBgColorPicker(!showBgColorPicker)}
        >
          <p className="text-xs text-[#D4D4D5FF]">Background</p>
          <div
            className="w-5 h-5 rounded-xl border border-gray-500"
            style={{ backgroundColor: textBgColor === 'transparent' ? '#ffffff' : textBgColor }}
          />
        </Button>
        {showBgColorPicker && (
          <div className="absolute z-50 top-full left-0 mt-2">
            <ColorPicker
              color={textBgColor === 'transparent' ? '#ffffff' : textBgColor}
              setColor={(newColor) => {
                setTextBgColor(newColor);
              }}
              onClose={() => setShowBgColorPicker(false)}
            />
            {/* Background opacity control */}
            <div className="mt-2 p-2 bg-[#292C31FF] border border-[#44474AFF] rounded">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-[#D4D4D5FF]">Opacity:</Label>
                <span className="text-xs text-[#D4D4D5FF]">{textBgOpacity}%</span>
              </div>
              <Input
                type="range"
                min="0"
                max="100"
                value={textBgOpacity}
                onChange={(e) => setTextBgOpacity(parseInt(e.target.value))}
                className="w-full p-0 m-0"
              />
              <Button
                variant="ghost"
                className="w-full mt-2 p-1 text-xs text-white border-1 border-[#44474AFF]"
                onClick={() => {
                  setTextBgColor('transparent');
                  setTextBgOpacity(0);
                }}
              >
                Transparent
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Toggle individual text style independently
  const toggleStyle = (style: keyof typeof fontStyles) => {
    // Create a new copy of the fontStyles object with the updated value for the specified style
    const updatedFontStyles = {
      ...fontStyles,
      [style]: !fontStyles[style]
    };

    // Update the state with the new object
    setFontStyles(updatedFontStyles);

    // Update the text settings
    setTextSettings(prev => ({
      ...prev,
      fontStyles: updatedFontStyles
    }));

    // If there is a selected element, update its style
    if (selectedElementIndex !== null) {
      updateSelectedElementStyle({ fontStyles: updatedFontStyles });
    }
  };

  const handleCaseChange = (caseType: TextCase) => {
    // Update the state of the text case
    setTextCase(caseType);

    // Update the text settings
    setTextSettings({
      ...textSettings,
      textCase: caseType
    });

    // If there is a selected element, update its case
    if (selectedElementIndex !== null) {
      updateSelectedElementStyle({ textCase: caseType });
    }
  };

  // Handler for text alignment change
  const handleAlignmentChange = (alignment: TextAlignment) => {
    // Update the state of the text alignment
    setTextAlignment(alignment);

    // Update the text settings
    setTextSettings({
      ...textSettings,
      textAlignment: alignment
    });

    // If there is a selected element, update its alignment
    if (selectedElementIndex !== null) {
      updateSelectedElementStyle({ textAlignment: alignment });
    }
  };

  // Add background opacity control
  const handleBackgroundOpacityChange = (value: number) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    // Update the state of the background opacity
    setBackgroundOpacity(clampedValue);

    // Update the text settings
    setTextSettings({
      ...textSettings,
      backgroundOpacity: clampedValue
    });

    // If there is a selected element, update its background opacity
    if (selectedElementIndex !== null) {
      updateSelectedElementStyle({ backgroundOpacity: clampedValue });
    }
  };

  const resetAllStyles = () => {
    setColor("#ffffff");
    setBackgroundColor("transparent");
    setBackgroundOpacity(0);
    setFontSize(16);
    setFontFamily("Arial");
    setFontStyles({ bold: false, italic: false, underline: false, strikethrough: false });
    setTextCase("none");
    setTextAlignment("center");
    setLineHeight(1);
    setBorderColor("#ffffff");
    setBorderWidth(1);
    setBorderStyle("solid");

    if (selectedElementIndex !== null) {
      updateSelectedElementStyle({
        color: "#ffffff",
        backgroundColor: "transparent",
        backgroundOpacity: 0,
        fontSize: 16,
        fontFamily: "Arial",
        fontStyles: { bold: false, italic: false, underline: false, strikethrough: false },
        textCase: "none",
        textAlignment: "center",
        lineHeight: 1,
        borderColor: "#ffffff",
        borderWidth: 1,
        borderStyle: "solid"
      });
    }
  };

  // Render style buttons
  const renderStyleButtons = () => (
    <div className="flex items-center px-2 text-xs text-white rounded">
      <div className="bg-[#292C31FF] border-2 border-[#44474AFF] rounded text-white text-xs p-0 min-w-[100px] grid grid-cols-4">
        {/* Bold */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={`flex items-center justify-center min-w-6 min-h-6 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer relative
                  ${fontStyles.bold ? 'bg-[#3F434AFF] shadow-inner' : 'bg-[#1e1f22]'}`}
                onClick={() => toggleStyle('bold')}
              >
                <Bold size={12} className={fontStyles.bold ? 'text-white' : 'text-[#D4D4D5FF]'} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Italic */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={`flex items-center justify-center min-w-6 min-h-6 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer relative
                  ${fontStyles.italic ? 'bg-[#3F434AFF] shadow-inner' : 'bg-[#1e1f22]'}`}
                onClick={() => toggleStyle('italic')}
              >
                <Italic size={12} className={fontStyles.italic ? 'text-white' : 'text-[#D4D4D5FF]'} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Underline */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={`flex items-center justify-center min-w-6 min-h-6 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer relative
                  ${fontStyles.underline ? 'bg-[#3F434AFF] shadow-inner' : 'bg-[#1e1f22]'}`}
                onClick={() => toggleStyle('underline')}
              >
                <Underline size={12} className={fontStyles.underline ? 'text-white' : 'text-[#D4D4D5FF]'} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Underline</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Strikethrough */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={`flex items-center justify-center min-w-6 min-h-6 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer relative
                  ${fontStyles.strikethrough ? 'bg-[#3F434AFF] shadow-inner' : 'bg-[#1e1f22]'}`}
                onClick={() => toggleStyle('strikethrough')}
              >
                <Strikethrough size={12} className={fontStyles.strikethrough ? 'text-white' : 'text-[#D4D4D5FF]'} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Strikethrough</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  return (
    <div className="flex space-x-2 items-center h-full text-xs">
      {/* Add text button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`flex h-7 gap-1 p-2 text-xs rounded hover:bg-[#3F434AFF] ${
                activeElement?.type === "text" ? 'bg-[#3F434AFF] text-white' : 'text-[#D4D4D5FF]'
              }`}
              onClick={handleAddText}
            >
              <PlusCircle size={14} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add text</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Duplicate button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`flex h-7 gap-1 p-2 text-xs rounded hover:bg-[#3F434AFF] ${
                !isTextElementSelected ? 'opacity-50 cursor-not-allowed text-[#D4D4D5FF]' : 'text-white'
              }`}
              onClick={handleDuplicate}
              disabled={!isTextElementSelected}
            >
              <Copy size={14} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Duplicate text</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Delete button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`flex h-7 gap-1 p-2 text-xs rounded hover:bg-[#3F434AFF] ${
                !isTextElementSelected ? 'opacity-50 cursor-not-allowed text-[#D4D4D5FF]' : 'text-white'
              }`}
              onClick={handleDelete}
              disabled={!isTextElementSelected}
            >
              <Trash2 size={14} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete text</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {renderColorPickers()}

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Font controls */}
      <FontSelector value={fontFamily} onChange={setFontFamily} fonts={fonts} />

      {/* Font size */}
      <NumberInputWithPopover
        label="Size"
        value={fontSize}
        onChange={setFontSize}
        min={8}
        max={72}
        step={1}
        suffix="px"
      />

      {renderStyleButtons()}

      {/* Text case */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center min-w-7 min-h-7 px-2 mr-5 gap-2 text-xs text-white rounded hover:bg-[#3F434AFF] border-2 border-[#44474AFF] bg-[#1e1f22]">
            <Label className="text-xs text-white scale-120">
              {textCase === "none" ? <Baseline size={14} strokeWidth={1.5}/> :
                textCase === "uppercase" ? <CaseUpper size={14} strokeWidth={1.5}/> :
                  textCase === "lowercase" ? <CaseLower size={14} strokeWidth={1.5}/> :
                    textCase === "capitalize" ? <CaseSensitive size={14} strokeWidth={1.5}/> : <Baseline size={14} strokeWidth={1.5}/>}
            </Label>
            <ChevronDown size={12} className="text-white" strokeWidth={1.5}/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 min-w-[150px] grid grid-cols-4">

          {/* Normal */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={`flex items-center px-2 py-1.5 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${textCase === 'none' ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleCaseChange('none')}>
                  <Baseline size={14} color="white" strokeWidth={1.5} className="scale-120"/>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Normal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Uppercase */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={`flex items-center px-2 py-1.5 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${textCase === 'uppercase' ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleCaseChange('uppercase')}>
                  <CaseUpper size={14} color="white" strokeWidth={1.5} className="scale-120"/>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Uppercase</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Lowercase */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={`flex items-center px-2 py-1.5 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${textCase === 'lowercase' ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleCaseChange('lowercase')}>
                  <CaseLower size={14} color="white" strokeWidth={1.5} className="scale-120"/>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lowercase</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Capitalize */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={`flex items-center px-2 py-1.5 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${textCase === 'capitalize' ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleCaseChange('capitalize')}>
                  <CaseSensitive size={14} color="white" strokeWidth={1.5} className="scale-120"/>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Capitalize</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Line height */}
      <NumberInputWithPopover
        label="Line height"
        value={lineHeight}
        onChange={setLineHeight}
        min={0.5}
        max={3}
        step={0.1}
        decimals={1}
        suffix=""
      />

      {/* Text alignment */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center min-w-7 min-h-7 px-2 gap-2 mr-5 ml-2 text-xs text-white rounded hover:bg-[#3F434AFF] border-2 border-[#44474AFF] bg-[#1e1f22]">
            <Label className="text-xs text-white">
              {textAlignment === "left" ? <AlignLeft size={16} /> :
                textAlignment === "center" ? <AlignCenter size={16} /> :
                  textAlignment === "right" ? <AlignRight size={16} /> :
                    textAlignment === "justify" ? <AlignJustify size={16} /> : <AlignCenter size={16} />}
            </Label>
            <ChevronDown size={12} className="text-white" strokeWidth={1.5}/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 min-w-[150px] grid grid-cols-4">

          {/* Left */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={`flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none ${textAlignment === 'left' ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleAlignmentChange('left')}>
                  <AlignLeft size={14} color="white" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Left</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Center */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={`flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none ${textAlignment === 'center' ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleAlignmentChange('center')}>
                  <AlignCenter size={14} color="white" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Center</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Right */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={`flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none ${textAlignment === 'right' ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleAlignmentChange('right')}>
                  <AlignRight size={14} color="white" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Right</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Justify */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={`flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none ${textAlignment === 'justify' ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleAlignmentChange('justify')}>
                  <AlignJustify size={14} color="white" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Justify</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Reset All Styles button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-center px-2 min-w-7 min-h-7 ml-3 hover:bg-[#3F434AFF] rounded cursor-pointer border-2 border-[#44474AFF] bg-[#1e1f22]"
              onClick={resetAllStyles}
            >
              <span className="text-xs text-white">Clear all</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear all text styles</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TextOptions;