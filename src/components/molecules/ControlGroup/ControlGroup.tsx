import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useDragging } from "@/hooks/use-dragging";

interface ControlGroupProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
  onDragStateChange?: (dragging: boolean) => void;
  onDragEnd?: () => void;
  isEffectControl?: boolean;
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
  onDragStateChange,
  onDragEnd,
  isEffectControl = false
}) => {
  const handleValueChange = React.useCallback(
    (newValue: number[]) => {
      onChange(newValue[0]);
    },
    [onChange]
  );

  const { isDragging, dragHandlers } = useDragging({
    onDragStateChange: (isDragging) => {
      onDragStateChange?.(isDragging);
    },
    // Only use onDragEnd if we're handling an effect control
    onDragEnd: isEffectControl ? onDragEnd : undefined,
    // Use shorter debounce for effect controls
    debounceTime: isEffectControl ? 150 : 300
  });

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <Label className="text-gray-200">
          {label}
          {isEffectControl && (
            <span className="ml-1 text-purple-400 text-xs">*</span>
          )}
        </Label>
        <span className={cn(
          "text-sm transition-opacity duration-200",
          isDragging 
            ? "text-purple-300 font-medium" 
            : "text-gray-400"
        )}>
          {value}
          {unit}
        </span>
      </div>
      <Slider
        {...dragHandlers}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleValueChange}
        className={cn(
          "py-4", 
          isEffectControl && "accent-purple-500"
        )}
      />
    </div>
  );
};