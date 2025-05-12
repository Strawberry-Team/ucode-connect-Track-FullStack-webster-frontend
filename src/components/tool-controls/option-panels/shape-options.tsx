import React from "react";
import { useTool } from "@/context/tool-context";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw, Square } from "lucide-react";

const ShapeOptions: React.FC = () => {
  const { 
    color, 
    setColor, 
    opacity, 
    setOpacity
  } = useTool();

  return (
    <div className="flex items-center space-x-4">
      <div>
        <Label htmlFor="shape-color" className="text-xs">
          Fill
        </Label>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: color }} />
          <Input
            id="shape-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border-0"
          />
        </div>
      </div>

      <div className="flex-1">
        <Label htmlFor="shape-opacity" className="text-xs">
          Opacity
        </Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="shape-opacity"
            min={1}
            max={100}
            step={1}
            value={[opacity]}
            onValueChange={(value) => setOpacity(value[0])}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{opacity}%</span>
        </div>
      </div>

      <div>
        <Label className="text-xs">Transform</Label>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" className="w-8 h-8">
            <RotateCcw size={14} />
          </Button>
          <Button variant="ghost" className="w-8 h-8">
            <Square size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShapeOptions; 