import React from "react";
import { useTool } from "@/context/tool-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";

const TextOptions: React.FC = () => {
  const { 
    color, 
    setColor, 
  } = useTool();

  return (
    <div className="flex items-center space-x-4">
      <div>
        <Label htmlFor="text-color" className="text-xs">
          Color
        </Label>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: color }} />
          <Input
            id="text-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border-0"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Font</Label>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" className="w-8 h-8">
            <Bold size={14} />
          </Button>
          <Button variant="ghost" className="w-8 h-8">
            <Italic size={14} />
          </Button>
          <Button variant="ghost" className="w-8 h-8">
            <Underline size={14} />
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-xs">Align</Label>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" className="w-8 h-8">
            <AlignLeft size={14} />
          </Button>
          <Button variant="ghost" className="w-8 h-8">
            <AlignCenter size={14} />
          </Button>
          <Button variant="ghost" className="w-8 h-8">
            <AlignRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextOptions; 