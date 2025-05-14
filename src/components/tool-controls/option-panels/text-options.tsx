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

const ColorPicker: React.FC<{ color: string; setColor: (color: string) => void }> = ({ color, setColor }) => {
  const presetColors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#c0c0c0",
    "#808080",
    "#800000",
    "#808000",
    "#008000",
    "#800080",
    "#008080",
    "#000080",
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: color }} />
        <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 p-0 border-0" />
      </div>
      <div className="grid grid-cols-8 gap-1">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            className="w-5 h-5 rounded border border-gray-600"
            style={{ backgroundColor: presetColor }}
            onClick={() => setColor(presetColor)}
          />
        ))}
      </div>
    </div>
  );
};

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
            <ChevronDown size={12} className="text-white ml-0.5" />
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
    borderStyle
  } = useTool();

  const {
    selectedElementIndex,
    duplicateSelectedElement,
    removeSelectedElement,
    elements,
    updateSelectedElementStyle
  } = useElementsManager();

  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [bgColorMenuOpen, setBgColorMenuOpen] = useState(false);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);

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
        if (selectedElement.color) setColor(selectedElement.color);
        if (selectedElement.backgroundColor) setBackgroundColor(selectedElement.backgroundColor);
        if (selectedElement.backgroundOpacity !== undefined) setBackgroundOpacity(selectedElement.backgroundOpacity);
        if (selectedElement.fontSize) setFontSize(selectedElement.fontSize);
        if (selectedElement.lineHeight) setLineHeight(selectedElement.lineHeight);
        if (selectedElement.fontFamily) setFontFamily(selectedElement.fontFamily);
        if (selectedElement.textAlignment) setTextAlignment(selectedElement.textAlignment);
        if (selectedElement.fontStyles) setFontStyles(selectedElement.fontStyles);
        if (selectedElement.textCase) setTextCase(selectedElement.textCase);
        if (selectedElement.borderColor) setBorderColor(selectedElement.borderColor);
        if (selectedElement.borderWidth !== undefined) setBorderWidth(selectedElement.borderWidth);
        if (selectedElement.borderStyle) setBorderStyle(selectedElement.borderStyle);
      }
    }
  }, [selectedElementIndex, elements]);

  // Update selected element when tool settings change
  useEffect(() => {
    if (selectedElementIndex !== null) {
      const selectedElement = elements[selectedElementIndex];
      if (selectedElement && selectedElement.type === "text") {
        // Track what properties have actually been changed by the user
        const elementUpdates: Partial<ElementData> = {};

        // Only include properties that have actually changed
        if (selectedElement.color !== color) elementUpdates.color = color;
        if (selectedElement.backgroundColor !== backgroundColor) elementUpdates.backgroundColor = backgroundColor;
        if (selectedElement.backgroundOpacity !== backgroundOpacity) elementUpdates.backgroundOpacity = backgroundOpacity;
        if (selectedElement.fontSize !== fontSize) elementUpdates.fontSize = fontSize;
        if (selectedElement.lineHeight !== lineHeight) elementUpdates.lineHeight = lineHeight;
        if (selectedElement.fontFamily !== fontFamily) elementUpdates.fontFamily = fontFamily;
        if (selectedElement.textAlignment !== textAlignment) elementUpdates.textAlignment = textAlignment;
        if (JSON.stringify(selectedElement.fontStyles) !== JSON.stringify(fontStyles)) elementUpdates.fontStyles = { ...fontStyles };
        if (selectedElement.textCase !== textCase) elementUpdates.textCase = textCase;
        if (selectedElement.borderColor !== borderColor) elementUpdates.borderColor = borderColor;
        if (selectedElement.borderWidth !== borderWidth) elementUpdates.borderWidth = borderWidth;
        if (selectedElement.borderStyle !== borderStyle) elementUpdates.borderStyle = borderStyle;

        // Only update if there are actual changes
        if (Object.keys(elementUpdates).length > 0) {
          updateSelectedElementStyle(elementUpdates);
        }
      }
    }
  }, [
    color, backgroundColor, backgroundOpacity, fontSize, lineHeight,
    fontFamily, textAlignment, fontStyles, textCase, borderColor,
    borderWidth, borderStyle, selectedElementIndex
  ]);

  // Update textSettings when any property changes
  useEffect(() => {
    console.log('Current fontStyles state:', fontStyles);
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
    const element = {
      id: "text",
      type: "text",
      icon: Type,
      // Add current text settings to the element
      settings: {
        color,
        backgroundColor,
        backgroundOpacity,
        fontSize,
        fontFamily,
        fontStyles: { ...fontStyles },
        textCase,
        textAlignment,
        lineHeight,
        borderColor,
        borderWidth,
        borderStyle
      }
    };

    // Set the element as the active tool
    setActiveElement(element);
  };

  // Toggle individual text style independently
  const toggleStyle = (style: keyof typeof fontStyles) => {
    // Create a new copy of the fontStyles object with the updated value for the specified style
    const updatedFontStyles = {
      ...fontStyles,
      [style]: !fontStyles[style]
    };

    // Update the state with the new object
    setFontStyles(updatedFontStyles);

    // Also update the text settings
    setTextSettings({
      ...textSettings,
      fontStyles: updatedFontStyles
    });

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

  return (
    <div className="flex space-x-2 items-center h-full text-xs">
      {/* Add text button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-7 gap-1 p-2 text-white text-xs hover:bg-[#3F434AFF] rounded"
              onClick={handleAddText}>
              <PlusCircle size={14} />
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
              className={`flex h-7 gap-1 p-2 text-white text-xs hover:bg-[#3F434AFF] rounded ${selectedElementIndex === null ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={duplicateSelectedElement}
              disabled={selectedElementIndex === null}>
              <Copy size={14} />
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
              className={`flex h-7 gap-1 p-2 text-white text-xs hover:bg-[#3F434AFF] rounded ${selectedElementIndex === null ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={removeSelectedElement}
              disabled={selectedElementIndex === null}>
              <Trash2 size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete text</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Color picker */}
      <Popover open={colorMenuOpen} onOpenChange={setColorMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]">
            <p className="text-xs text-[#D4D4D5FF]">Text</p>
            <div className="w-5 h-5 rounded-xl border border-gray-500" style={{ backgroundColor: color }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-[#292C31FF] border-2 border-[#44474AFF]">
          <ColorPicker color={color} setColor={setColor} />
        </PopoverContent>
      </Popover>

      {/* Background color picker */}
      <Popover open={bgColorMenuOpen} onOpenChange={setBgColorMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]">
            <p className="text-xs text-[#D4D4D5FF]">Background</p>
            <div className="w-5 h-5 rounded-xl border border-gray-500" style={{ backgroundColor: backgroundColor === 'transparent' ? '#ffffff' : backgroundColor }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-[#292C31FF] border-2 border-[#44474AFF]">
          <div className="space-y-5">

            {/* Background opacity slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-[#D4D4D5FF]">Opacity:</Label>
                <span className="text-xs text-[#D4D4D5FF]">{backgroundOpacity}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={backgroundOpacity}
                  onChange={(e) => handleBackgroundOpacityChange(parseInt(e.target.value))}
                  className="h-1.5 w-full p-0 m-0"
                />
              </div>
            </div>

            {/* Transparent option */}
            <Button
              variant="ghost"
              className="text-xs text-white rounded hover:bg-[#3F434AFF] w-full h-7 border-2 border-[#44474AFF]"
              onClick={() => setBackgroundColor('transparent')}
            >
              Transparent background
            </Button>

            <ColorPicker color={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor} setColor={setBackgroundColor} />
          </div>
        </PopoverContent>
      </Popover>

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

      {/* Text style */}
      <div className="flex items-center px-2 text-xs text-white rounded">
        <div className="bg-[#292C31FF] border-2 border-[#44474AFF] rounded text-white text-xs p-0 min-w-[100px] grid grid-cols-4">

          {/* Bold */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={`flex items-center justify-center min-w-7 min-h-7 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer relative
                    ${fontStyles.bold ? 'bg-[#3F434AFF] shadow-inner border-b-2 border-blue-400' : 'bg-[#1e1f22]'}`}
                  onClick={() => toggleStyle('bold')}
                >
                  <Bold size={14} className={`transition-all ${fontStyles.bold ? 'text-white' : 'text-[#D4D4D5FF]'}`} />
                  {fontStyles.bold && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-400 rounded-full"></span>
                  )}
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
                  className={`flex items-center justify-center min-w-7 min-h-7 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer relative
                    ${fontStyles.italic ? 'bg-[#3F434AFF] shadow-inner border-b-2 border-blue-400' : 'bg-[#1e1f22]'}`}
                  onClick={() => toggleStyle('italic')}
                >
                  <Italic size={14} className={`transition-all ${fontStyles.italic ? 'text-white' : 'text-[#D4D4D5FF]'}`} />
                  {fontStyles.italic && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-400 rounded-full"></span>
                  )}
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
                  className={`flex items-center justify-center min-w-7 min-h-7 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer relative
                    ${fontStyles.underline ? 'bg-[#3F434AFF] shadow-inner border-b-2 border-blue-400' : 'bg-[#1e1f22]'}`}
                  onClick={() => toggleStyle('underline')}
                >
                  <Underline size={14} className={`transition-all ${fontStyles.underline ? 'text-white' : 'text-[#D4D4D5FF]'}`} />
                  {fontStyles.underline && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-400 rounded-full"></span>
                  )}
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
                  className={`flex items-center justify-center min-w-7 min-h-7 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer relative
                    ${fontStyles.strikethrough ? 'bg-[#3F434AFF] shadow-inner border-b-2 border-blue-400' : 'bg-[#1e1f22]'}`}
                  onClick={() => toggleStyle('strikethrough')}
                >
                  <Strikethrough size={14} className={`transition-all ${fontStyles.strikethrough ? 'text-white' : 'text-[#D4D4D5FF]'}`} />
                  {fontStyles.strikethrough && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-400 rounded-full"></span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Strikethrough</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Text case */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center min-w-7 min-h-7 px-2 gap-2 text-xs text-white rounded hover:bg-[#3F434AFF] border-2 border-[#44474AFF] bg-[#1e1f22]">
            <Label className="text-xs text-white scale-120">
              {textCase === "none" ? <Baseline size={14} strokeWidth={1.5}/> :
                textCase === "uppercase" ? <CaseUpper size={14} strokeWidth={1.5}/> :
                  textCase === "lowercase" ? <CaseLower size={14} strokeWidth={1.5}/> :
                    textCase === "capitalize" ? <CaseSensitive size={14} strokeWidth={1.5}/> : <Baseline size={14} strokeWidth={1.5}/>}
            </Label>
            <ChevronDown size={14} className="text-white" />
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
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded hover:bg-[#3F434AFF] ">
            <Label className="text-xs text-[#D4D4D5FF]">
              {textAlignment === "left" ? <AlignLeft size={16} /> :
                textAlignment === "center" ? <AlignCenter size={16} /> :
                  textAlignment === "right" ? <AlignRight size={16} /> :
                    textAlignment === "justify" ? <AlignJustify size={16} /> : <AlignCenter size={16} />}
            </Label>
            <ChevronDown size={12} className="text-white" />
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

      {/* Reset All Styles button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-center px-2 min-w-7 min-h-7 ml-1 hover:bg-[#3F434AFF] rounded cursor-pointer border-2 border-[#44474AFF] bg-[#1e1f22]"
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