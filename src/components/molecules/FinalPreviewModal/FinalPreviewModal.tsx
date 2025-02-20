"use client";
import React, { useEffect, useRef } from "react";
import { X, Download, Share2 } from "lucide-react";
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
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'vaporwave-creation.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      // Convert image URL to blob for sharing
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'vaporwave-creation.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Vaporwave Creation',
          files: [file],
        });
      } else {
        // Fallback to copy to clipboard
        handleDownload();
        alert('Sharing not supported in this browser. Image downloaded instead.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        ref={modalRef}
        className="relative max-w-[90vw] max-h-[90vh] bg-gradient-to-b from-gray-900 to-black p-1 rounded-xl overflow-hidden"
      >
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
          <div className="p-4 bg-black flex justify-center gap-4">
            <Button 
              onClick={handleDownload}
              className="bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 group"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Download</span>
            </Button>
            
            <Button 
              onClick={handleShare}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 group"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};