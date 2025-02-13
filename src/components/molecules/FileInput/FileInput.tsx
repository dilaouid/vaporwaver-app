import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface FileInputProps {
  label: string;
  onChange: (file: File) => void;
  accept?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
    label,
    onChange,
    accept = "image/png",
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = React.useState<string>("");
  
    const handleClick = () => {
      console.log("FileInput: Click handler fired");
      inputRef.current?.click();
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("FileInput: Change event fired");
      const file = e.target.files?.[0];
      if (file) {
        console.log("FileInput: File selected:", file.name);
        setFileName(file.name);
        onChange(file);
      }
    };
  
    return (
      <div className="space-y-2">
        <Label className="text-gray-200">{label}</Label>
        <div
          className="relative bg-black/50 border border-purple-500/50 rounded-md cursor-pointer hover:bg-purple-500/10 transition-colors"
          onClick={handleClick}
        >
          <input
            type="file"
            ref={inputRef}
            onChange={handleChange}
            accept={accept}
            className="hidden"
          />
          <div className="flex items-center px-3 py-2">
            <Upload className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-200 text-sm">
              {fileName || "Choose PNG file..."}
            </span>
          </div>
        </div>
      </div>
    );
  };