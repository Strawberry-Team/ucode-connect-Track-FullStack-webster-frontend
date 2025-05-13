import React, { useState } from "react";
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
import type { TextCase, Element } from "@/types/canvas";
import { useElementsManager } from "@/context/elements-manager-context";

// Adding styles for scrollbar
const scrollbarStyles = `
  .font-list-container::-webkit-scrollbar {
    width: 8px;
    background-color: #292C31;
  }
  .font-list-container::-webkit-scrollbar-thumb {
    background-color: #44474A;
    border-radius: 4px;
  }
  .font-list-container::-webkit-scrollbar-track {
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
          style={{
            maxHeight: "250px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#44474A #292C31"
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
          <div
            className="font-list-container overflow-y-auto"
            style={{
              maxHeight: "200px",
              scrollbarWidth: "thin",
              scrollbarColor: "#44474A #292C31"
            }}
          >
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
    setActiveElement
  } = useTool();

  const { selectedElementIndex, duplicateSelectedElement, removeSelectedElement } = useElementsManager();

  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [bgColorMenuOpen, setBgColorMenuOpen] = useState(false);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);

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
      icon: Type
    };
    setActiveElement(element);
  };

  const toggleStyle = (style: keyof typeof fontStyles) => {
    setFontStyles({
      ...fontStyles,
      [style]: !fontStyles[style]
    });
  };

  const handleCaseChange = (caseType: TextCase) => {
    setTextCase(caseType);
  };

  // Add background opacity control
  const handleBackgroundOpacityChange = (value: number) => {
    setBackgroundOpacity(Math.min(100, Math.max(0, value)));
  };

  return (
    <div className="flex space-x-2 items-center h-full text-xs overflow-x-auto no-scrollbar">
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
            <div className="w-5 h-5 rounded-xl border border-gray-500" style={{ backgroundColor: color }} />
            <span>Text</span>
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
            <div className="w-5 h-5 rounded-xl border border-gray-500" style={{ backgroundColor: backgroundColor === 'transparent' ? '#ffffff' : backgroundColor }} />
            <span>Background</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-[#292C31FF] border-2 border-[#44474AFF]">
          <div className="space-y-3">
            {/* Background opacity slider */}
            <div className="space-y-1">
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
                  className="h-1.5 w-full"
                />
              </div>
            </div>

            {/* Transparent option */}
            <Button
              variant="ghost"
              className="text-xs text-white rounded hover:bg-[#3F434AFF] w-full h-7"
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

      <div className="h-6 border-l border-[#44474AFF]"></div>

      {/* Text alignment */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]">
            <Label className="text-xs text-[#D4D4D5FF]">Alignment</Label>
            <ChevronDown size={12} className="text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 min-w-[150px] grid grid-cols-4">

          {/* Left */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className="flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none"
                  onClick={() => setTextAlignment('left')}>
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
                  className="flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none"
                  onClick={() => setTextAlignment('center')}>
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
                  className="flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none"
                  onClick={() => setTextAlignment('right')}>
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
                  className="flex items-center px-3 py-2 focus:bg-[#3F434AFF] cursor-pointer rounded-none"
                  onClick={() => setTextAlignment('justify')}>
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

      {/* Text style */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]">
            <Label className="text-xs text-[#D4D4D5FF]">Style</Label>
            <ChevronDown size={12} className="text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 min-w-[150px] grid grid-cols-4">

          {/* Bold */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={`flex items-center px-3 py-2 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${fontStyles.bold ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => toggleStyle('bold')}>
                  <Bold size={14} color="white" />
                </DropdownMenuItem>
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
                <DropdownMenuItem
                  className={`flex items-center px-3 py-2 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${fontStyles.italic ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => toggleStyle('italic')}>
                  <Italic size={14} color="white" />
                </DropdownMenuItem>
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
                <DropdownMenuItem
                  className={`flex items-center px-3 py-2 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${fontStyles.underline ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => toggleStyle('underline')}>
                  <Underline size={14} color="white" />
                </DropdownMenuItem>
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
                <DropdownMenuItem
                  className={`flex items-center px-3 py-2 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${fontStyles.strikethrough ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => toggleStyle('strikethrough')}>
                  <Strikethrough size={14} color="white" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Strikethrough</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text case */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]">
            <Label className="text-xs text-[#D4D4D5FF]">Case</Label>
            <ChevronDown size={12} className="text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 min-w-[150px] grid grid-cols-4">

          {/* Normal */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={`flex items-center px-3 py-2 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${fontStyles.bold ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleCaseChange('none')}>
                  <Baseline size={14} color="white" />
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
                  className={`flex items-center px-3 py-2 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${fontStyles.italic ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleCaseChange('uppercase')}>
                  <CaseUpper size={14} color="white" />
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
                  className={`flex items-center px-3 py-2 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${fontStyles.underline ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleCaseChange('lowercase')}>
                  <CaseLower size={14} color="white" />
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
                  className={`flex items-center px-3 py-2 hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] rounded-none cursor-pointer ${fontStyles.strikethrough ? 'bg-[#3F434AFF]' : ''}`}
                  onClick={() => handleCaseChange('capitalize')}>
                  <CaseSensitive size={14} color="white" />
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

    </div>
  );
};

export default TextOptions;