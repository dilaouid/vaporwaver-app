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
  colorScheme?: "purple" | "cyan";
  disabled?: boolean;
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
  isEffectControl = false,
  colorScheme = "purple",
  disabled = false
}) => {
  const handleValueChange = React.useCallback(
    (newValue: number[]) => {
      onChange(newValue[0]);
    },
    [onChange]
  );

  const { isDragging, dragHandlers } = useDragging({
    onDragStateChange: (isDragging) => {
      // Only notify about drag state changes if this isn't an effect control
      // For effect controls, we'll wait for onDragEnd to trigger API calls
      if (!isEffectControl) {
        onDragStateChange?.(isDragging);
      }
    },
    // Always use onDragEnd for effect controls to wait until user finishes dragging
    onDragEnd: isEffectControl ? () => {
      // For effect controls, we only trigger updates after dragging ends
      if (onDragEnd) onDragEnd();
      if (onDragStateChange) onDragStateChange(false);
    } : undefined,
    // No need for short debounce on effect controls since we only update on end
    debounceTime: 300
  });

  const getTextColor = () => {
    if (colorScheme === "purple") {
      return isDragging ? "text-purple-300" : "text-purple-100";
    } else {
      return isDragging ? "text-cyan-300" : "text-cyan-100";
    }
  };

  const getValueColor = () => {
    if (colorScheme === "purple") {
      return isDragging ? "text-pink-300" : "text-gray-400";
    } else {
      return isDragging ? "text-cyan-300" : "text-gray-400";
    }
  };

  const getSliderClass = () => {
    return colorScheme === "purple" 
      ? "control-group-purple" 
      : "control-group-cyan";
  };

  return (
    <div className={cn(
      "space-y-2", 
      className, 
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <div className="flex justify-between items-center">
        <Label className={`${getTextColor()} ${disabled && "text-opacity-50"}`}>
          {label}
          {isEffectControl && (
            <span className={`ml-1 ${colorScheme === "purple" ? "text-purple-400" : "text-cyan-400"} text-xs ${disabled && "text-opacity-50"}`}>*</span>
          )}
        </Label>
        <span className={cn(
          "text-sm font-medium transition-all duration-300 flex items-center",
          getValueColor(),
          disabled && "text-opacity-50"
        )}>
          <span className={isDragging && !disabled ? "scale-110 transition-transform" : ""}>
            {value}{unit}
          </span>
        </span>
      </div>
      <div className={`relative ${getSliderClass()} ${disabled && "opacity-50"}`}>
        {isDragging && !disabled && (
          <div className={`absolute inset-0 -m-2 rounded-full blur-md opacity-20 
                        ${colorScheme === "purple" ? "bg-purple-400" : "bg-cyan-400"}`}></div>
        )}
        <Slider
          {...(!disabled && dragHandlers)}
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={!disabled ? handleValueChange : undefined}
          className={cn(
            "py-4 relative z-10", 
            isEffectControl && colorScheme === "purple" ? "accent-purple-500" : "",
            isEffectControl && colorScheme === "cyan" ? "accent-cyan-500" : "",
            disabled && "cursor-not-allowed"
          )}
          disabled={disabled}
        />
      </div>
    </div>
  );
};