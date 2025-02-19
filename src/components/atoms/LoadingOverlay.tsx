import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Loading..." }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-50">
      <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
      <p className="text-purple-200 text-sm font-medium">{message}</p>
    </div>
  );
};