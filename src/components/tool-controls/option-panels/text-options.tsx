import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import { TooltipContent, TooltipTrigger, Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import type { TextCase, Element, ElementData, FontStyles, TextAlignment, BorderStyle } from "@/types/canvas";
import { useElementsManager } from "@/context/elements-manager-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import ColorPicker from "@/components/color-picker/color-picker";
import { Slider } from "@/components/ui/slider";
import { colorToRGBA } from "@/components/tool-controls/option-panels/common";

// Add this at the top of the file with other imports
declare global {
  interface Window {
    webster: {
      getCurrentTextSettings?: () => Element;
    };
  }
}

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
  onMenuWillOpen: () => void;
}> = ({ value, onChange, fonts, onMenuWillOpen }) => {
  return (
    <div className="flex items-center space-x-2">
      <Label className="text-xs text-[#D4D4D5FF] pl-3">Font:</Label>
      <DropdownMenu onOpenChange={(isOpen) => { if (isOpen) onMenuWillOpen(); }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
            <span style={{ fontFamily: value }}>{value}</span>
            <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
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
                  className={`flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer ${value === font ? "bg-[#3F434AFF] rounded-sm" : ""}`}
                  onClick={() => onChange(font)}
                  style={{ fontFamily: font }}
                >
                  {/* {value === font && <Check size={14} className="text-blue-400" />} */}
                  <span>{font}</span>
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
    // Destructure text-specific properties from context
    textColor: contextTextColor,
    setTextColor: contextSetTextColor,
    textBgColor: contextTextBgColor,
    setTextBgColor: contextSetTextBgColor,
    textBgOpacity: contextTextBgOpacity,
    setTextBgOpacity: contextSetTextBgOpacity,
    // General text properties from context
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
    // Get new text color opacity from context
    textColorOpacity,
    setTextColorOpacity,
    // Border properties from context (assuming they are shared or applicable to text)
    borderColor: contextBorderColor, // Renaming to avoid conflict if used elsewhere for general border
    setBorderColor: contextSetBorderColor,
    borderWidth: contextBorderWidth, // Renaming
    setBorderWidth: contextSetBorderWidth,
    borderStyle: contextBorderStyle, // Renaming
    setBorderStyle: contextSetBorderStyle,
    activeElement,
    // Add mode context
    isAddModeActive,
    setIsAddModeActive,
    currentAddToolType,
    setCurrentAddToolType,
    setActiveTool: setContextActiveTool,
    activeTool,
  } = useTool();

  const {
    selectedElementId,
    duplicateSelectedElement,
    removeSelectedElement,
    getElementDataFromRenderables,
    updateSelectedElementStyle
  } = useElementsManager();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  // Removed local states for textColor, textBgColor, textBgOpacity
  const textBgOpacityInputRef = useRef<HTMLInputElement>(null);
  const [tempTextBgOpacityInput, setTempTextBgOpacityInput] = useState<string>(() => String(Math.round(contextTextBgOpacity)));
  // New refs and temp state for text color opacity
  const textColorOpacityInputRef = useRef<HTMLInputElement>(null);
  const [tempTextColorOpacityInput, setTempTextColorOpacityInput] = useState<string>(() => String(Math.round(textColorOpacity)));

  // Refs for opacity/transparent control containers
  const textColorControlsRef = useRef<HTMLDivElement>(null!); // Use null! for HTMLElement compatibility
  const textBgControlsRef = useRef<HTMLDivElement>(null!); // Use null! for HTMLElement compatibility

  const closeOtherPickers = () => {
    // This function can be expanded if other types of pickers/popovers are added
    setShowColorPicker(false);
    setShowBgColorPicker(false);
  };

  // Sync tool state with selected element
  useEffect(() => {
    if (selectedElementId !== null) {
      const elements = getElementDataFromRenderables();
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement && selectedElement.type === "text") {
        // Update tool state (context) with selected element properties
        contextSetTextColor(selectedElement.color || "#ffffff");
        setTextColorOpacity(selectedElement.textColorOpacity !== undefined ? selectedElement.textColorOpacity : 100); // Sync text color opacity
        contextSetTextBgColor(selectedElement.backgroundColor || "transparent");
        contextSetTextBgOpacity(selectedElement.backgroundOpacity !== undefined ? selectedElement.backgroundOpacity : 0);
        setFontSize(selectedElement.fontSize || 16);
        setLineHeight(selectedElement.lineHeight || 1);
        setFontFamily(selectedElement.fontFamily || "Arial");
        setTextAlignment(selectedElement.textAlignment || "center");
        setFontStyles(selectedElement.fontStyles || { bold: false, italic: false, underline: false, strikethrough: false });
        setTextCase(selectedElement.textCase || "none");
        contextSetBorderColor(selectedElement.borderColor || "#ffffff"); // Use context setter
        contextSetBorderWidth(selectedElement.borderWidth !== undefined ? selectedElement.borderWidth : 1); // Use context setter
        contextSetBorderStyle(selectedElement.borderStyle || "solid"); // Use context setter
      }
    }
  }, [selectedElementId, getElementDataFromRenderables, contextSetTextColor, setTextColorOpacity, contextSetTextBgColor, contextSetTextBgOpacity, setFontSize, setLineHeight, setFontFamily, setTextAlignment, setFontStyles, setTextCase, contextSetBorderColor, contextSetBorderWidth, contextSetBorderStyle]);

  // Update selected element when text settings change (context values are the source of truth)
  useEffect(() => {
    if (selectedElementId !== null) {
      const elements = getElementDataFromRenderables();
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement && selectedElement.type === "text") {
        const updatedStyles: Partial<ElementData> = {
          color: contextTextColor,
          textColorOpacity: textColorOpacity, // Add text color opacity to update
          backgroundColor: contextTextBgColor,
          backgroundOpacity: contextTextBgOpacity,
          fontSize,
          lineHeight,
          fontFamily,
          textAlignment,
          fontStyles: { ...fontStyles },
          textCase,
          borderColor: contextBorderColor,
          borderWidth: contextBorderWidth,
          borderStyle: contextBorderStyle
        };

        // Only update if values have actually changed
        const hasChanges = Object.entries(updatedStyles).some(([key, value]) => {
          if (key === 'fontStyles') {
            return Object.entries(value as FontStyles).some(([styleKey, styleValue]) =>
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
    contextTextColor,
    textColorOpacity, // Add to dependency array
    contextTextBgColor,
    contextTextBgOpacity,
    fontSize,
    lineHeight,
    fontFamily,
    textAlignment,
    fontStyles,
    textCase,
    contextBorderColor,
    contextBorderWidth,
    contextBorderStyle,
    selectedElementId,
    getElementDataFromRenderables,
    updateSelectedElementStyle
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

  // Function to get the current text settings
  const getCurrentTextSettings = (): Element => ({ // Ensure return type matches Element
    id: "text-template", // Use a template ID
    type: "text",
    icon: Type,
    // Settings here should match the structure expected by useElementsManagement for 'text'
    // and what ElementData expects for text.
    // The 'text' sub-object matches the `Element` type.
    text: {
      color: contextTextColor,
      backgroundColor: contextTextBgColor,
      backgroundOpacity: contextTextBgOpacity,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fontStyles: { ...fontStyles },
      textCase: textCase,
      lineHeight: lineHeight,
      textAlignment: textAlignment,
    },
    // Also include direct properties if Element can have them, or if ElementData is the target
    settings: { // This structure might be more aligned with ElementData
      color: contextTextColor,
      backgroundColor: contextTextBgColor,
      backgroundOpacity: contextTextBgOpacity,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fontStyles: { ...fontStyles },
      textCase: textCase,
      lineHeight: lineHeight,
      textAlignment: textAlignment,
      borderColor: contextBorderColor,
      borderWidth: contextBorderWidth,
      borderStyle: contextBorderStyle,
    }
  });

  const handleAddText = () => {
    // The text tool should already be active if this panel is visible.
    // No need to call setContextActiveTool here.
    // const textTool: Tool = { 
    //   id: "text-tool", // This ID differs from toolbar's "text", potentially causing re-keying
    //   name: "Text",
    //   type: "text", 
    //   icon: Type 
    // }; 
    // setContextActiveTool(textTool); 

    setActiveElement(getCurrentTextSettings());
    setIsAddModeActive(true);
    setCurrentAddToolType("text");
  };

  // Export getCurrentTextSettings through useEffect for access from other components
  useEffect(() => {
    if (window.webster === undefined) {
      window.webster = {};
    }
    window.webster.getCurrentTextSettings = getCurrentTextSettings;
  }, [
    contextTextColor,
    textColorOpacity, // Add to dependency array
    contextTextBgColor,
    contextTextBgOpacity,
    fontSize,
    fontFamily,
    fontStyles,
    textCase,
    lineHeight,
    textAlignment,
    contextBorderColor, // Add border properties to dependency array
    contextBorderWidth,
    contextBorderStyle
    // getCurrentTextSettings is not stable if it's not wrapped in useCallback
    // and its dependencies are all listed here
  ]);

  // Check if the selected element is a text element
  const isTextElementSelected = selectedElementId !== null &&
    getElementDataFromRenderables().find(el => el.id === selectedElementId)?.type === "text" &&
    (activeTool?.type === "text" || activeTool?.type === "cursor"); // Allow if text or cursor tool is active

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

  const handleTextBgOpacitySliderValueChange = (value: number[]) => {
    const newTextBgOpacity = Math.round(value[0]);
    contextSetTextBgOpacity(newTextBgOpacity); // Use context setter
    setTempTextBgOpacityInput(String(newTextBgOpacity));
  };

  const handleTextBgOpacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    inputValue = inputValue.replace(/[^\d]/g, "");

    if (inputValue === "") {
      setTempTextBgOpacityInput("");
      return;
    }

    let num = parseInt(inputValue, 10);

    if (isNaN(num)) {
      setTempTextBgOpacityInput(inputValue);
      return;
    }

    if (num > 100) {
      num = 100;
      inputValue = String(100);
    }

    setTempTextBgOpacityInput(inputValue);
  };

  const handleTextBgOpacityInputBlur = () => {
    let currentNum = parseInt(tempTextBgOpacityInput, 10);

    if (isNaN(currentNum) || tempTextBgOpacityInput.trim() === "") {
      currentNum = 0; // Default to 0 if input is invalid
    }
    currentNum = Math.max(0, Math.min(100, currentNum));
    contextSetTextBgOpacity(currentNum); // Use context setter
    setTempTextBgOpacityInput(String(currentNum));
  };

  const handleTextColorOpacitySliderValueChange = (value: number[]) => {
    const newTextColorOpacity = Math.round(value[0]);
    setTextColorOpacity(newTextColorOpacity);
    setTempTextColorOpacityInput(String(newTextColorOpacity));
  };

  const handleTextColorOpacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    inputValue = inputValue.replace(/[^\d]/g, "");
    if (inputValue === "") {
      setTempTextColorOpacityInput("");
      return;
    }
    let num = parseInt(inputValue, 10);
    if (isNaN(num)) {
      setTempTextColorOpacityInput(inputValue);
      return;
    }
    if (num > 100) num = 100;
    setTempTextColorOpacityInput(String(num));
  };

  const handleTextColorOpacityInputBlur = () => {
    let currentNum = parseInt(tempTextColorOpacityInput, 10);
    if (isNaN(currentNum) || tempTextColorOpacityInput.trim() === "") currentNum = 0;
    currentNum = Math.max(0, Math.min(100, currentNum));
    setTextColorOpacity(currentNum);
    setTempTextColorOpacityInput(String(currentNum));
  };

  // Replace the existing color picker buttons with new ones
  const renderColorPickers = () => (
    <>
      {/* Text Color Picker */}
      <div className="relative ml-3 mr-5">
        <Button
          variant="ghost"
          className="h-7 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <p className="text-xs text-[#D4D4D5FF]">Text</p>
          <div
            className="w-5 h-5 rounded-xl border border-gray-500"
            style={{ backgroundColor: contextTextColor, opacity: textColorOpacity / 100 }} // Use context value & text color opacity
          />
        </Button>
        {showColorPicker && (
          <div className="absolute z-50 top-full left-0 mt-2">
            {/* Text color opacity control */}
            <div ref={textColorControlsRef} className="mt-0 p-2 bg-[#292C31FF] border border-[#44474AFF] rounded flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-[#D4D4D5FF]">Opacity:</Label>
                <div
                  className="flex items-center h-6 bg-[#202225FF] border-2 border-[#44474AFF] rounded px-1.5 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text"
                  onClick={() => textColorOpacityInputRef.current?.focus()}
                >
                  <Input
                    ref={textColorOpacityInputRef}
                    type="text"
                    value={tempTextColorOpacityInput}
                    onChange={handleTextColorOpacityInputChange}
                    onBlur={handleTextColorOpacityInputBlur}
                    onKeyDown={(e) => { if (e.key === 'Enter') textColorOpacityInputRef.current?.blur(); }}
                    className="w-7 bg-transparent border-none text-xs text-white text-center focus:ring-0 p-0"
                    maxLength={3}
                  />
                  <span className="text-xs text-[#A8AAACFF]">%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Slider
                  id="text-color-opacity-slider"
                  min={0}
                  max={100}
                  step={1}
                  value={[textColorOpacity]}
                  onValueChange={handleTextColorOpacitySliderValueChange}
                  className="flex-grow"
                />
              </div>
            </div>
            <ColorPicker
              color={contextTextColor}
              setColor={(newColor) => {
                contextSetTextColor(newColor);
              }}
              onClose={() => setShowColorPicker(false)}
              additionalRefs={[textColorControlsRef]} // Pass the ref here
            />
          </div>
        )}
      </div>

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Background Color Picker */}
      <div className="relative ml-2">
        <Button
          variant="ghost"
          className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]"
          onClick={() => setShowBgColorPicker(!showBgColorPicker)}
        >
          <p className="text-xs text-[#D4D4D5FF]">Background</p>
          <div
            className="w-5 h-5 rounded-xl border border-gray-500"
            style={{
              backgroundColor: colorToRGBA(contextTextBgColor, contextTextBgOpacity)
            }}
          />
        </Button>
        {showBgColorPicker && (
          <div className="absolute z-50 top-full left-0 mt-2">
            {/* Background opacity control */}
            <div ref={textBgControlsRef} className="mt-0 p-2 bg-[#292C31FF] border border-[#44474AFF] rounded flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-[#D4D4D5FF]">Opacity:</Label>
                <div
                  className="flex items-center h-6 bg-[#202225FF] border-2 border-[#44474AFF] rounded px-1.5 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text"
                  onClick={() => textBgOpacityInputRef.current?.focus()}
                >
                  <Input
                    ref={textBgOpacityInputRef}
                    type="text"
                    value={tempTextBgOpacityInput}
                    onChange={handleTextBgOpacityInputChange}
                    onBlur={handleTextBgOpacityInputBlur}
                    onKeyDown={(e) => { if (e.key === 'Enter') textBgOpacityInputRef.current?.blur(); }}
                    className="w-7 bg-transparent border-none text-xs text-white text-center focus:ring-0 p-0"
                    maxLength={3}
                  />
                  <span className="text-xs text-[#A8AAACFF]">%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Slider
                  id="text-bg-opacity-slider"
                  min={0}
                  max={100}
                  step={1}
                  value={[contextTextBgOpacity]} // Use context value
                  onValueChange={handleTextBgOpacitySliderValueChange}
                  className="flex-grow"
                />
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2 p-1 text-xs text-white border-1 border-[#44474AFF]"
                onClick={(e) => {
                  // e.stopPropagation();
                  contextSetTextBgColor('#ffffff'); // Use context setter
                  contextSetTextBgOpacity(0); // Use context setter
                  setTempTextBgOpacityInput("0");
                }}
              >
                Transparent
              </Button>
            </div>
            <ColorPicker
              color={contextTextBgColor === 'transparent' ? '#ffffff' : contextTextBgColor} // Use context value
              setColor={(newColor) => {
                contextSetTextBgColor(newColor); // Use context setter
                if (newColor === 'transparent') {
                  contextSetTextBgOpacity(0);
                  setTempTextBgOpacityInput("0");
                }
              }}
              onClose={() => setShowBgColorPicker(false)}
              additionalRefs={[textBgControlsRef]} // Pass the ref here
            />
          </div>
        )}
      </div>
    </>
  );

  // Toggle individual text style independently
  const toggleStyle = (style: keyof FontStyles) => {
    const updatedFontStyles = {
      ...fontStyles,
      [style]: !fontStyles[style]
    };
    setFontStyles(updatedFontStyles);
    if (selectedElementId !== null) {
      updateSelectedElementStyle({ fontStyles: updatedFontStyles });
    }
  };

  const handleCaseChange = (caseType: TextCase) => {
    setTextCase(caseType);
    if (selectedElementId !== null) {
      updateSelectedElementStyle({ textCase: caseType });
    }
  };

  // Handler for text alignment change
  const handleAlignmentChange = (alignment: TextAlignment) => {
    setTextAlignment(alignment);
    if (selectedElementId !== null) {
      updateSelectedElementStyle({ textAlignment: alignment });
    }
  };

  const resetAllStyles = () => {
    setFontSize(16);
    setFontFamily("Arial");
    setFontStyles({ bold: false, italic: false, underline: false, strikethrough: false });
    setTextCase("none");
    setTextAlignment("center");
    setLineHeight(1);
    contextSetTextColor("#ffffff");
    setTextColorOpacity(100);
    setTempTextColorOpacityInput("100");
    contextSetTextBgColor("transparent");
    contextSetTextBgOpacity(0);
    setTempTextBgOpacityInput("0");
    contextSetBorderColor("#000000");
    contextSetBorderWidth(0);
    contextSetBorderStyle("hidden");

    if (selectedElementId !== null) {
      updateSelectedElementStyle({
        fontSize: 16,
        fontFamily: "Arial",
        fontStyles: { bold: false, italic: false, underline: false, strikethrough: false },
        textCase: "none",
        textAlignment: "center",
        lineHeight: 1,
        color: "#ffffff",
        textColorOpacity: 100, // Reset text color opacity in element
        backgroundColor: "transparent",
        backgroundOpacity: 0, // Reset text background opacity in element to 0
        borderColor: "#000000",
        borderWidth: 0,
        borderStyle: "hidden",
      });
    }
  };

  // Render style buttons
  const renderStyleButtons = () => (
    <div className="flex items-center space-x-2 ml-3 mr-5">
      <Label className="text-xs text-[#D4D4D5FF]">Style:</Label>
      <div className="flex items-center text-xs text-white rounded">
        <div className="bg-[#292C31FF] border-2 border-[#44474AFF] rounded text-white text-xs p-0 min-w-[100px] grid grid-cols-4">
          {/* Bold */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={`flex items-center justify-center min-w-6 min-h-6 hover:bg-[#3F434AFF] rounded-none cursor-pointer relative
                  ${fontStyles.bold ? 'bg-[#3F434AFF] shadow-inner text-white' : 'bg-[#1e1f22]'}`}
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
                  className={`flex items-center justify-center min-w-6 min-h-6 hover:bg-[#3F434AFF] rounded-none cursor-pointer relative
                  ${fontStyles.italic ? 'bg-[#3F434AFF] shadow-inner text-white' : 'bg-[#1e1f22]'}`}
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
                  className={`flex items-center justify-center min-w-6 min-h-6 hover:bg-[#3F434AFF] rounded-none cursor-pointer relative
                  ${fontStyles.underline ? 'bg-[#3F434AFF] shadow-inner text-white' : 'bg-[#1e1f22]'}`}
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
                  className={`flex items-center justify-center min-w-6 min-h-6 hover:bg-[#3F434AFF] rounded-none cursor-pointer relative
                  ${fontStyles.strikethrough ? 'bg-[#3F434AFF] shadow-inner text-white' : 'bg-[#1e1f22]'}`}
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
              className={`flex h-7 gap-1 p-2 text-xs rounded hover:bg-[#3F434AFF] 
                ${activeElement?.type === "text" && isAddModeActive && currentAddToolType === "text"
                  ? 'bg-[#3F434AFF] text-white'
                  : 'text-[#D4D4D5FF]'}`}
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
              className={`flex h-7 gap-1 p-2 text-xs rounded hover:bg-[#3F434AFF] 
                ${!isTextElementSelected ? 'opacity-50 cursor-not-allowed text-[#D4D4D5FF]' : 'text-white'}`}
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
              className={`flex h-7 gap-1 p-2 text-xs rounded hover:bg-[#3F434AFF] 
                ${!isTextElementSelected ? 'opacity-50 cursor-not-allowed text-[#D4D4D5FF]' : 'text-white'}`}
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

      {/* Font controls */}
      <FontSelector value={fontFamily} onChange={setFontFamily} fonts={fonts} onMenuWillOpen={closeOtherPickers} />

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
      <div className="flex items-center space-x-2">
        <Label className="text-xs text-[#D4D4D5FF]">Case:</Label>
        <DropdownMenu onOpenChange={(isOpen) => { if (isOpen) closeOtherPickers(); }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center min-w-3 min-h-7 px-2 gap-2 text-xs text-white rounded hover:bg-[#3F434AFF] border-2 border-[#44474AFF] bg-[#1e1f22]">
              <Label className="text-xs text-white scale-120">
                {textCase === "none" ? <Baseline size={14} strokeWidth={1.5} /> :
                  textCase === "uppercase" ? <CaseUpper size={14} strokeWidth={1.5} /> :
                    textCase === "lowercase" ? <CaseLower size={14} strokeWidth={1.5} /> :
                      textCase === "capitalize" ? <CaseSensitive size={14} strokeWidth={1.5} /> : <Baseline size={14} strokeWidth={1.5} />}
              </Label>
              <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
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
                    <Baseline size={14} color="white" strokeWidth={1.5} className="scale-120" />
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
                    <CaseUpper size={14} color="white" strokeWidth={1.5} className="scale-120" />
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
                    <CaseLower size={14} color="white" strokeWidth={1.5} className="scale-120" />
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
                    <CaseSensitive size={14} color="white" strokeWidth={1.5} className="scale-120" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Capitalize</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {renderColorPickers()}

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
      <div className="flex items-center space-x-2 mr-5 ml-3">
        <Label className="text-xs text-[#D4D4D5FF]">Align:</Label>
        <DropdownMenu onOpenChange={(isOpen) => { if (isOpen) closeOtherPickers(); }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center min-w-7 min-h-7 px-2 gap-2 text-xs text-white rounded hover:bg-[#3F434AFF] border-2 border-[#44474AFF] bg-[#1e1f22]">
              <Label className="text-xs text-white">
                {textAlignment === "left" ? <AlignLeft size={16} /> :
                  textAlignment === "center" ? <AlignCenter size={16} /> :
                    textAlignment === "right" ? <AlignRight size={16} /> :
                      textAlignment === "justify" ? <AlignJustify size={16} /> : <AlignCenter size={16} />}
              </Label>
              <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
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
      </div>

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Reset All Styles button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-center px-2 min-w-7 min-h-7 ml-3 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
              onClick={resetAllStyles}
            >
              <span className="text-xs">Reset all</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset all text styles</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TextOptions;