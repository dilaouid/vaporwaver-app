import React, { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { VaporwaverSettings } from "@/app/types/vaporwaver";

interface PreviewCardProps {
  isGenerating: boolean;
  onGenerate: () => void;
  className?: string;
  backgroundUrl?: string;
  characterUrl?: string | null;
  miscUrl?: string;
  settings: VaporwaverSettings;
  crt: boolean;
  effectPreviewUrl?: string | null;
  isEffectLoading?: boolean;
}

interface ImageDimensions {
  naturalWidth: number;
  naturalHeight: number;
  width: number;
  height: number;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  isGenerating,
  onGenerate,
  className,
  backgroundUrl = "/backgrounds/default.png",
  characterUrl,
  miscUrl,
  settings,
  crt,
  effectPreviewUrl,
  isEffectLoading = false,
}) => {
  // Component state
  const containerRef = useRef<HTMLDivElement>(null);
  const [characterDimensions, setCharacterDimensions] =
    useState<ImageDimensions | null>(null);
  const [miscDimensions, setMiscDimensions] = useState<ImageDimensions | null>(
    null
  );

  // Canvas dimensions constants
  const CANVAS_WIDTH = 460;
  const CANVAS_HEIGHT = 595;

  // Determine if we need API preview based on effects settings
  const needsApiPreview = useMemo(
    () =>
      settings.characterGlitch > 0.1 || settings.characterGradient !== "none",
    [settings.characterGlitch, settings.characterGradient]
  );

  // Update character dimensions when URL or scale changes
  useEffect(() => {
    if (characterUrl) {
      const img = document.createElement("img");
      img.onload = () => {
        const scale = settings.characterScale / 100;
        setCharacterDimensions({
          naturalWidth: img.width,
          naturalHeight: img.height,
          width: img.width * scale,
          height: img.height * scale,
        });
      };
      img.src = characterUrl;
    }
  }, [characterUrl, settings.characterScale]);

  // Update misc dimensions when URL or scale changes
  useEffect(() => {
    if (miscUrl && miscUrl !== "/miscs/none.png") {
      const img = document.createElement("img");
      img.onload = () => {
        const scale = settings.miscScale / 100;
        setMiscDimensions({
          naturalWidth: img.width,
          naturalHeight: img.height,
          width: img.width * scale,
          height: img.height * scale,
        });
      };
      img.src = miscUrl;
    }
  }, [miscUrl, settings.miscScale]);

  // Helper function to calculate character position
  const calculateCharacterPosition = (
    xPos: number,
    yPos: number,
    dimensions: { width: number; height: number }
  ) => {
    return {
      left: (CANVAS_WIDTH * xPos) / 100 - dimensions.width / 2,
      top: (CANVAS_HEIGHT * yPos) / 100 - dimensions.height / 2,
    };
  };

  // Helper function to calculate misc position
  const calculateMiscPosition = (
    xPos: number,
    yPos: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (!miscDimensions) return { left: 0, top: 0 };
    return {
      left: (canvasWidth * xPos) / 100,
      top:  (canvasHeight * yPos) / 100,
    };  
  };

  return (
    <div className={cn("w-full lg:w-[460px] flex flex-col gap-4", className)}>
      <div
        ref={containerRef}
        className="h-[595px] relative rounded-lg overflow-hidden bg-black/40 shadow-xl"
      >
        {/* Background Layer */}
        <Image
          src={backgroundUrl}
          alt="Background"
          width={460}
          height={595}
          className="object-cover absolute inset-0"
          priority
        />

        {needsApiPreview ? (
          <>
            {/* Loading Indicator for Effects */}
            {isEffectLoading && (
              <div className="absolute top-4 right-4 z-50">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-600/20 backdrop-blur-sm border border-purple-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span className="text-sm font-medium text-purple-100">
                    Applying effects...
                  </span>
                </div>
              </div>
            )}

            {/* Misc Layer */}
            {miscUrl && miscUrl !== "/miscs/none.png" && miscDimensions && (
              <div
                className="absolute transition-all duration-200"
                style={{
                  left: calculateMiscPosition(
                    settings.miscPosX,
                    settings.miscPosY,
                    CANVAS_WIDTH,
                    CANVAS_HEIGHT
                  ).left,
                  top: calculateMiscPosition(
                    settings.miscPosX,
                    settings.miscPosY,
                    CANVAS_WIDTH,
                    CANVAS_HEIGHT
                  ).top,
                  width: miscDimensions.width * (settings.miscScale / 100),
                  height: miscDimensions.height * (settings.miscScale / 100),
                  transform: `rotate(${settings.miscRotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 10,
                }}
              >
                <img
                  src={miscUrl}
                  alt="Misc Item"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            {/* Ghost preview during loading */}
            {characterUrl && characterDimensions && isEffectLoading && (
              <div
                className="absolute transition-all duration-200 opacity-40"
                style={{
                  left: calculateCharacterPosition(
                    settings.characterXPos,
                    settings.characterYPos,
                    characterDimensions
                  ).left,
                  top: calculateCharacterPosition(
                    settings.characterXPos,
                    settings.characterYPos,
                    characterDimensions
                  ).top,
                  width: characterDimensions.width,
                  height: characterDimensions.height,
                  transform: `rotate(${settings.characterRotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 20,
                }}
              >
                <img
                  src={characterUrl}
                  alt="Character Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Effect Preview Image */}
            {effectPreviewUrl && characterDimensions && !isEffectLoading && (
              <div
                className="absolute transition-all duration-200"
                style={{
                  left: calculateCharacterPosition(
                    settings.characterXPos,
                    settings.characterYPos,
                    characterDimensions
                  ).left,
                  top: calculateCharacterPosition(
                    settings.characterXPos,
                    settings.characterYPos,
                    characterDimensions
                  ).top,
                  width: characterDimensions.width,
                  height: characterDimensions.height,
                  transform: `rotate(${settings.characterRotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 20,
                }}
              >
                <img
                  src={effectPreviewUrl}
                  alt="Character with effects"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </>
        ) : (
          // Real-time preview without effects
          <>
            {/* Misc Layer */}
            {miscUrl && miscUrl !== "/miscs/none.png" && miscDimensions && (
              <div
                className="absolute transition-all duration-200"
                style={{
                  left: calculateMiscPosition(
                    settings.miscPosX,
                    settings.miscPosY,
                    CANVAS_WIDTH,
                    CANVAS_HEIGHT
                  ).left,
                  top: calculateMiscPosition(
                    settings.miscPosX,
                    settings.miscPosY,
                    CANVAS_WIDTH,
                    CANVAS_HEIGHT
                  ).top,
                  width: miscDimensions.width * (settings.miscScale / 100),
                  height: miscDimensions.height * (settings.miscScale / 100),
                  transform: `rotate(${settings.miscRotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 10,
                }}
              >
                <img
                  src={miscUrl}
                  alt="Misc Item"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            {/* Character Layer */}
            {characterUrl && characterDimensions && (
              <div
                className="absolute transition-all duration-200"
                style={{
                  left: calculateCharacterPosition(
                    settings.characterXPos,
                    settings.characterYPos,
                    characterDimensions
                  ).left,
                  top: calculateCharacterPosition(
                    settings.characterXPos,
                    settings.characterYPos,
                    characterDimensions
                  ).top,
                  width: characterDimensions.width,
                  height: characterDimensions.height,
                  transform: `rotate(${settings.characterRotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 20,
                }}
              >
                <img
                  src={characterUrl}
                  alt="Character"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* CRT Effect always on top */}
        {crt && (
          <Image
            src="/crt.png"
            alt="CRT Effect"
            width={460}
            height={595}
            className="absolute inset-0 z-30 pointer-events-none mix-blend-overlay opacity-80"
            priority
          />
        )}

        {/* Loading state for final generation */}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-40">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
              <p className="text-purple-200 text-sm font-medium">
                Generating final image...
              </p>
            </div>
          </div>
        )}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Preview"}
      </Button>
    </div>
  );
};
