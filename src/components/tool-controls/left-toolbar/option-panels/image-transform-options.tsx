import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTool } from "@/context/tool-context";
import { useElementsManager } from "@/context/elements-manager-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  ChevronDown,
  Image as ImageIcon,
  MousePointerClick,
  Layers,
  Maximize2,
  Crop,
  Repeat,
  MoveUp,
  SendToBack,
  BringToFront,
  Palette,
  Save,
  PaintBucket,
  BrushCleaning,
  Eraser,
  Scissors
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import ColorPicker from "@/components/color-picker/color-picker";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { ElementData } from "@/types/canvas";
import { removeImageBackground, convertImageUrlToBlob, convertBlobToDataUrl } from "@/lib/api/remove-bg";

// Adding styles for scrollbar (same as liquify-options)
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

const ImageTransformOptions: React.FC = () => {
  const { renderableObjects } = useTool();
  const { selectedElementId, updateElement, getElementById, setSelectedElementId, sendElementToBackground, bringElementToFront, setHoveredElementId, adjustImageToCanvas, fitImageToCanvas, setCanvasBackground, removeCanvasBackground } = useElementsManager();

  const [selectedImageId, setSelectedImageId] = useState<string | null>(selectedElementId);

  // Canvas background color picker state
  const [showCanvasBackgroundPicker, setShowCanvasBackgroundPicker] = useState(false);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState("#ffffff");
  const [canvasBackgroundOpacity, setCanvasBackgroundOpacity] = useState(100);
  const [tempCanvasBackgroundOpacityInput, setTempCanvasBackgroundOpacityInput] = useState("100");
  const canvasBackgroundPickerRef = useRef<HTMLDivElement>(null!);
  const canvasBackgroundOpacityInputRef = useRef<HTMLInputElement>(null!);

  // Add loading state for background removal
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

  // Function to remove background using remove.bg API
  const handleRemoveBackground = async () => {
    if (!currentSelectedImageId) {
      return;
    }

    try {
      setIsRemovingBackground(true);
      
      const selectedImage = getElementById(currentSelectedImageId);
      if (!selectedImage || !selectedImage.element) {
        setIsRemovingBackground(false);
        return;
      }

      const imageUrl = selectedImage.element.src;
      if (!imageUrl) {
        setIsRemovingBackground(false);
        return;
      }

      const apiKey = import.meta.env.VITE_REMOVEBG_API_KEY || '';


      if (!apiKey) {
        setIsRemovingBackground(false);
        return;
      }

      const imageBlob = await convertImageUrlToBlob(imageUrl);
      const processedBlob = await removeImageBackground(imageBlob, apiKey);
      const base64data = await convertBlobToDataUrl(processedBlob);
      updateElement(currentSelectedImageId, { src: base64data });

      setIsRemovingBackground(false);

    } catch (error) {
      setIsRemovingBackground(false);

    }
  };

  // Check if there are any imported images (custom-image type) in the project
  const hasImportedImages = renderableObjects.some(obj =>
    !('tool' in obj) && obj.type === 'custom-image'
  );

  // Get all available images from renderableObjects
  const availableImages = renderableObjects.filter(obj =>
    !('tool' in obj) && obj.type === 'custom-image'
  ) as ElementData[];

  // Calculate dynamic width for dropdown menu based on longest filename
  const dropdownWidth = useMemo(() => {
    // Calculate minimum width based on "Select Image" button
    // Button content: Icon (14px) + "Select Image" text + ChevronDown (12px) + gaps (2*2px) + padding (2*12px = 24px)
    const selectImageButtonText = "Select Image";
    const selectImageButtonWidth = 14 + selectImageButtonText.length * 7 + 12 + 4 + 24; // Approximate calculation

    if (availableImages.length === 0) return Math.max(150, selectImageButtonWidth);

    const longestFileName = availableImages.reduce((longest, image) => {
      const fileName = image.fileName || `Image ${image.id.slice(-6)}`;
      return fileName.length > longest.length ? fileName : longest;
    }, "");

    // Calculate width based on longest filename: icon (14px) + text + padding + safe margin
    const fileNameWidth = 14 + longestFileName.length * 8 + 40; // Icon + text + padding

    // Use the larger of: select button width, filename width, or absolute minimum (150px)
    const minWidth = Math.max(150, selectImageButtonWidth, fileNameWidth);
    const maxWidth = 400; // Increased maximum width to accommodate longer filenames

    return Math.min(minWidth, maxWidth);
  }, [availableImages]);

  // Get the currently selected image element
  const currentSelectedImageId = selectedImageId || selectedElementId;
  const selectedImage = currentSelectedImageId ? getElementById(currentSelectedImageId) : null;
  const isImageSelected = selectedImage && selectedImage.element.type === 'custom-image';

  // Sync selectedImageId with selectedElementId when it changes
  useEffect(() => {
    if (selectedElementId && getElementById(selectedElementId)?.element.type === 'custom-image') {
      setSelectedImageId(selectedElementId);
    } else if (selectedElementId === null) {
      setSelectedImageId(null);
    }
  }, [selectedElementId, getElementById]);

  const handleSelectImage = (imageId: string) => {
    console.log('ImageTransform: Selecting image:', imageId);
    setSelectedImageId(imageId);
    setSelectedElementId(imageId);
  };

  const handleSelectDifferentImage = () => {
    console.log('ImageTransform: Deselecting image');
    setSelectedImageId(null);
    setSelectedElementId(null);
  };

  const handleCanvasBackgroundOpacityChange = (value: number) => {
    setCanvasBackgroundOpacity(Math.max(0, Math.min(100, value)));
  };

  const handleCanvasBackgroundOpacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempCanvasBackgroundOpacityInput(value);
  };

  const handleCanvasBackgroundOpacityInputBlur = () => {
    let value = Number.parseInt(tempCanvasBackgroundOpacityInput, 10);
    if (Number.isNaN(value)) value = 100;
    value = Math.max(0, Math.min(100, value));
    setCanvasBackgroundOpacity(value);
    setTempCanvasBackgroundOpacityInput(value.toString());
  };

  const handleCanvasBackgroundOpacitySliderValueChange = (values: number[]) => {
    const value = values[0];
    setCanvasBackgroundOpacity(value);
    setTempCanvasBackgroundOpacityInput(value.toString());
  };

  // Function to convert color and opacity to RGBA
  const colorToRGBA = (color: string, opacity: number) => {
    if (color === 'transparent') return 'transparent';

    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);

    // Apply opacity
    const alpha = opacity / 100;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleSetCanvasBackground = () => {
    console.log('ImageTransform: Setting canvas background', {
      color: canvasBackgroundColor,
      opacity: canvasBackgroundOpacity
    });

    setCanvasBackground(canvasBackgroundColor, canvasBackgroundOpacity);
    setShowCanvasBackgroundPicker(false);

    console.log('ImageTransform: Canvas background successfully set');
  };

  const renderColorPickers = () => (
    <>
      {/* Canvas Background Controls */}
      <div className="flex items-center space-x-3">
        {/* Canvas Background Color Button */}
        <div className="relative">
          <Button
            variant="ghost"
            className="h-7 px-2 flex items-center gap-2 text-xs text-white rounded hover:bg-[#3F434AFF]"
            onClick={() => setShowCanvasBackgroundPicker(!showCanvasBackgroundPicker)}
          >
            <p className="text-xs text-[#D4D4D5FF]">Background</p>
            <div
              className="w-5 h-5 rounded-xl border border-gray-500"
              style={{
                backgroundColor: colorToRGBA(canvasBackgroundColor, canvasBackgroundOpacity)
              }}
            />
          </Button>
          {showCanvasBackgroundPicker && (
            <div className="absolute z-50 top-full left-0 mt-2">
              {/* Canvas background opacity control */}
              <div ref={canvasBackgroundPickerRef} className="mt-0 p-2 bg-[#292C31FF] border border-[#44474AFF] rounded flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-[#D4D4D5FF]">Opacity:</Label>
                  <div
                    className="flex items-center h-6 bg-[#202225FF] border-2 border-[#44474AFF] rounded px-1.5 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text"
                    onClick={() => canvasBackgroundOpacityInputRef.current?.focus()}
                  >
                    <Input
                      ref={canvasBackgroundOpacityInputRef}
                      type="text"
                      value={tempCanvasBackgroundOpacityInput}
                      onChange={handleCanvasBackgroundOpacityInputChange}
                      onBlur={handleCanvasBackgroundOpacityInputBlur}
                      onKeyDown={(e) => { if (e.key === 'Enter') canvasBackgroundOpacityInputRef.current?.blur(); }}
                      className="w-7 bg-transparent border-none text-xs text-white text-center focus:ring-0 p-0"
                      maxLength={3}
                    />
                    <span className="text-xs text-[#A8AAACFF]">%</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="canvas-bg-opacity-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={[canvasBackgroundOpacity]}
                    onValueChange={handleCanvasBackgroundOpacitySliderValueChange}
                    className="flex-grow"
                  />
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-2 p-1 text-xs text-white border-1 border-[#44474AFF]"
                  onClick={() => {
                    setCanvasBackgroundColor('#ffffff');
                    setCanvasBackgroundOpacity(0);
                    setTempCanvasBackgroundOpacityInput("0");
                  }}
                >
                  Transparent
                </Button>
              </div>
              <ColorPicker
                color={canvasBackgroundColor === 'transparent' ? '#ffffff' : canvasBackgroundColor}
                setColor={(newColor) => {
                  setCanvasBackgroundColor(newColor);
                  if (newColor === 'transparent') {
                    setCanvasBackgroundOpacity(0);
                    setTempCanvasBackgroundOpacityInput("0");
                  }
                }}
                onClose={() => setShowCanvasBackgroundPicker(false)}
                additionalRefs={[canvasBackgroundPickerRef]}
              />
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center justify-center px-2 min-w-7 ml-3 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
                  onClick={handleSetCanvasBackground}
                >
                  <PaintBucket size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fill background with colour</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center justify-center px-2 min-w-7 ml-3 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
                  onClick={() => {
                    removeCanvasBackground();
                    setShowCanvasBackgroundPicker(false);
                  }}
                >
                  <BrushCleaning size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset background fill</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  );

  // If no images imported, show message and color picker
  if (!hasImportedImages) {
    return (
      <div className="flex items-center space-x-4 bg-[#292C31FF] text-white h-full">
        <span className="text-xs text-[#A8AAACFF] text-center">
          Add images to canvas to use the <b>Image Transform</b> tool.
        </span>

        <div className="ml-3 mr-6 h-6 border-l border-[#44474AFF]"></div>

        {renderColorPickers()}
      </div>
    );
  }

  // If no image selected, show image selection
  if (!isImageSelected) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-xs text-[#A8AAACFF]">
          Select an image to edit.
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center h-7 px-3 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
              <ImageIcon size={14} />
              Select Image
              <ChevronDown size={12} className="text-white" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 relative m-0"
            style={{ width: `${dropdownWidth}px` }}
          >
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            <ScrollArea className="h-[150px]" style={{ width: `${dropdownWidth}px` }}>
              <div className="p-1">
                {availableImages.map((image) => (
                  <DropdownMenuItem
                    key={image.id}
                    className="flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer whitespace-nowrap overflow-hidden"
                    onClick={() => handleSelectImage(image.id)}
                    onMouseEnter={() => setHoveredElementId(image.id)}
                    onMouseLeave={() => setHoveredElementId(null)}
                  >
                    <ImageIcon size={14} className="flex-shrink-0" />
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-xs truncate w-full" title={image.fileName || `Image ${image.id.slice(-6)}`}>
                        {image.fileName || `Image ${image.id.slice(-6)}`}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-3 mr-6 h-6 border-l border-[#44474AFF]"></div>

        {renderColorPickers()}
      </div>
    );
  }

  const imageElement = selectedImage.element;
  const flipHorizontal = imageElement.flipHorizontal || false;
  const flipVertical = imageElement.flipVertical || false;
  const brightness = imageElement.brightness || 0;
  const contrast = imageElement.contrast || 0;
  // Handle opacity conversion correctly - if opacity is already in 0-100 range (legacy), use as is
  // If opacity is in 0-1 range (correct), convert to 0-100 for display
  const rawOpacity = imageElement.opacity;
  const imageOpacity = rawOpacity !== undefined
    ? (rawOpacity > 1 ? Math.round(rawOpacity) : Math.round(rawOpacity * 100))
    : 100;

  // Debug logging for opacity issues
  if (rawOpacity !== undefined && rawOpacity > 1) {
    console.warn('ImageTransform: Found opacity value > 1:', {
      rawOpacity,
      displayOpacity: imageOpacity,
      elementId: imageElement.id?.slice(-6)
    });
  }

  const handleFlipHorizontal = () => {
    if (currentSelectedImageId) {
      console.log('ImageTransform: Toggling horizontal flip:', !flipHorizontal);
      updateElement(currentSelectedImageId, { flipHorizontal: !flipHorizontal });
    }
  };

  const handleFlipVertical = () => {
    if (currentSelectedImageId) {
      console.log('ImageTransform: Toggling vertical flip:', !flipVertical);
      updateElement(currentSelectedImageId, { flipVertical: !flipVertical });
    }
  };

  const handleBrightnessChange = (value: number) => {
    if (currentSelectedImageId) {
      console.log('ImageTransform: Setting brightness:', value);
      updateElement(currentSelectedImageId, { brightness: value });
    }
  };

  const handleContrastChange = (value: number) => {
    if (currentSelectedImageId) {
      console.log('ImageTransform: Setting contrast:', value);
      updateElement(currentSelectedImageId, { contrast: value });
    }
  };

  const handleOpacityChange = (value: number) => {
    if (currentSelectedImageId) {
      const opacityValue = Math.max(0, Math.min(1, value / 100)); // Convert from 0-100 to 0-1 and clamp
      console.log('ImageTransform: Setting opacity:', {
        inputValue: value,
        normalizedOpacity: opacityValue,
        elementId: currentSelectedImageId.slice(-6)
      });
      updateElement(currentSelectedImageId, { opacity: opacityValue });
    }
  };

  const handleSetAsBackground = () => {
    if (currentSelectedImageId) {
      console.log('ImageTransform: Setting image as background', {
        imageId: currentSelectedImageId.slice(-6),
        imageName: imageElement?.fileName || `Image ${currentSelectedImageId.slice(-6)}`
      });

      // Send element to background (this will trigger immediate save due to critical change detection)
      sendElementToBackground(currentSelectedImageId);

      // Show success message
      console.log('ImageTransform: Image successfully set as background');
    } else {
      console.warn('ImageTransform: No image selected for background operation');
    }
  };

  const handleBringToFront = () => {
    if (currentSelectedImageId) {
      console.log('ImageTransform: Bringing image to front', {
        imageId: currentSelectedImageId.slice(-6),
        imageName: imageElement?.fileName || `Image ${currentSelectedImageId.slice(-6)}`
      });

      // Bring element to front (this will trigger immediate save due to critical change detection)
      bringElementToFront(currentSelectedImageId);

      // Show success message
      console.log('ImageTransform: Image successfully brought to front');
    } else {
      console.warn('ImageTransform: No image selected for bring to front operation');
    }
  };

  const handleResetTransforms = () => {
    if (currentSelectedImageId) {
      console.log('ImageTransform: Resetting all transforms');
      updateElement(currentSelectedImageId, {
        flipHorizontal: false,
        flipVertical: false,
        brightness: 0,
        contrast: 0,
        opacity: 1
      });
    }
  };

  const handleAdjustToCanvas = () => {
    if (currentSelectedImageId) {
      console.log('ImageTransform: Adjusting image to canvas', {
        imageId: currentSelectedImageId.slice(-6),
        imageName: imageElement?.fileName || `Image ${currentSelectedImageId.slice(-6)}`
      });
      adjustImageToCanvas(currentSelectedImageId);
    } else {
      console.warn('ImageTransform: No image selected for adjust operation');
    }
  };

  const handleFitToCanvas = () => {
    if (currentSelectedImageId) {
      console.log('ImageTransform: Fitting image to canvas', {
        imageId: currentSelectedImageId.slice(-6),
        imageName: imageElement?.fileName || `Image ${currentSelectedImageId.slice(-6)}`
      });
      fitImageToCanvas(currentSelectedImageId);
    } else {
      console.warn('ImageTransform: No image selected for fit operation');
    }
  };

  return (
    <div className="flex items-center space-x-4 bg-[#292C31FF] text-white h-full">
      {/* Selected Image Indicator */}
      <div className="flex items-center space-x-4">
        <Label className="text-xs text-[#D4D4D5FF]">Selected:</Label>
        <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
          <ImageIcon size={14} />
          <div className="flex flex-col items-start">
            <span className="text-xs">{imageElement?.fileName || `Image ${imageElement?.id.slice(-6)}`}</span>
          </div>
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
                onClick={handleSelectDifferentImage}
              >
                <Repeat size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select different image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="ml-3 mr-6 h-6 border-l border-[#44474AFF]"></div>

      {/* Layer Controls */}
      <div className="flex items-center space-x-4">
        <Label className="text-xs text-[#D4D4D5FF]">Layer:</Label>

        {/* Set as Background Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSetAsBackground}
                variant="ghost"
                className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
              >
                <SendToBack size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bring to back</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Bring to Front Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleBringToFront}
                variant="ghost"
                className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
              >
                <BringToFront size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bring to front</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Resize Controls */}
      <div className="flex items-center space-x-4">
        <Label className="text-xs text-[#D4D4D5FF]">Resize:</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleAdjustToCanvas}
                variant="ghost"
                className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
              >
                <Crop size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust to canvas (fit within)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleFitToCanvas}
                variant="ghost"
                className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
              >
                <Maximize2 size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fit to canvas (cover entire)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>




      <div className="ml-3 mr-6 h-6 border-l border-[#44474AFF]"></div>

      {/* Background Removal Control */}
      <div className="flex items-center space-x-4">
        <Label className="text-xs text-[#D4D4D5FF] flex flex-col leading-[1.2]">
          <span>Remove</span>
          <span>background</span>
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRemoveBackground}
                disabled={isRemovingBackground}
                variant="ghost"
                className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
              >
                {isRemovingBackground ? (
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  <Scissors size={14} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove background</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="ml-3 mr-3 h-6 border-l border-[#44474AFF]"></div>

      {/* Opacity Control */}
      <NumberInputWithPopover
        label="Opacity"
        value={imageOpacity}
        onChange={handleOpacityChange}
        min={0}
        max={100}
        step={1}
        suffix="%"
      />

      {/* Brightness Control */}
      <NumberInputWithPopover
        label="Brightness"
        value={brightness}
        onChange={handleBrightnessChange}
        min={-100}
        max={100}
        step={1}
        suffix=""
      />

      {/* Contrast Control */}
      <NumberInputWithPopover
        label="Contrast"
        value={contrast}
        onChange={handleContrastChange}
        min={-100}
        max={100}
        step={1}
        suffix=""
      />

      <div className="ml-3 mr-6 h-6 border-l border-[#44474AFF]"></div>

      {renderColorPickers()}

      <div className="ml-3 mr-6 h-6 border-l border-[#44474AFF]"></div>

      {/* Reset Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleResetTransforms}
              variant="ghost"
              className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
            >
              <RotateCcw size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset all transforms</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ImageTransformOptions; 