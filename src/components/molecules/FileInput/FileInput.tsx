import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface FileInputProps {
  label: string;
  onChange: (file: File) => void;
  accept?: string;
  colorScheme?: "purple" | "cyan";
}

export const FileInput: React.FC<FileInputProps> = ({
  label,
  onChange,
  accept = "image/png",
  colorScheme = "purple"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      onChange(file);
    }
  };

  const getBorderColor = () => {
    if (isDragging) {
      return colorScheme === "purple" ? "border-purple-400" : "border-cyan-400";
    }
    return colorScheme === "purple" ? "border-purple-500/50" : "border-cyan-500/50";
  };

  const getHoverColor = () => {
    return colorScheme === "purple" ? "hover:bg-purple-500/10" : "hover:bg-cyan-500/10";
  };

  const getIconColor = () => {
    return colorScheme === "purple" ? "text-purple-400" : "text-cyan-400";
  };

  return (
    <div className="space-y-2">
      <Label className={`${colorScheme === "purple" ? "text-purple-100" : "text-cyan-100"}`}>
        {label}
      </Label>
      <div
        className={`relative bg-black/50 border ${getBorderColor()} rounded-md cursor-pointer 
                  ${getHoverColor()} transition-all duration-300 overflow-hidden
                  ${isDragging ? "ring-2 ring-offset-0 ring-offset-black" : ""}
                  ${colorScheme === "purple" ? "ring-purple-400" : "ring-cyan-400"}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleChange}
          accept={accept}
          className="hidden"
        />
        
        {/* Background animation when dragging */}
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse-slow"></div>
        )}
        
        <div className="relative z-10 flex items-center px-3 py-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                        ${colorScheme === "purple" ? "bg-purple-500/20" : "bg-cyan-500/20"}`}>
            <Upload className={`w-4 h-4 ${getIconColor()}`} />
          </div>
          <div className="ml-3 flex-grow">
            <span className={`${colorScheme === "purple" ? "text-purple-100" : "text-cyan-100"} text-sm font-medium`}>
              {fileName || "Choose PNG file..."}
            </span>
            <p className="text-gray-400 text-xs mt-0.5">
              Drag & drop or click to browse
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};