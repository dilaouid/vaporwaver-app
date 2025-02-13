import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ControlGroupProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
}

export const ControlGroup: React.FC<ControlGroupProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = "",
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <Label className="text-gray-200">{label}</Label>
        <span className="text-sm text-gray-400">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([val]) => onChange(val)}
        className="py-4"
      />
    </div>
  );
};
