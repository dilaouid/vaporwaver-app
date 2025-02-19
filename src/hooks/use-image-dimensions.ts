import { useState, useEffect } from "react";

export interface ImageDimensions {
  naturalWidth: number;
  naturalHeight: number;
  width: number;
  height: number;
}

export function useImageDimensions(src: string | null, scale: number): ImageDimensions | null {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      setDimensions({
        naturalWidth: img.width,
        naturalHeight: img.height,
        width: img.width * scale,
        height: img.height * scale,
      });
    };
    img.src = src;
  }, [src, scale]);
  return dimensions;
}
