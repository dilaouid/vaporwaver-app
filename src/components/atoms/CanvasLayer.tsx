import React from "react";
import Image from "next/image";

export interface CanvasLayerProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  zIndex?: number;
}

export const CanvasLayer: React.FC<CanvasLayerProps> = ({
  src,
  alt,
  fill = false,
  width,
  height,
  style,
  zIndex = 0,
}) => {
  return (
    <div className="object-cover absolute inset-0" style={{ zIndex, ...style }}>
      {fill ? (
        <Image src={src} alt={alt} fill style={{ objectFit: "contain" }} />
      ) : (
        <Image src={src} alt={alt} width={width} height={height} style={{ objectFit: "contain", width: "auto", height: "auto" }} />
      )}
    </div>
  );
};