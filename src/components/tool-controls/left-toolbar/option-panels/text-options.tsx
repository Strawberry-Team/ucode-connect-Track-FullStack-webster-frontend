import React, { useState, useEffect, useRef } from "react";
import { useTool } from "@/context/tool-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlignCenter, AlignLeft, AlignRight, AlignJustify, Bold, Italic, Underline, Type, PlusCircle, Trash2, Copy, Strikethrough, Baseline, ChevronDown, CaseSensitive, CaseUpper, CaseLower, RotateCcw, Layers, MoveUp, Highlighter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import { TooltipContent, TooltipTrigger, Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import type { TextCase, Element, ElementData, FontStyles, TextAlignment } from "@/types/canvas";
import { useElementsManager } from "@/context/elements-manager-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import ColorPicker from "@/components/color-picker/color-picker";
import { Slider } from "@/components/ui/slider";
import { colorToRGBA } from "./common";
import { loadGoogleFont, isGoogleFont } from "@/utils/font-utils";
// API imports
import { loadGoogleFonts as loadGoogleFontsAPI, type GoogleFont as GoogleFontAPI } from '@/lib/api/google-fonts';

// Add types and interfaces for Google Fonts
interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: { [key: string]: string };
  category: string;
  kind: string;
  menu: string;
}

