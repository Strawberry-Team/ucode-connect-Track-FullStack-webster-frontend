import React, { useState, useEffect, useRef } from "react";

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  onClose?: () => void;
  additionalRefs?: React.RefObject<HTMLElement>[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color: initialColor, setColor, onClose, additionalRefs }) => {
  const [localColor, setLocalColor] = useState(initialColor);
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 });
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingSV, setIsDraggingSV] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);

  // Effect 1: Synchronize with initialColor prop
  useEffect(() => {
    const rgb = hexToRgb(initialColor);
    if (rgb) {
      // initialColor is a valid hex
      setLocalColor(initialColor);
      const hsvResult = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHsv(hsvResult);
    } else {
      // initialColor is 'transparent' or other invalid hex.
      // Default the picker to white.
      const defaultDisplayHex = "#ffffff";
      setLocalColor(defaultDisplayHex);
      const defaultRgb = hexToRgb(defaultDisplayHex)!; // Known valid
      setHsv(rgbToHsv(defaultRgb.r, defaultRgb.g, defaultRgb.b));
    }
  }, [initialColor]);

  // Effect 2: Update HSV when localColor changes (e.g., from presets, hex input, or picker interaction itself)
  useEffect(() => {
    // This effect assumes localColor is the source of truth for HSV after initial setup.
    const currentRgb = hexToRgb(localColor);
    if (currentRgb) {
      const hsvResult = rgbToHsv(currentRgb.r, currentRgb.g, currentRgb.b);
      // Conditional setHsv to prevent potential micro-loops if hsv state is already accurate
      if (Math.round(hsvResult.h) !== hsv.h || Math.round(hsvResult.s) !== hsv.s || Math.round(hsvResult.v) !== hsv.v) {
        setHsv(hsvResult);
      }
    } else {
      // If localColor somehow becomes invalid (e.g. during typing bad hex)
      // Fallback HSV to white. This should be a rare case if localColor is managed well.
      const fallbackDisplayHex = "#ffffff";
      const fallbackRgb = hexToRgb(fallbackDisplayHex)!; // Known valid
      setHsv(rgbToHsv(fallbackRgb.r, fallbackRgb.g, fallbackRgb.b));
    }
  }, [localColor]); // Only depends on localColor

  // Effect for handling clicks outside the color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if the click is outside the ColorPicker itself
      const clickedOutsidePicker = pickerRef.current && !pickerRef.current.contains(target);
      
      if (clickedOutsidePicker) {
        // If clicked outside picker, check if it was inside any of the additional "safe" refs
        const clickedInsideAdditionalRef = additionalRefs?.some(
          (ref) => ref.current && ref.current.contains(target)
        );

        if (!clickedInsideAdditionalRef) {
          onClose?.(); // Only close if not clicked inside an additional ref or the picker itself
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, pickerRef, additionalRefs]); // Add additionalRefs to dependencies

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  };

  const handleMouseDownHue = (e: React.MouseEvent) => {
    setIsDraggingHue(true);
    handleHueMove(e);
  };

  const handleHueMove = (e: React.MouseEvent) => {
    if (hueRef.current) {
      const rect = hueRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      let h = (x / width) * 360;
      h = Math.max(0, Math.min(360, Math.round(h)));
      const newHsv = { ...hsv, h };
      setHsv(newHsv);
      updateColorFromHsv(newHsv);
    }
  };

  const handleMouseDownSV = (e: React.MouseEvent) => {
    setIsDraggingSV(true);
    handleSVMove(e);
  };

  const handleSVMove = (e: React.MouseEvent) => {
    if (svRef.current) {
      const rect = svRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;
      let s = (x / width) * 100;
      let v = 100 - (y / height) * 100;
      s = Math.max(0, Math.min(100, Math.round(s)));
      v = Math.max(0, Math.min(100, Math.round(v)));
      const newHsv = { ...hsv, s, v };
      setHsv(newHsv);
      updateColorFromHsv(newHsv);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingHue(false);
    setIsDraggingSV(false);
  };

  const updateColorFromHsv = (currentHsv: { h: number, s: number, v: number }) => {
    const rgb = hsvToRgb(currentHsv.h, currentHsv.s, currentHsv.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setLocalColor(hex);
  };

  const hsvToRgb = (h: number, s: number, v: number) => {
    s /= 100;
    v /= 100;
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isDraggingHue) {
        handleHueMove(e as any);
      }
      if (isDraggingSV) {
        handleSVMove(e as any);
      }
    };

    const handleWindowMouseUp = () => {
      setIsDraggingHue(false);
      setIsDraggingSV(false);
    };

    if (isDraggingHue || isDraggingSV) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    } else {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDraggingHue, isDraggingSV]);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const handleHsvInputChange = (e: React.ChangeEvent<HTMLInputElement>, part: 'h' | 's' | 'v') => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 0;

    let newHsv;
    if (part === 'h') {
      value = Math.max(0, Math.min(360, value));
      newHsv = { ...hsv, h: value };
    } else {
      value = Math.max(0, Math.min(100, value));
      newHsv = { ...hsv, [part]: value };
    }
    setHsv(newHsv);
    updateColorFromHsv(newHsv);
  };

  const handleRgbInputChange = (e: React.ChangeEvent<HTMLInputElement>, part: 'r' | 'g' | 'b') => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(255, value));

    const currentRgb = hexToRgb(localColor) ?? { r: 0, g: 0, b: 0 };
    const newRgb = { ...currentRgb, [part]: value };
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setLocalColor(hex);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hexValue = e.target.value.trim();
    if (!hexValue.startsWith('#')) {
      hexValue = '#' + hexValue;
    }
    if (/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(hexValue)) {
      setLocalColor(hexValue);
    } else if (hexValue === '#') {
    } else {
    }
  };

  const displayRgb = hexToRgb(localColor) ?? { r: 0, g: 0, b: 0 };

  const presetColors = [
    "#FFFFFF", 
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF", 
    "#FFFF00", 
    "#FF00FF", 
    "#00FFFF", 
    "#FFA500", 
    "#800080", 
  ];

  return (
    <div className="p-3 rounded bg-[#292C31FF] border border-[#44474A] shadow-md w-[300px] select-none" ref={pickerRef}>
      <div className="flex space-x-3">
        <div className="flex flex-col space-y-2">
          <div
            ref={svRef}
            onMouseDown={handleMouseDownSV}
            className="relative w-[160px] h-[150px] overflow-hidden "
            style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
          > 
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <div
              className="absolute w-2.5 h-2.5 rounded-full border border-white shadow-md pointer-events-none"
              style={{
                left: `${hsv.s}%`,
                top: `${100 - hsv.v}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
              }}
            />
          </div>
          <div className="relative w-[160px] h-4 overflow-hidden">
            <div
              ref={hueRef}
              onMouseDown={handleMouseDownHue}
              className="absolute inset-0 cursor-pointer"
              style={{ background: 'linear-gradient(to right, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)' }}
            >
              <div
                className="absolute top-1/2 w-1 h-[85%] bg-gray-300  border border-gray-500 shadow-sm pointer-events-none"
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between flex-1">
          <div className="w-[100px] h-[55px] rounded border border-[#44474A] mb-2 overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 w-full h-1/2"
              style={{ backgroundColor: localColor }}
            />
            <div 
              className="absolute bottom-0 left-0 w-full h-1/2"
              style={{ backgroundColor: initialColor }}
            />
          </div>
          <div className="w-[100px] flex flex-col space-y-1 text-xs text-[#A8AAAC]">
            <div className="flex justify-between space-x-1">
              {[ 'R', 'G', 'B' ].map((label) => (
                <div key={label} className="flex flex-col items-center">
                  <label htmlFor={`input-${label}`} className="mb-0.5">{label}</label>
                  <input 
                    id={`input-${label}`}
                    type="number" 
                    value={displayRgb[label.toLowerCase() as keyof typeof displayRgb]} 
                    onChange={(e) => handleRgbInputChange(e, label.toLowerCase() as 'r' | 'g' | 'b')}
                    className="w-[30px] hide-arrows bg-[#1E1F22] text-white px-1 py-0.5 text-xs text-center rounded border border-[#44474A] focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between space-x-1">
              {[ 'H', 'S', 'V' ].map((label) => (
                <div key={label} className="flex flex-col items-center">
                  <label htmlFor={`input-${label}`} className="mb-0.5">{label}</label>
                  <input 
                    id={`input-${label}`}
                    type="number" 
                    value={hsv[label.toLowerCase() as keyof typeof hsv]} 
                    onChange={(e) => handleHsvInputChange(e, label.toLowerCase() as 'h' | 's' | 'v')}
                    className="w-[30px] hide-arrows bg-[#1E1F22] text-white px-1 py-0.5 text-xs text-center rounded border border-[#44474A] focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="!w-[100px] flex items-end space-x-1 pt-1">
              <label htmlFor="input-hex" className="mb-1">HEX:</label>
              <input 
                id="input-hex"
                type="text" 
                value={localColor.toUpperCase().replace('#', '')}
                onChange={handleHexInputChange}
                maxLength={6}
                className="flex-1 !w-[70px] bg-[#1E1F22] text-white px-2 py-1 text-xs text-center rounded border border-[#44474A] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3">
        <div className="grid grid-cols-10 gap-1.5">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
              className="cursor-pointer w-5 h-5 rounded-full border border-[#44474A] hover:border-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-[#292C31FF] transition-colors duration-100"
            style={{ backgroundColor: presetColor }}
              onClick={() => {
                setLocalColor(presetColor);
              }}
              
          />
        ))}
      </div>
    </div>

      <div className="flex justify-end space-x-2 pt-3">
          <button
            className="cursor-pointer px-3 py-1 bg-[#383A3E] text-[#D4D4D5] text-xs rounded hover:bg-[#414448]"
            onClick={() => onClose?.()}   
          >
            Cancel
          </button>
          <button
            className="cursor-pointer px-3 py-1 bg-[#007ACC] text-white text-xs rounded hover:bg-[#005A99]"
            onClick={() => {
              setColor(localColor);
              onClose?.();
            }}
          >
            Save
          </button>
        </div>
    </div>
  );
};

export default ColorPicker;
