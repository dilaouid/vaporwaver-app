import React from "react";
import Image from "next/image";

export interface TransformedImageLayerProps {
  src: string;
  alt: string;
  naturalWidth: number;
  naturalHeight: number;
  left: number;
  top: number;
  scale: number; // 1 = 100%
  rotate: number; // en degrés
  zIndex?: number;
  transformOrigin?:
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
}

// Fonction pour transformer les valeurs custom en valeurs CSS valides
const getTransformOrigin = (origin: string): string => {
  switch (origin) {
    case "top-left":
      return "0% 0%";
    case "top-right":
      return "100% 0%";
    case "bottom-left":
      return "0% 100%";
    case "bottom-right":
      return "100% 100%";
    case "center":
    default:
      return "50% 50%";
  }
};

export const TransformedImageLayer: React.FC<TransformedImageLayerProps> = ({
  src,
  alt,
  naturalWidth,
  naturalHeight,
  left,
  top,
  scale,
  rotate,
  zIndex = 0,
  transformOrigin = "center",
}) => {
  return (
    <div
      className="absolute select-none"
      style={{
        left,
        top,
        width: naturalWidth,
        height: naturalHeight,
        zIndex,
        transformOrigin: getTransformOrigin(transformOrigin),
        transform: `scale(${scale}) rotate(${rotate}deg)`,
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={naturalWidth}
        height={naturalHeight}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
};
