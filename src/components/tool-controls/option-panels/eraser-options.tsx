import React from "react";
import { useTool } from "@/context/tool-context";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Eraser, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NumberInputWithPopover from "@/components/ui/number-input-with-popover";
import { MirrorSelector } from "./common";

const EraserOptions: React.FC = () => {
  const {
    eraserSize,
    setEraserSize,
    eraserHardness,
    setEraserHardness,
    eraserMirrorMode,
    setEraserMirrorMode
  } = useTool();

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-1 h-8 pl-1 pr-1">
            <span className="text-xs text-[#D4D4D5FF]">Eraser</span>
            <div className="relative flex flex-col items-center mt-1">
              <span className="text-xs text-white">{eraserSize}</span>
              <ChevronDown size={12} className="text-[#A8AAACFF] -mt-1" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-52 p-3 bg-[#292C31FF] border-2 shadow-md">
          <div className="flex items-center space-x-2">
            <Slider id="eraser-size" min={1} max={100} step={1} value={[eraserSize]} onValueChange={(value) => setEraserSize(value[0])} className="flex-1" />
            <span className="text-xs w-10 text-right text-white">{eraserSize}px</span>
          </div>
        </PopoverContent>
      </Popover>

      <NumberInputWithPopover
        label="Hardness"
        value={eraserHardness}
        onChange={setEraserHardness}
        min={1}
        max={100}
        suffix="%"
      />

      <div className="ml-3 h-6 border-l border-[#44474AFF]"></div>

      <MirrorSelector value={eraserMirrorMode} onChange={setEraserMirrorMode} />
    </div>
  );
};

export default EraserOptions; 