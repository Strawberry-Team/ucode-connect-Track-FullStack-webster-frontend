import React, { useState, useEffect } from "react";
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
  Layers
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import type { ElementData } from "@/types/canvas";

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
  const { selectedElementId, updateElement, getElementById, setSelectedElementId, sendElementToBackground, setHoveredElementId } = useElementsManager();

  const [selectedImageId, setSelectedImageId] = useState<string | null>(selectedElementId);

  // Check if there are any imported images (custom-image type) in the project
  const hasImportedImages = renderableObjects.some(obj =>
    !('tool' in obj) && obj.type === 'custom-image'
  );

  // Get all available images from renderableObjects
  const availableImages = renderableObjects.filter(obj =>
    !('tool' in obj) && obj.type === 'custom-image'
  ) as ElementData[];

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

  if (!hasImportedImages) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-xs text-[#A8AAACFF] text-center">
          Add images to canvas to use the <b>Image Transform</b> tool.
        </span>
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
          >
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            <ScrollArea className="h-[150px] w-[150px]">
              <div className="p-1">
                {availableImages.map((image) => (
                  <DropdownMenuItem
                    key={image.id}
                    className="flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer"
                    onClick={() => handleSelectImage(image.id)}
                    onMouseEnter={() => setHoveredElementId(image.id)}
                    onMouseLeave={() => setHoveredElementId(null)}
                  >
                    <ImageIcon size={14} />
                    <div className="flex flex-col items-start">
                      <span className="text-xs">{image.fileName || `Image ${image.id.slice(-6)}`}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
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

  return (
    <div className="flex items-center space-x-2 bg-[#292C31FF] text-white h-full">
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
                <MousePointerClick size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select different image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="ml-3 mr-5 h-6 border-l border-[#44474AFF]"></div>

      {/* Set as Background Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSetAsBackground}
              variant="ghost"
              className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
            >
              <Layers size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Set as background</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Flip Controls */}
      <div className="flex items-center space-x-4 ml-3">
        <Label className="text-xs text-[#D4D4D5FF]">Flip:</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleFlipHorizontal}
                variant="ghost"
                className={`flex items-center justify-center px-2 min-w-7 min-h-7 rounded cursor-pointer border-2 border-[#44474AFF] ${flipHorizontal
                  ? "bg-[#0096FF] text-white border-[#0096FF]"
                  : "hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white"
                  }`}
              >
                <FlipHorizontal size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip horizontally</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleFlipVertical}
                variant="ghost"
                className={`flex items-center justify-center px-2 min-w-7 min-h-7 rounded cursor-pointer border-2 border-[#44474AFF] ${flipVertical
                  ? "bg-[#0096FF] text-white border-[#0096FF]"
                  : "hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white"
                  }`}
              >
                <FlipVertical size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip vertically</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="ml-4 mr-3 h-6 border-l border-[#44474AFF]"></div>

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

      <div className="ml-4 mr-6 h-6 border-l border-[#44474AFF]"></div>

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