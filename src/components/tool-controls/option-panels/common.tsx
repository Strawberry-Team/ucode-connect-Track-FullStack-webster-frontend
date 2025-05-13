import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, Check } from "lucide-react";
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

export const MirrorSelector: React.FC<{
  value: MirrorMode;
  onChange: (value: MirrorMode) => void;
}> = ({ value, onChange }) => {
  const mirrorModeLabels: Record<MirrorMode, string> = {
    "None": "No",
    "Vertical": "Vertical",
    "Horizontal": "Horizontal",
    "Four-way": "Four-way"
  };

  return (
    <div className="flex items-center space-x-2">
      <Label className="text-[14px] text-[#D4D4D5FF] pl-3">Mirror mode:</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center h-7 px-2 gap-2  text-white rounded bg-[#1e1f22] border-2 border-[#44474AFF]">
            <Copy size={14} className="text-[#A8AAACFF]" />
            {mirrorModeLabels[value]}
            <ChevronDown size={12} className="text-white ml-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#292C31FF] border-2 border-[#44474AFF] text-white text-xs p-0">
          {Object.entries(mirrorModeLabels).map(([mode, label]) => (
            <DropdownMenuItem
              key={mode}
              className="flex items-center gap-2 px-3 py-2 !text-white focus:bg-[#3F434AFF] cursor-pointer"
              onClick={() => onChange(mode as MirrorMode)}
            >
              {value === mode && <Check size={14} className="text-blue-400" />}
              <span className={value !== mode ? "ml-5" : ""}>{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 