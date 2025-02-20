import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import type { ImageOption } from "@/app/types/vaporwaver";

interface ImageSelectorProps {
  label: string;
  options: ImageOption[];
  value: string;
  onChange: (value: string) => void;
  colorScheme?: "purple" | "cyan";
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  label,
  options,
  value,
  onChange,
  colorScheme = "purple",
}) => {
  const selectedOption = options.find((opt) => opt.id === value);

  const getTriggerStyles = () => {
    if (colorScheme === "purple") {
      return "bg-black/50 border-purple-500/50 text-purple-100";
    } else {
      return "bg-black/50 border-cyan-500/50 text-cyan-100";
    }
  };

  const getContentStyles = () => {
    if (colorScheme === "purple") {
      return "bg-black/90 backdrop-blur-xl border-purple-500/50";
    } else {
      return "bg-black/90 backdrop-blur-xl border-cyan-500/50";
    }
  };

  const getHighlightStyles = () => {
    if (colorScheme === "purple") {
      return "data-[highlighted]:bg-purple-500/20 data-[highlighted]:text-white";
    } else {
      return "data-[highlighted]:bg-cyan-500/20 data-[highlighted]:text-white";
    }
  };

  return (
    <div className="space-y-2">
      <Label
        className={
          colorScheme === "purple" ? "text-purple-100" : "text-cyan-100"
        }
        htmlFor={`image-selector-${label}`}
      >
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        name={`image-selector-${label}`}
      >
        <SelectTrigger
          className={`${getTriggerStyles()} group transition-all duration-300`}
          aria-label={`Select ${label}`}
          id={`image-selector-${label}`}
        >
          <SelectValue>
            <div className="flex items-center gap-2" role="presentation">
              {selectedOption && (
                <div
                  className={`relative w-8 h-8 rounded-md overflow-hidden border
                   ${
                     colorScheme === "purple"
                       ? "border-purple-500/30"
                       : "border-cyan-500/30"
                   }
                   group-hover:scale-105 transition-transform duration-300`}
                >
                  <Image
                    src={selectedOption.thumbnail}
                    alt={`Thumbnail for ${selectedOption.name}`}
                    fill
                    className="object-cover rounded"
                    sizes="64px"
                  />
                </div>
              )}
              <span className="truncate">
                {selectedOption?.name || "Select option"}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className={`${getContentStyles()} max-h-[300px]`}
          position="popper"
          sideOffset={5}
        >
          <div
            className="grid grid-cols-4 gap-2 p-2 overflow-y-auto"
            role="listbox"
            aria-label={`${label} options`}
          >
            {options.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className={`p-1 rounded-md transition-all duration-300 ${getHighlightStyles()}`}
                role="option"
                aria-selected={value === option.id}
              >
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`relative w-16 h-16 rounded-md overflow-hidden border 
                    ${
                      colorScheme === "purple"
                        ? "border-purple-500/20"
                        : "border-cyan-500/20"
                    }
                    transition-all duration-300 hover:scale-105 hover:shadow-glow`}
                  >
                    <Image
                      src={option.thumbnail}
                      alt={`${option.name} preview`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div
                    className={`text-xs ${
                      colorScheme === "purple"
                        ? "text-purple-100"
                        : "text-cyan-100"
                    } text-center mt-1 w-full truncate px-1`}
                  >
                    {option.name}
                  </div>
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};
