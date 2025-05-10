import type React from "react"
import { Input } from "@/components/ui/input"

interface ColorPickerProps {
  color: string
  setColor: (color: string) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, setColor }) => {
  const presetColors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#c0c0c0",
    "#808080",
    "#800000",
    "#808000",
    "#008000",
    "#800080",
    "#008080",
    "#000080",
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: color }} />
        <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 p-0 border-0" />
      </div>
      <div className="grid grid-cols-8 gap-1">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            className="w-5 h-5 rounded border border-gray-600"
            style={{ backgroundColor: presetColor }}
            onClick={() => setColor(presetColor)}
          />
        ))}
      </div>
    </div>
  )
}

export default ColorPicker
