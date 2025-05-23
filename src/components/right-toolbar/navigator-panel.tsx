import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTool } from '@/context/tool-context';
import { formatDimensionDisplay } from '@/utils/format-utils';
import MiniMap from './mini-map';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface NavigatorPanelProps {
  onClose: () => void;
  isSharedHeight?: boolean;
}

const NavigatorPanel: React.FC<NavigatorPanelProps> = ({ onClose, isSharedHeight }) => {
  const { stageSize, zoom, setZoom, cursorPositionOnCanvas } = useTool();

  const heightClass = isSharedHeight ? 'h-[260px]' : 'h-full';

  const [tempZoomInput, setTempZoomInput] = useState<string>(() => String(Math.round(zoom)));
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const lastZoomRef = useRef<number>(zoom);
  const isUpdatingZoomRef = useRef<boolean>(false);

  // Обновляем tempZoomInput только когда zoom действительно изменился извне
  useEffect(() => {
    const roundedZoom = Math.round(zoom);
    
    // Не обновляем если мы сами изменяем zoom или если инпут в фокусе
    if (!isUpdatingZoomRef.current && 
        document.activeElement !== zoomInputRef.current && 
        lastZoomRef.current !== roundedZoom) {
      
      setTempZoomInput(String(roundedZoom));
      lastZoomRef.current = roundedZoom;
    }
  }, [zoom]);

  const handleSliderValueChange = useCallback((value: number[]) => {
    const newZoom = Math.round(value[0]);
    if (newZoom !== zoom) {
      isUpdatingZoomRef.current = true;
      setZoom(newZoom);
      setTempZoomInput(String(newZoom));
      lastZoomRef.current = newZoom;
      
      // Сбрасываем флаг через небольшой таймаут
      setTimeout(() => {
        isUpdatingZoomRef.current = false;
      }, 100);
    }
  }, [zoom, setZoom]);

  const minZoom = 10;
  const maxZoom = 500;

  const handleZoomInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    inputValue = inputValue.replace(/[^\d]/g, "");

    if (inputValue === "") {
      setTempZoomInput("");
      return;
    }

    let num = parseInt(inputValue, 10);

    if (isNaN(num)) {
      setTempZoomInput(inputValue);
      return;
    }

    if (num > maxZoom) {
      num = maxZoom;
      inputValue = String(maxZoom);
    }

    setTempZoomInput(inputValue);
  }, [maxZoom]);

  const handleZoomInputBlur = useCallback(() => {
    let currentNum = parseInt(tempZoomInput, 10);
    if (isNaN(currentNum) || tempZoomInput.trim() === "") {
      currentNum = minZoom;
    }
    currentNum = Math.max(minZoom, Math.min(maxZoom, currentNum));
    
    if (currentNum !== zoom) {
      isUpdatingZoomRef.current = true;
      setZoom(currentNum);
      lastZoomRef.current = currentNum;
      
      setTimeout(() => {
        isUpdatingZoomRef.current = false;
      }, 100);
    }
    
    setTempZoomInput(String(currentNum));
  }, [tempZoomInput, zoom, setZoom, minZoom, maxZoom]);

  const handleZoomInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      zoomInputRef.current?.blur();
    }
  }, []);

  return (
    <div className={`w-full ${heightClass} border-t-1 border-[#171719FF] bg-[#292C31FF] text-[#A8AAACFF]  flex flex-col`}>
      <div className="flex items-center bg-[#24262BFF] p-1">
        <div className="flex-1"></div>
        <h3 className="text-xs font-semibold text-[#E8E8E8FF] text-center">Navigator</h3>
        <div className="flex-1 flex justify-end">
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-white text-2xl mr-1 leading-none">×</button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="flex flex-row items-start space-x-3">
          <div className="w-[120px] h-[150px] bg-[#202225FF] border border-[#44474AFF] rounded flex-shrink-0 flex items-center justify-center">
            <MiniMap />
          </div>
          <div className="text-xs flex-grow pt-px flex flex-col space-y-4">
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="inline-block w-5 text-[#A8AAACFF] shrink-0">X:</span>
                <span className="font-medium text-[#C1C1C1FF]">
                  {cursorPositionOnCanvas && stageSize &&
                    cursorPositionOnCanvas.x >= 0 && cursorPositionOnCanvas.x < stageSize.width &&
                    cursorPositionOnCanvas.y >= 0 && cursorPositionOnCanvas.y < stageSize.height
                    ? Math.round(cursorPositionOnCanvas.x)
                    : ''}
                </span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-5 text-[#A8AAACFF] shrink-0">Y:</span>
                <span className="font-medium text-[#C1C1C1FF]">
                  {cursorPositionOnCanvas && stageSize &&
                    cursorPositionOnCanvas.x >= 0 && cursorPositionOnCanvas.x < stageSize.width &&
                    cursorPositionOnCanvas.y >= 0 && cursorPositionOnCanvas.y < stageSize.height
                    ? Math.round(cursorPositionOnCanvas.y)
                    : ''}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center">
                <span className="inline-block w-5 text-[#A8AAACFF] shrink-0">W:</span>
                <span className="font-medium text-[#C1C1C1FF]">
                  {stageSize ? formatDimensionDisplay(stageSize.width) : ''}
                </span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-5 text-[#A8AAACFF] shrink-0">H:</span>
                <span className="font-medium text-[#C1C1C1FF]">
                  {stageSize ? formatDimensionDisplay(stageSize.height) : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Slider
            id="zoom-slider"
            min={minZoom}
            max={maxZoom}
            step={1}
            value={[Math.round(zoom)]}
            onValueChange={handleSliderValueChange}
            className="flex-grow"
          />
          <div
            className="flex items-center h-6 bg-[#202225FF] border-2 border-[#44474AFF] rounded px-1.5 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text"
            onClick={() => zoomInputRef.current?.focus()}
          >
            <Input
              ref={zoomInputRef}
              type="text"
              value={tempZoomInput}
              onChange={handleZoomInputChange}
              onBlur={handleZoomInputBlur}
              onKeyDown={handleZoomInputKeyDown}
              className="w-7 bg-transparent border-none text-xs text-white text-center focus:ring-0 p-0"
              maxLength={3}
            />
            <span className="text-xs text-[#A8AAACFF]">%</span>
          </div>
        </div>

        <div className="flex-grow"></div>
      </div>
    </div>
  );
};

export default NavigatorPanel; 