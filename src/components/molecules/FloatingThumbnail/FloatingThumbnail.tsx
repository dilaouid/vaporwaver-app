"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronUp } from 'lucide-react';

interface FloatingThumbnailProps {
  previewUrl: string | null;
  isLoading: boolean;
  scrollToPreview: () => void;
}

export const FloatingThumbnail: React.FC<FloatingThumbnailProps> = ({
  previewUrl,
  isLoading,
  scrollToPreview
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Get preview element - this would be your preview card container
      const previewElement = document.getElementById('preview-container');
      if (!previewElement) return;

      const previewRect = previewElement.getBoundingClientRect();
      const isPreviewVisible = previewRect.bottom > 0;
      const scrollingDown = window.scrollY > lastScrollY.current;
      
      // Only show thumbnail when:
      // 1. Preview is not visible (scrolled past it)
      // 2. We're scrolling down (to avoid it appearing when scrolling back up)
      // 3. We've scrolled at least 100px (to avoid immediate appearance)
      setIsVisible(!isPreviewVisible && scrollingDown && window.scrollY > 100);
      
      lastScrollY.current = window.scrollY;
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't render anything if no preview or not visible
  if (!isVisible || !previewUrl) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
        isExpanded ? 'scale-100' : 'scale-75'
      }`}
    >
      <div className="relative group">
        {/* Thumbnail preview */}
        <div 
          className={`bg-black/80 p-1 rounded-lg shadow-lg border border-purple-500/30 
                      ${isExpanded ? 'w-32 h-32' : 'w-16 h-16'} overflow-hidden
                      transition-all duration-300`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="relative w-full h-full rounded-md overflow-hidden">
            <Image
              src={previewUrl}
              alt="Preview thumbnail"
              fill
              className="object-cover"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Return to preview button */}
        <button
          onClick={scrollToPreview}
          className="absolute -top-3 -left-3 bg-purple-600 text-white p-1 rounded-full 
                     shadow-lg opacity-0 group-hover:opacity-100 transition-opacity
                     hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Return to preview"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};