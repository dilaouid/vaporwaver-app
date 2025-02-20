"use client";
import React, { useEffect } from "react";
import { X, Download } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface FinalPreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const FinalPreviewModal: React.FC<FinalPreviewModalProps> = ({ 
  imageUrl, 
  onClose 
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'vaporwave-creation.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
      <div onClick={(e) => e.stopPropagation()} className="relative max-w-[90vw] max-h-[90vh] bg-gradient-to-b from-gray-900 to-black p-1 rounded-xl overflow-hidden">
        {/* Glow effect around modal */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-xl blur-sm opacity-50"></div>
        
        <div className="relative rounded-lg overflow-hidden bg-black">
          {/* Close button */}
          <button
            className="absolute top-3 right-3 z-10 p-2 bg-black/60 rounded-full text-gray-300 hover:text-white hover:bg-pink-500/30 transition-all duration-300"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Main image */}
          <div className="p-1">
            <div className="relative rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt="Final Vaporwave Creation"
                className="max-w-full max-h-[75vh] object-contain"
                width={460}
                height={595}
              />
              <div className="absolute inset-0 pointer-events-none bg-scan-lines opacity-10"></div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="p-6 bg-black flex justify-center gap-2">
            <Button 
              onClick={handleDownload}
              className="bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 text-white px-20 py-2 flex items-center gap-2 group rounded"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Download</span>
            </Button>
            
          </div>
        </div>
      </div>
    </div>
  );
};