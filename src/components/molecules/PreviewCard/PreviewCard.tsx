import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PreviewCardProps {
  previewUrl: string;
  isGenerating: boolean;
  onGenerate: () => void;
  className?: string;
  backgroundUrl?: string;
  characterUrl?: string | null;
  miscUrl?: string;
  settings: {
    characterXPos: number;
    characterYPos: number;
    characterScale: number;
    characterRotate: number;
    miscPosX: number;
    miscPosY: number;
    miscScale: number;
    miscRotate: number;
  };
  crt: boolean;
}

interface ImageDimensions {
  naturalWidth: number;
  naturalHeight: number;
  width: number;
  height: number;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  previewUrl,
  isGenerating,
  onGenerate,
  className,
  backgroundUrl = "/backgrounds/default.png",
  characterUrl,
  miscUrl,
  settings,
  crt,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [characterDimensions, setCharacterDimensions] =
    useState<ImageDimensions | null>(null);
  const [miscDimensions, setMiscDimensions] = useState<ImageDimensions | null>(
    null
  );

  const CANVAS_WIDTH = 460;
  const CANVAS_HEIGHT = 595;

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

  // Charger les dimensions du misc
  useEffect(() => {
    if (miscUrl && miscUrl !== "/miscs/none.png") {
      const img = document.createElement("img");
      img.onload = () => {
        const scale = settings.characterScale / 100;

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

  const calculateMiscPosition = (xPos: number, yPos: number) => {
    return {
      left: (CANVAS_WIDTH * xPos) / 100,
      top: (CANVAS_HEIGHT * yPos) / 100,
    };
  };

  return (
    <div className={cn("w-[460px] flex flex-col gap-4", className)}>
      <div
        ref={containerRef}
        className="h-[595px] relative rounded-lg overflow-hidden bg-black/40"
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

        {/* Character Layer */}
        {characterUrl && characterDimensions && (
          <div
            className="absolute"
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
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
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

        {/* Misc Layer */}
        {miscUrl && miscUrl !== "/miscs/none.png" && miscDimensions && (
          <div
            className="absolute"
            style={{
              left: calculateMiscPosition(settings.miscPosX, settings.miscPosY)
                .left,
              top: calculateMiscPosition(settings.miscPosX, settings.miscPosY)
                .top,
              width: miscDimensions.width,
              height: miscDimensions.height,
              transform: `rotate(${settings.miscRotate}deg)`,
              transformOrigin: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
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

        {crt && (
          <Image
            src="/crt.png"
            alt="CRT Effect"
            width={460}
            height={595}
            className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
            priority
          />
        )}

        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        )}
      </div>
      <Button
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Preview"}
      </Button>
    </div>
  );
};
