import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, Check, UnfoldHorizontal, UnfoldVertical, Move, FlipVertical, FlipHorizontal, Square } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MirrorMode } from "@/context/tool-context";

export const lightenColor = (hex: string, percent: number): string => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(s => s + s).join('');
  }

  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const FourWayMirrorIcon: React.FC<{ size?: number; strokeWidth?: number; className?: string }> = ({ 
  size = 24, 
  strokeWidth = 2,
  className = "" 
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="white" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={`lucide lucide-flip-vertical-icon ${className}`}
  >
    <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/>
    <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/>
    <path d="M4 12H2"/>
    <path d="M10 12H8"/>
    <path d="M16 12h-2"/>
    <path d="M22 12h-2"/>
    <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"/>
    <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/>
    <path d="M12 20v2"/>
    <path d="M12 14v2"/>
    <path d="M12 8v2"/>
    <path d="M12 2v2"/>
  </svg>
);

// Component for displaying a mirror mode
const MirrorModePreview: React.FC<{ style: MirrorMode }> = ({ style }) => {
  return (
    <div className="flex items-center justify-center w-4 h-4 !text-white">
      {style === 'None' ? <Square size={12} strokeWidth={1.5} color="white" /> :
        style === 'Vertical' ? <FlipHorizontal size={12} strokeWidth={1.5} color="white" /> :
          style === 'Horizontal' ? <FlipVertical size={12} strokeWidth={1.5} color="white" /> :
            style === 'Four-way' ? <FourWayMirrorIcon size={12} strokeWidth={1.5} /> : null
      }
    </div>
  );
};

export const MirrorSelector: React.FC<{
  value: MirrorMode;
  onChange: (value: MirrorMode) => void;
}> = ({ value, onChange }) => {
  const mirrorModeLabels: Record<MirrorMode, string> = {
    "None": "None",
    "Vertical": "Vertical",
    "Horizontal": "Horizontal",
    "Four-way": "Four-way"
  };

  return (
    <div className="flex items-center space-x-2">
      <Label className="text-xs text-[#D4D4D5FF] pl-3">Mirror mode:</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2 text-xs text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
            <MirrorModePreview style={value} />
            {mirrorModeLabels[value]}
            <ChevronDown size={12} className="text-white ml-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0 relative m-0">
          {Object.entries(mirrorModeLabels).map(([mode, label]) => (
            <DropdownMenuItem
              key={mode}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:rounded-sm hover:bg-[#3F434AFF] focus:bg-[#3F434AFF] ${value === mode ? "bg-[#3F434AFF] rounded-sm text-white" : ""}`}
              onClick={() => onChange(mode as MirrorMode)}
            >
              <MirrorModePreview style={mode as MirrorMode} />
              <span className="text-white">{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 

// Helper function to convert hex/rgb and opacity (0-100) to RGBA string
export const colorToRGBA = (color: string, opacityPercent: number): string => {
  if (color === 'transparent') {
    return `rgba(0,0,0,0)`; // Fully transparent
  }
  const opacity = Math.max(0, Math.min(100, opacityPercent)) / 100;
  let r = 0, g = 0, b = 0;

  if (color.startsWith('#')) {
    const hex = color.substring(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } else if (color.startsWith('rgb')) { // Basic rgb() and rgba() support
    const parts = color.match(/\d+/g);
    if (parts && parts.length >= 3) {
      r = parseInt(parts[0], 10);
      g = parseInt(parts[1], 10);
      b = parseInt(parts[2], 10);
      // Opacity from rgba() string is ignored, opacityPercent argument takes precedence
    }
  } else {
    // For named colors, this basic converter won't work without a canvas trick or a library.
    // However, for the preview, we can try to render it and let the browser handle it.
    // For a consistent RGBA preview, it's better to ensure input is hex/rgb or use a robust parser.
    console.warn("Basic colorToRGBA cannot derive RGB from named color for preview: ", color);
    // Fallback for preview: return the color itself if not transparent, opacity might not apply visually in all contexts with named colors.
    return opacity === 1 ? color : `rgba(0,0,0,${opacity})`; // Fallback to black with opacity if color is unknown and not fully opaque
  }
  return `rgba(${r},${g},${b},${opacity})`;
};