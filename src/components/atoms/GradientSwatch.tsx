import { gradientPreviews } from "@/lib/gradientPreview";
import React from "react";

interface GradientSwatchProps {
  gradient: string;
}

export const GradientSwatch: React.FC<GradientSwatchProps> = ({ gradient }) => {
  return gradient !== "none" && (
    <span
      className="inline-block w-5 h-5 rounded-full mr-2"
      style={{
        backgroundImage: gradientPreviews[gradient],
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
};