interface GoogleFontsResponse {
  kind: string;
  items: GoogleFont[];
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

// Updated FontSelector component
const FontSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
  fonts: string[];
  onMenuWillOpen: () => void;
}> = ({ value, onChange, fonts, onMenuWillOpen }) => {
  const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const [maxLoadedCount, setMaxLoadedCount] = useState(10);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Your Google Fonts API key
  const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY || '';  // Load fonts from Google Fonts API
  
  const loadGoogleFonts = async () => {
    if (isLoading || googleFonts.length > 0) return;

    setIsLoading(true);
    try {
      const fonts = await loadGoogleFontsAPI();
      setGoogleFonts(fonts || []);
    } catch (error) {
      console.error('Failed to load Google Fonts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load font into DOM using utility function
  const loadFont = (fontFamily: string) => {
    if (loadedFonts.has(fontFamily)) return;

    // Use the utility function
    loadGoogleFont(fontFamily);
    setLoadedFonts(prev => new Set([...prev, fontFamily]));
  };

  // Filter fonts by search query
  const filteredGoogleFonts = googleFonts.filter(font =>
    font.family.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (displayCount > maxLoadedCount) {
      setMaxLoadedCount(displayCount);
    }
  }, [displayCount, maxLoadedCount]);

  useEffect(() => {
    if (searchQuery === "") {
      setDisplayCount(maxLoadedCount);
    } else {
      setDisplayCount(10);
    }
  }, [searchQuery, maxLoadedCount]);

  // Preload fonts for displayed Google Fonts
  useEffect(() => {
    filteredGoogleFonts.slice(0, displayCount).forEach(font => {
      loadFont(font.family);
    });
  }, [filteredGoogleFonts, displayCount]);

  // Handle scroll for loading more fonts
  useEffect(() => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');

    const handleScroll = () => {
      if (!scrollArea) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      if (scrollHeight - scrollTop - clientHeight < 50) {
        setDisplayCount(prev => {
          const newCount = Math.min(prev + 10, filteredGoogleFonts.length);
          return newCount;
        });
      }
    };

    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
      return () => scrollArea.removeEventListener('scroll', handleScroll);
    }
  }, [filteredGoogleFonts.length]);

  // Handle font selection
  const handleFontSelect = (fontFamily: string) => {
    if (googleFonts.some(font => font.family === fontFamily)) {
      loadFont(fontFamily);
    }
    onChange(fontFamily);
  };

  // Handle manual load more
  const handleLoadMore = () => {
    setDisplayCount(prev => {
      const newCount = Math.min(prev + 10, filteredGoogleFonts.length);
      return newCount;
    });
  };

  // Handle search input change - prevent focus loss
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event bubbling
    setSearchQuery(e.target.value);
  };

  // Handle input focus/blur
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="flex items-center space-x-2">
      <Label className="text-xs text-[#D4D4D5FF] pl-3">Font:</Label>
      <DropdownMenu onOpenChange={(isOpen) => { 
        if (isOpen) {
          onMenuWillOpen();
          loadGoogleFonts();
          if (searchQuery === "") {
            setDisplayCount(maxLoadedCount);
          }
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        } else {
          setSearchQuery("");
        }
      }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
            <span style={{ fontFamily: value }}>{value}</span>
            <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 relative m-0"
          onCloseAutoFocus={(e) => e.preventDefault()} 
        >
          <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
          
          {/* Search */}
          <div className="p-2 border-b border-[#44474AFF]">
            <Input
              ref={inputRef}
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-7 bg-[#1e1f22] border border-[#44474AFF] text-white text-xs placeholder-gray-400"
              autoComplete="off"
            />
          </div>

          <ScrollArea 
            className="h-[200px] w-[250px]"
            ref={scrollAreaRef}
          >
            <div className="p-1">
              {/* Default fonts */}
              {fonts
                .filter(font => font.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((font) => (
                  <DropdownMenuItem
                    key={`default-${font}`}
                    className={`flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer ${value === font ? "bg-[#3F434AFF] rounded-sm" : ""}`}
                    onClick={() => handleFontSelect(font)}
                    style={{ fontFamily: font }}
                  >
                    <span>{font}</span>
                    <span className="text-xs text-gray-400 ml-auto">System</span>
                  </DropdownMenuItem>
                ))}

              {/* Divider */}
              {searchQuery === "" && googleFonts.length > 0 && (
                <div className="border-t border-[#44474AFF] my-2" />
              )}

              {/* Google Fonts */}
              {filteredGoogleFonts.slice(0, displayCount).map((font) => (
                <DropdownMenuItem
                  key={`google-${font.family}`}
                  className={`flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer ${value === font.family ? "bg-[#3F434AFF] rounded-sm" : ""}`}
                  onClick={() => handleFontSelect(font.family)}
                  style={{ 
                    fontFamily: font.family
                  }}
                >
                  <span>{font.family}</span>
                  <span className="text-xs text-gray-400 ml-auto">Google</span>
                </DropdownMenuItem>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <span className="text-xs text-gray-400">Loading fonts...</span>
                </div>
              )}

              {/* Show more */}
              {!isLoading && displayCount < filteredGoogleFonts.length && (
                <div 
                  className="flex items-center justify-center py-2 cursor-pointer hover:bg-[#3F434AFF] rounded-sm mx-1 transition-colors"
                  onClick={handleLoadMore}
                >
                  <span className="text-[13px] text-gray-400 hover:text-gray-300">
                    Load more fonts...
                  </span>
                </div>
              )}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Declare global interface for window.flowy
declare global {
  interface Window {
    flowy: {
      getCurrentTextSettings?: () => Element;
    };
  }
}

const TextOptions: React.FC = () => {
  const [hasUserChangedTextColor, setHasUserChangedTextColor] = useState(false);
  const [hasUserChangedTextBgColor, setHasUserChangedTextBgColor] = useState(false);
  const [hasUserChangedHighlightColor, setHasUserChangedHighlightColor] = useState(false);
  const {
    color, 
    secondaryColor,
    textColor: contextTextColor,
    setTextColor: contextSetTextColor,
    textBgColor: contextTextBgColor,
    setTextBgColor: contextSetTextBgColor,
    textBgOpacity: contextTextBgOpacity,
    setTextBgOpacity: contextSetTextBgOpacity,
    highlightColor: contextHighlightColor,
    setHighlightColor: contextSetHighlightColor,
    highlightOpacity: contextHighlightOpacity,
    setHighlightOpacity: contextSetHighlightOpacity,
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
    textColorOpacity,
    setTextColorOpacity,
    borderColor: contextBorderColor,
    setBorderColor: contextSetBorderColor,
    borderWidth: contextBorderWidth,
    setBorderWidth: contextSetBorderWidth,
    borderStyle: contextBorderStyle,
    setBorderStyle: contextSetBorderStyle,
    activeElement,
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
  const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false);
  const textBgOpacityInputRef = useRef<HTMLInputElement>(null);
  const [tempTextBgOpacityInput, setTempTextBgOpacityInput] = useState<string>(() => String(Math.round(contextTextBgOpacity)));
  const highlightOpacityInputRef = useRef<HTMLInputElement>(null);
  const [tempHighlightOpacityInput, setTempHighlightOpacityInput] = useState<string>(() => String(Math.round(contextHighlightOpacity)));
  const textColorOpacityInputRef = useRef<HTMLInputElement>(null);
  const [tempTextColorOpacityInput, setTempTextColorOpacityInput] = useState<string>(() => String(Math.round(textColorOpacity)));
  const textColorControlsRef = useRef<HTMLDivElement>(null!);
  const textBgControlsRef = useRef<HTMLDivElement>(null!);
  const highlightControlsRef = useRef<HTMLDivElement>(null!);

  const closeOtherPickers = () => {
    setShowColorPicker(false);
    setShowBgColorPicker(false);
    setShowHighlightColorPicker(false);
  };

  // Sync tool state with selected element
  useEffect(() => {
    if (selectedElementId !== null) {
      const elements = getElementDataFromRenderables();
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement && selectedElement.type === "text") {
        contextSetTextColor(selectedElement.color || "#ffffff");
        setTextColorOpacity(selectedElement.textColorOpacity !== undefined ? selectedElement.textColorOpacity : 100);
        contextSetTextBgColor(selectedElement.backgroundColor || "transparent");
        contextSetTextBgOpacity(selectedElement.backgroundOpacity !== undefined ? selectedElement.backgroundOpacity : 0);
        contextSetHighlightColor(selectedElement.highlightColor || "#ffff00");
        contextSetHighlightOpacity(selectedElement.highlightOpacity !== undefined ? selectedElement.highlightOpacity : 0);
        setFontSize(selectedElement.fontSize || 16);
        setLineHeight(selectedElement.lineHeight || 1);
        setFontFamily(selectedElement.fontFamily || "Arial");
        setTextAlignment(selectedElement.textAlignment || "center");
        setFontStyles(selectedElement.fontStyles || { bold: false, italic: false, underline: false, strikethrough: false });
        setTextCase(selectedElement.textCase || "none");
        contextSetBorderColor(selectedElement.borderColor || "#ffffff");
        contextSetBorderWidth(selectedElement.borderWidth !== undefined ? selectedElement.borderWidth : 1);
        contextSetBorderStyle(selectedElement.borderStyle || "solid");
      }
    }
  }, [selectedElementId, getElementDataFromRenderables, contextSetTextColor, setTextColorOpacity, contextSetTextBgColor, contextSetTextBgOpacity, contextSetHighlightColor, contextSetHighlightOpacity, setFontSize, setLineHeight, setFontFamily, setTextAlignment, setFontStyles, setTextCase, contextSetBorderColor, contextSetBorderWidth, contextSetBorderStyle]);


  useEffect(() => {
    if (activeTool?.type === "text" && !selectedElementId && color && !hasUserChangedTextColor) {
      contextSetTextColor(color);
    }
  }, [activeTool?.type, selectedElementId, color, contextSetTextColor, hasUserChangedTextColor]);


  useEffect(() => {
    if (activeTool?.type === "text" && !selectedElementId && secondaryColor && !hasUserChangedTextBgColor) {
      contextSetTextBgColor(secondaryColor);

      if (secondaryColor !== 'transparent') {
        contextSetTextBgOpacity(0);
        setTempTextBgOpacityInput("0");
      }
    }
  }, [activeTool?.type, selectedElementId, secondaryColor, contextSetTextBgColor, contextSetTextBgOpacity, hasUserChangedTextBgColor]);

  useEffect(() => {
    if (activeTool?.type === "text" && !selectedElementId && secondaryColor && !hasUserChangedHighlightColor) {
      contextSetHighlightColor(secondaryColor);

      if (secondaryColor !== 'transparent') {
        contextSetHighlightOpacity(30); // Set default highlight opacity to 30% for visibility
        setTempHighlightOpacityInput("30");
      }
    }
  }, [activeTool?.type, selectedElementId, secondaryColor, contextSetHighlightColor, contextSetHighlightOpacity, hasUserChangedHighlightColor]);

  useEffect(() => {
    setHasUserChangedTextColor(false);
    setHasUserChangedTextBgColor(false);
    setHasUserChangedHighlightColor(false);
  }, [activeTool?.type, selectedElementId]);

  // Update selected element when text settings change
  useEffect(() => {
    if (selectedElementId !== null) {
      const elements = getElementDataFromRenderables();
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement && selectedElement.type === "text") {
        const updatedStyles: Partial<ElementData> = {
          color: contextTextColor,
          textColorOpacity: textColorOpacity,
          backgroundColor: contextTextBgColor,
          backgroundOpacity: contextTextBgOpacity,
          highlightColor: contextHighlightColor,
          highlightOpacity: contextHighlightOpacity,
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
    textColorOpacity,
    contextTextBgColor,
    contextTextBgOpacity,
    contextHighlightColor,
    contextHighlightOpacity,
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

  // Sync opacity input fields with context values
  useEffect(() => {
    setTempTextBgOpacityInput(String(Math.round(contextTextBgOpacity)));
  }, [contextTextBgOpacity]);

  useEffect(() => {
    setTempTextColorOpacityInput(String(Math.round(textColorOpacity)));
  }, [textColorOpacity]);

  useEffect(() => {
    setTempHighlightOpacityInput(String(Math.round(contextHighlightOpacity)));
  }, [contextHighlightOpacity]);

  // Available default fonts
  const fonts = [
    "Arial", "Times New Roman", "Courier New",
    "Georgia", "Comic Sans MS",
    "Tahoma", "Trebuchet MS", "Arial Black", "Lucida Sans",
    "Ubuntu", "Open Sans", "Roboto", "Lato"
  ];

  // Function to get the current text settings
  const getCurrentTextSettings = (): Element => ({
    id: "text-template",
    type: "text",
    icon: Type,
    text: {
      color: contextTextColor,
      backgroundColor: contextTextBgColor,
      backgroundOpacity: contextTextBgOpacity,
      highlightColor: contextHighlightColor,
      highlightOpacity: contextHighlightOpacity,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fontStyles: { ...fontStyles },
      textCase: textCase,
      lineHeight: lineHeight,
      textAlignment: textAlignment,
    },
    settings: {
      color: contextTextColor,
      backgroundColor: contextTextBgColor,
      backgroundOpacity: contextTextBgOpacity,
      highlightColor: contextHighlightColor,
      highlightOpacity: contextHighlightOpacity,
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
    setActiveElement(getCurrentTextSettings());
    setIsAddModeActive(true);
    setCurrentAddToolType("text");
  };

  // Export getCurrentTextSettings through useEffect for access from other components
  useEffect(() => {
    if (window.flowy === undefined) {
      window.flowy = {};
    }
    window.flowy.getCurrentTextSettings = getCurrentTextSettings;
  }, [
    contextTextColor,
    textColorOpacity,
    contextTextBgColor,
    contextTextBgOpacity,
    contextHighlightColor,
    contextHighlightOpacity,
    fontSize,
    fontFamily,
    fontStyles,
    textCase,
    lineHeight,
    textAlignment,
    contextBorderColor,
    contextBorderWidth,
    contextBorderStyle
  ]);

  // Preload popular Google Fonts
  const preloadPopularFonts = () => {
    const popularFonts = [
      'Open Sans', 'Roboto', 'Lato', 'Montserrat', 'Poppins',
      'Source Sans Pro', 'Raleway', 'PT Sans', 'Lora', 'Nunito'
    ];
    
    popularFonts.forEach(font => {
      loadGoogleFont(font);
    });
  };

  // Preload popular fonts on mount
  useEffect(() => {
    preloadPopularFonts();
  }, []);

  // Check if the selected element is a text element and the correct tool is active
  const selectedElementData = selectedElementId ? getElementDataFromRenderables().find(el => el.id === selectedElementId) : null;
  const isTextElementSelected = selectedElementId !== null &&
    selectedElementData !== null &&
    selectedElementData !== undefined &&
    selectedElementData.type === "text" &&
    (activeTool?.type === "text" || activeTool?.type === "cursor");

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
    contextSetTextBgOpacity(newTextBgOpacity);
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
      currentNum = 0;
    }
    currentNum = Math.max(0, Math.min(100, currentNum));
    contextSetTextBgOpacity(currentNum);
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

  const handleHighlightOpacitySliderValueChange = (value: number[]) => {
    const newHighlightOpacity = Math.round(value[0]);
    contextSetHighlightOpacity(newHighlightOpacity);
    setTempHighlightOpacityInput(String(newHighlightOpacity));
  };

  const handleHighlightOpacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    inputValue = inputValue.replace(/[^\d]/g, "");
    if (inputValue === "") {
      setTempHighlightOpacityInput("");
      return;
    }
    let num = parseInt(inputValue, 10);
    if (isNaN(num)) {
      setTempHighlightOpacityInput(inputValue);
      return;
    }
    if (num > 100) {
      num = 100;
      inputValue = String(100);
    }
    setTempHighlightOpacityInput(inputValue);
  };

  const handleHighlightOpacityInputBlur = () => {
    let currentNum = parseInt(tempHighlightOpacityInput, 10);
    if (isNaN(currentNum) || tempHighlightOpacityInput.trim() === "") {
      currentNum = 0;
    }
    currentNum = Math.max(0, Math.min(100, currentNum));
    contextSetHighlightOpacity(currentNum);
    setTempHighlightOpacityInput(String(currentNum));
  };

  const renderColorPickers = () => (
    <>
    <div className="h-6 ml-3 border-l border-[#44474AFF]"></div>

      <div className="relative ml-3">
        <Button
          variant="ghost"
          className="h-7 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <p className="text-xs text-[#D4D4D5FF]">Text</p>
          <div
            className="w-5 h-5 rounded-xl border border-gray-500"
            style={{ backgroundColor: contextTextColor, opacity: textColorOpacity / 100 }}
          />
        </Button>
        {showColorPicker && (
          <div className="absolute z-50 top-full left-0 mt-2">
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
                setHasUserChangedTextColor(true);
              }}
              onClose={() => setShowColorPicker(false)}
              additionalRefs={[textColorControlsRef]}
            />
          </div>
        )}
      </div>

      

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
                  value={[contextTextBgOpacity]}
                  onValueChange={handleTextBgOpacitySliderValueChange}
                  className="flex-grow"
                />
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2 p-1 text-xs text-white border-1 border-[#44474AFF]"
                onClick={(e) => {
                  contextSetTextBgColor('#ffffff');
                  contextSetTextBgOpacity(0);
                  setTempTextBgOpacityInput("0");
                  setHasUserChangedTextBgColor(true);
                }}
              >
                Transparent
              </Button>
            </div>
            <ColorPicker
              color={contextTextBgColor === 'transparent' ? '#ffffff' : contextTextBgColor}
              setColor={(newColor) => {
                contextSetTextBgColor(newColor);
                setHasUserChangedTextBgColor(true); 
                if (newColor === 'transparent') {
                  contextSetTextBgOpacity(0);
                  setTempTextBgOpacityInput("0");
                }
              }}
              onClose={() => setShowBgColorPicker(false)}
              additionalRefs={[textBgControlsRef]}
            />
          </div>
        )}
      </div>


      <div className="relative">
        <Button
          variant="ghost"
          className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]"
          onClick={() => setShowHighlightColorPicker(!showHighlightColorPicker)}
        >
          <p className="text-xs text-[#D4D4D5FF]">Highlight</p>
          <div
            className="w-5 h-5 rounded-xl border border-gray-500"
            style={{
              backgroundColor: colorToRGBA(contextHighlightColor, contextHighlightOpacity)
            }}
          />
        </Button>
        {showHighlightColorPicker && (
          <div className="absolute z-50 top-full left-0 mt-2">
            <div ref={highlightControlsRef} className="mt-0 p-2 bg-[#292C31FF] border border-[#44474AFF] rounded flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-[#D4D4D5FF]">Opacity:</Label>
                <div
                  className="flex items-center h-6 bg-[#202225FF] border-2 border-[#44474AFF] rounded px-1.5 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text"
                  onClick={() => highlightOpacityInputRef.current?.focus()}
                >
                  <Input
                    ref={highlightOpacityInputRef}
                    type="text"
                    value={tempHighlightOpacityInput}
                    onChange={handleHighlightOpacityInputChange}
                    onBlur={handleHighlightOpacityInputBlur}
                    onKeyDown={(e) => { if (e.key === 'Enter') highlightOpacityInputRef.current?.blur(); }}
                    className="w-7 bg-transparent border-none text-xs text-white text-center focus:ring-0 p-0"
                    maxLength={3}
                  />
                  <span className="text-xs text-[#A8AAACFF]">%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Slider
                  id="highlight-opacity-slider"
                  min={0}
                  max={100}
                  step={1}
                  value={[contextHighlightOpacity]}
                  onValueChange={handleHighlightOpacitySliderValueChange}
                  className="flex-grow"
                />
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2 p-1 text-xs text-white border-1 border-[#44474AFF]"
                onClick={(e) => {
                  contextSetHighlightColor('#ffff00');
                  contextSetHighlightOpacity(0);
                  setTempHighlightOpacityInput("0");
                  setHasUserChangedHighlightColor(true);
                }}
              >
                Transparent
              </Button>
            </div>
            <ColorPicker
              color={contextHighlightColor === 'transparent' ? '#ffff00' : contextHighlightColor}
              setColor={(newColor) => {
                contextSetHighlightColor(newColor);
                setHasUserChangedHighlightColor(true); 
                if (newColor === 'transparent') {
                  contextSetHighlightOpacity(0);
                  setTempHighlightOpacityInput("0");
                }
              }}
              onClose={() => setShowHighlightColorPicker(false)}
              additionalRefs={[highlightControlsRef]}
            />
          </div>
        )}
      </div>
    </>
  );

  const renderStyleButtons = () => (
    <div className="flex items-center space-x-2 ml-3 mr-5">
      <Label className="text-xs text-[#D4D4D5FF]">Style:</Label>
      <div className="flex items-center text-xs text-white rounded">
        <div className="bg-[#292C31FF] border-2 border-[#44474AFF] rounded text-white text-xs p-0 min-w-[100px] grid grid-cols-4">
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
    contextSetHighlightColor("#ffff00");
    contextSetHighlightOpacity(0);
    setTempHighlightOpacityInput("0");
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
        textColorOpacity: 100,
        backgroundColor: "transparent",
        backgroundOpacity: 0,
        highlightColor: "#ffff00",
        highlightOpacity: 0,
        borderColor: "#000000",
        borderWidth: 0,
        borderStyle: "hidden",
      });
    }
  };

  return (
    <div className="flex space-x-2 items-center h-full text-xs">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`flex h-7 gap-1 p-2 text-xs rounded hover:bg-[#3F434AFF] -ml-1
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
      
      <div className="h-6 border-l border-[#44474AFF]"></div>

      <FontSelector value={fontFamily} onChange={setFontFamily} fonts={fonts} onMenuWillOpen={closeOtherPickers} />

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

      <div className="h-6 border-l border-[#44474AFF]"></div>

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

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-center px-2 min-w-7 min-h-7 ml-3 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
              onClick={resetAllStyles}
            >
              <RotateCcw size={14} />
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