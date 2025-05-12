import React, { useState, useRef, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface NumberInputWithPopoverProps {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}

const NumberInputWithPopover: React.FC<NumberInputWithPopoverProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "%"
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tempInput, setTempInput] = useState<string>(() => 
    typeof value === 'number' && !isNaN(value) ? String(value) : "1"
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      if (typeof value === 'number' && !isNaN(value)) {
        setTempInput(String(value));
      } else {
        setTempInput("1"); 
      }
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^\d]/g, "");
    if (inputValue === "") {
      setTempInput("");
      onChange(NaN);
      return;
    }
    let num = parseInt(inputValue, 10);
    if (num > max) inputValue = String(max);
    else if (inputValue.length > 3) inputValue = inputValue.slice(0, 3);
    else if (num < min && inputValue.length > 0) inputValue = String(min);
    
    num = parseInt(inputValue,10);
    setTempInput(inputValue);
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)));
    } else {
      onChange(NaN);
    }
  };

  const handleInputBlur = () => {
    if (tempInput.trim() === "" || isNaN(parseInt(tempInput, 10))) {
      onChange(min);
      setTempInput(String(min));
    } else {
      const currentNum = Math.max(min, Math.min(max, parseInt(tempInput, 10)));
      onChange(currentNum);
      setTempInput(String(currentNum));
    }
  };

  return (
    <>
      <Label className="text-[14px] text-[#D4D4D5FF] pl-3">{label}:</Label>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <div 
            ref={popoverTriggerRef}
            className="flex items-center h-7 px-1.5 rounded bg-[#1e1f22] border-2 border-[#44474AFF] focus-within:border-blue-500 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <Input
              ref={inputRef}
              type="text"
              value={tempInput}
              onFocus={() => setMenuOpen(true)}
              onClick={(e) => {
                if (menuOpen) e.stopPropagation();
              }}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-6 bg-transparent border-none text-xs text-white text-center focus:ring-0 p-0 m-0"
              maxLength={3}
            />
            <span className="text-xs text-white">{suffix}</span>
            <ChevronDown size={12} className="text-white ml-0.5"/>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          side="bottom" 
          align="start" 
          className="w-52 p-3 bg-[#292C31FF] shadow-md ml-2 border-2"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(event) => {
            if (popoverTriggerRef.current?.contains(event.target as Node)) {
              event.preventDefault();
              inputRef.current?.focus();
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <Slider
              min={min}
              max={max}
              step={step}
              value={[typeof value === 'number' && !isNaN(value) ? value : min]}
              onValueChange={(newValue) => {
                onChange(newValue[0]);
                setTempInput(String(newValue[0]));
                inputRef.current?.focus();
              }}
              className="flex-1"
            />
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default NumberInputWithPopover; 