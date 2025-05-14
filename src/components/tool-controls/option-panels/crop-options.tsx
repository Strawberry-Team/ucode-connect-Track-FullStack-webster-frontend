import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTool } from '@/context/tool-context';
import { Crop, Check, ChevronDown } from 'lucide-react';

const CropOptions: React.FC = () => {
  const {
    isCropping,
    cropRect,
    setCropRect,
    stageSize,
    activeTool,
    selectedAspectRatio,
    setSelectedAspectRatio,
    setTriggerApplyCrop
  } = useTool();

  const [widthInput, setWidthInput] = useState<string>("");
  const [heightInput, setHeightInput] = useState<string>("");

  const prevCropRectRef = useRef(cropRect);
  const isUpdatingRef = useRef(false);

  const roundToTwoDecimals = (num: number): number => {
    return parseFloat(num.toFixed(2));
  };

  const formatDimensionDisplay = (num: number): string => {
    if (num % 1 === 0) {
      return String(num);
    }
    return num.toFixed(2);
  };

  useEffect(() => {
    if (isUpdatingRef.current) {
      return;
    }

    if (isCropping) {
      let targetWidth = 0;
      let targetHeight = 0;
      let dimensionsAvailable = false;

      if (cropRect) {
        targetWidth = cropRect.width;
        targetHeight = cropRect.height;
        dimensionsAvailable = true;
      } else if (stageSize) {
        targetWidth = stageSize.width;
        targetHeight = stageSize.height;
        dimensionsAvailable = true;
      }

      if (dimensionsAvailable) {
        const newWidthInput = formatDimensionDisplay(targetWidth);
        const newHeightInput = formatDimensionDisplay(targetHeight);

        if (newWidthInput !== widthInput || newHeightInput !== heightInput ||
          (cropRect && (!prevCropRectRef.current ||
            prevCropRectRef.current.width !== cropRect.width ||
            prevCropRectRef.current.height !== cropRect.height))) {
          setWidthInput(newWidthInput);
          setHeightInput(newHeightInput);
          if (cropRect) prevCropRectRef.current = cropRect;
          else if (stageSize) prevCropRectRef.current = { x: 0, y: 0, width: stageSize.width, height: stageSize.height };
        }
      } else {
        setWidthInput("");
        setHeightInput("");
      }
    } else {
      setWidthInput("");
      setHeightInput("");
      prevCropRectRef.current = null;
    }
  }, [isCropping, cropRect, stageSize, widthInput, heightInput]);

  const handleDimensionChange = (value: string, dimension: 'width' | 'height') => {
    isUpdatingRef.current = true;

    const numericValue = parseFloat(value);
    if (dimension === 'width') setWidthInput(value);
    if (dimension === 'height') setHeightInput(value);

    if (isNaN(numericValue)) {
      isUpdatingRef.current = false;
      return;
    }

    let currentCropRect = cropRect;
    if (!currentCropRect && isCropping && stageSize && stageSize.width > 0 && stageSize.height > 0) {
      currentCropRect = { x: 0, y: 0, width: stageSize.width, height: stageSize.height };
    }
    if (!currentCropRect) {
      isUpdatingRef.current = false;
      return;
    }

    let newWidth = (dimension === 'width') ? numericValue : currentCropRect.width;
    let newHeight = (dimension === 'height') ? numericValue : currentCropRect.height;

    let targetAspectRatio = selectedAspectRatio;
    if (numericValue <= 0 && selectedAspectRatio !== 'custom') {
      targetAspectRatio = 'custom';
    }

    if (targetAspectRatio !== 'custom' && numericValue > 0) {
      const [ratioW, ratioH] = targetAspectRatio.split(':').map(Number);
      if (dimension === 'width') {
        newHeight = (newWidth / ratioW) * ratioH;
        if (newHeight > 0) setHeightInput(formatDimensionDisplay(newHeight)); else setHeightInput("0");
      } else {
        newWidth = (newHeight / ratioH) * ratioW;
        if (newWidth > 0) setWidthInput(formatDimensionDisplay(newWidth)); else setWidthInput("0");
      }
    }

    const finalWidth = roundToTwoDecimals(newWidth);
    const finalHeight = roundToTwoDecimals(newHeight);

    if (finalWidth > 0 && finalHeight > 0 &&
      (finalWidth !== currentCropRect.width || finalHeight !== currentCropRect.height)) {
      setCropRect({ ...currentCropRect, width: finalWidth, height: finalHeight });
      prevCropRectRef.current = { ...currentCropRect, width: finalWidth, height: finalHeight };
    } else {
      if (!isNaN(finalWidth) && finalWidth <= 0) {
        setWidthInput(formatDimensionDisplay(currentCropRect.width));
      }
      if (!isNaN(finalHeight) && finalHeight <= 0) {
        setHeightInput(formatDimensionDisplay(currentCropRect.height));
      }
    }

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const handleAspectRatioChange = (value: string) => {
    if (value === selectedAspectRatio) return;

    isUpdatingRef.current = true;
    setSelectedAspectRatio(value);

    if (!stageSize) {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
      return;
    }

    if (value === 'custom') {
      const fullSizeCropRect = {
        x: 0,
        y: 0,
        width: roundToTwoDecimals(stageSize.width),
        height: roundToTwoDecimals(stageSize.height)
      };
      setCropRect(fullSizeCropRect);
      prevCropRectRef.current = fullSizeCropRect;
      setWidthInput(formatDimensionDisplay(fullSizeCropRect.width));
      setHeightInput(formatDimensionDisplay(fullSizeCropRect.height));

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
      return;
    }

    const [ratioW, ratioH] = value.split(':').map(Number);
    const canvasW = stageSize.width;
    const canvasH = stageSize.height;

    const basePercentage = 0.75;
    let finalW, finalH;

    const potentialWBasedOnHeight = canvasH * basePercentage * (ratioW / ratioH);


    if (potentialWBasedOnHeight <= canvasW * basePercentage) {
      finalH = canvasH * basePercentage;
      finalW = finalH * (ratioW / ratioH);
    } else {
      finalW = canvasW * basePercentage;
      finalH = finalW * (ratioH / ratioW);
    }

    finalW = Math.max(10, Math.min(finalW, canvasW));
    finalH = Math.max(10, Math.min(finalH, canvasH));

    if (finalW < canvasW * basePercentage && (finalW * (ratioH / ratioW)) !== finalH) {
      finalH = finalW * (ratioH / ratioW);
    }
    else if (finalH < canvasH * basePercentage && (finalH * (ratioW / ratioH)) !== finalW) {
      finalW = finalH * (ratioW / ratioH);
    }

    if (finalW > canvasW) {
      finalW = canvasW;
      finalH = finalW * (ratioH / ratioW);
    }
    if (finalH > canvasH) {
      finalH = canvasH;
      finalW = finalH * (ratioW / ratioH);
    }

    finalW = Math.max(10, finalW);
    finalH = Math.max(10, finalH);


    const newX = (canvasW - finalW) / 2;
    const newY = (canvasH - finalH) / 2;

    const newCropRect = {
      x: roundToTwoDecimals(newX),
      y: roundToTwoDecimals(newY),
      width: roundToTwoDecimals(finalW),
      height: roundToTwoDecimals(finalH),
    };

    setCropRect(newCropRect);
    prevCropRectRef.current = newCropRect;
    setWidthInput(formatDimensionDisplay(newCropRect.width));
    setHeightInput(formatDimensionDisplay(newCropRect.height));

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const handleApplyCrop = () => {
    if (!cropRect || cropRect.width <= 0 || cropRect.height <= 0) return;
    setTriggerApplyCrop();
  };

  const handleResetCrop = () => {
    if (!stageSize || stageSize.width <= 0 || stageSize.height <= 0) return;

    isUpdatingRef.current = true;

    const fullSizeCropRect = {
      x: 0,
      y: 0,
      width: roundToTwoDecimals(stageSize.width),
      height: roundToTwoDecimals(stageSize.height)
    };

    setCropRect(fullSizeCropRect);
    prevCropRectRef.current = fullSizeCropRect;
    setWidthInput(formatDimensionDisplay(fullSizeCropRect.width));
    setHeightInput(formatDimensionDisplay(fullSizeCropRect.height));
    setSelectedAspectRatio('custom');

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const aspectRatios = [
    { value: 'custom', label: 'Arbitrarily' },
    { value: '1:1', label: '1:1 (square)' },
    { value: '16:9', label: '16:9 (widescreen)' },
    { value: '4:3', label: '4:3 (screen)' },
    { value: '3:2', label: '3:2 (35mm film)' },
  ];

  if (!isCropping && activeTool?.type !== 'crop') {
    return null;
  }

  const selectedLabel = aspectRatios.find(r => r.value === selectedAspectRatio)?.label || "Соотношение";

  return (
    <div className="flex items-center space-x-3  bg-[#292C31FF] text-white h-full">
      <Crop strokeWidth={1.5} className="!w-5 !h-5 text-[#A8AAACFF] flex-shrink-0" />

      <div className="flex items-center space-x-1.5">
        <label htmlFor="crop-width" className="text-xs text-[#A8AAACFF] flex-shrink-0">W:</label>
        <Input
          id="crop-width"
          type="number"
          placeholder="Ш"
          className="w-15 bg-[#1E1F22] hide-arrows border-2 border-[#44474AFF] rounded text-xs !h-7 px-1 focus-within:border-blue-500 text-center"
          value={widthInput}
          onChange={(e) => handleDimensionChange(e.target.value, 'width')}
          min="1"
          disabled={!isCropping}
        />
      </div>
      <div className="flex items-center space-x-1.5">
        <label htmlFor="crop-height" className="text-xs text-[#A8AAACFF] flex-shrink-0">H:</label>
        <Input
          id="crop-height"
          type="number"
          placeholder="В"
          className="w-15 bg-[#1E1F22] border-2 hide-arrows border-[#44474AFF] rounded text-xs !h-7 px-1 focus-within:border-blue-500 text-center"
          value={heightInput}
          onChange={(e) => handleDimensionChange(e.target.value, 'height')}
          min="1"
          disabled={!isCropping}
        />
      </div>
      <div className="flex items-center space-x-1.5">
        <Label className="text-[14px] text-[#D4D4D5FF] pl-3">Preset:</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!isCropping || !stageSize}>
            <Button
              variant="ghost"
              id="crop-aspect-ratio-trigger"
              aria-label="Соотношение сторон"
              className="w-auto flex items-center h-7 px-2 gap-2 text-white rounded bg-[#1E1F22] border-2 border-[#44474AFF]"
            >
              {selectedLabel}
              <ChevronDown size={12} className="text-white ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white !text-xs p-0"
          >
            {aspectRatios.map((ratio) => (
              <DropdownMenuItem
                key={ratio.value}
                className="flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer"
                onClick={() => handleAspectRatioChange(ratio.value)}
              >
                {selectedAspectRatio === ratio.value && <Check size={14} className="text-blue-400" />}
                <span className={selectedAspectRatio !== ratio.value ? "ml-5" : ""}>
                  {ratio.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center space-x-2 pl-1">
        <Button
          onClick={handleResetCrop}
          variant="ghost"
          className="bg-[#383A3EFF] hover:bg-[#414448FF] text-[#D4D4D5] text-xs h-7 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isCropping}
        >
          Reset
        </Button>
        <Button
          onClick={handleApplyCrop}
          className="bg-[#007ACC] hover:bg-[#005A99] text-white text-xs h-7 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isCropping || !cropRect || cropRect.width <= 0 || cropRect.height <= 0}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default CropOptions; 