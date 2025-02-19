"use client";
import React, { useCallback, useRef, useState, useMemo } from "react";
import { VaporwaverSettings } from "@/app/types/vaporwaver";

import { FinalPreviewModal } from "@/components/molecules/FinalPreviewModal";
import {
  CanvasLayer,
  LoadingOverlay,
  TransformedImageLayer,
} from "@/components/atoms";
import { Button } from "@/components/ui/button";

import { useCharacterStorage } from "@/hooks/use-character-storage";
import { useImageDimensions } from "@/hooks/use-image-dimensions";
import { useGenerate } from "@/hooks/use-generate";

import { blobToBase64 } from "@/lib/base64";
import { cn } from "@/lib/utils";

interface PreviewCardProps {
  className?: string;
  backgroundUrl?: string;
  characterUrl?: string | null;
  miscUrl?: string;
  settings: VaporwaverSettings;
  crt: boolean;
  effectPreviewUrl?: string | null;
  isEffectLoading?: boolean;
}

const CANVAS_WIDTH = 460;
const CANVAS_HEIGHT = 595;

export const PreviewCard: React.FC<PreviewCardProps> = ({
  className,
  backgroundUrl = "/backgrounds/default.png",
  characterUrl,
  miscUrl,
  settings,
  crt,
  effectPreviewUrl,
  isEffectLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { getStoredCharacter } = useCharacterStorage();
  const [modalOpen, setModalOpen] = useState(false);
  const [finalModalImageUrl, setFinalModalImageUrl] = useState<string | null>(
    null
  );
  const generateMutation = useGenerate();

  // Dimensions naturelles (scale = 1)
  const naturalCharacter = useImageDimensions(characterUrl ?? "", 1);
  const naturalMisc = useImageDimensions(
    miscUrl && miscUrl !== "/miscs/none.png" ? miscUrl : null,
    1
  );

  const characterPosition = useMemo(() => {
    if (!naturalCharacter) return { left: 0, top: 0 };
    return {
      left:
        (CANVAS_WIDTH * settings.characterXPos) / 100 -
        naturalCharacter.naturalWidth / 2,
      top:
        (CANVAS_HEIGHT * settings.characterYPos) / 100 -
        naturalCharacter.naturalHeight / 2,
    };
  }, [settings.characterXPos, settings.characterYPos, naturalCharacter]);

  // Pour le misc, l'ancrage est NW
  const miscPosition = useMemo(() => {
    return {
      left: (CANVAS_WIDTH * settings.miscPosX) / 100,
      top: (CANVAS_HEIGHT * settings.miscPosY) / 100,
    };
  }, [settings.miscPosX, settings.miscPosY]);

  const handleGenerateFinal = useCallback(async () => {
    if (!settings.characterPath) {
      alert("Please select a character image to generate a preview.");
      return;
    }
    let processedBase64: string | null = null;
    if (effectPreviewUrl) {
      const res = await fetch(effectPreviewUrl);
      const blob = await res.blob();
      processedBase64 = await blobToBase64(blob);
    } else {
      processedBase64 = getStoredCharacter();
    }
    if (!processedBase64)
      throw new Error("No processed character data available");

    generateMutation.mutate(
      {
        characterPathBase64: processedBase64,
        characterXPos: String(settings.characterXPos),
        characterYPos: String(settings.characterYPos),
        characterScale: String(settings.characterScale),
        characterRotate: String(settings.characterRotate),
        characterGlitch: String(0.1),
        characterGlitchSeed: String(0),
        characterGradient: "none",
        misc: settings.misc,
        miscPosX: String(settings.miscPosX),
        miscPosY: String(settings.miscPosY),
        miscScale: String(settings.miscScale),
        miscRotate: String(settings.miscRotate),
        background: settings.background,
        crt: settings.crt ? "true" : "",
      },
      {
        onSuccess: (blob) => {
          const finalUrl = URL.createObjectURL(blob);
          setFinalModalImageUrl(finalUrl);
          setModalOpen(true);
        },
        onError: (error: Error) => {
          console.error("Final generation error:", error);
          alert(error.message);
        },
      }
    );
  }, [settings, effectPreviewUrl, getStoredCharacter, generateMutation]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full lg:w-[460px] flex flex-col gap-4", className)}
    >
      <div className="h-[595px] relative rounded-lg overflow-hidden bg-black/40 shadow-xl">
        {/* Background Layer */}
        <CanvasLayer
          src={backgroundUrl}
          alt="Background"
          fill
          zIndex={0}
          style={{ objectFit: "cover" }}
        />

        {/* Misc Layer */}
        {miscUrl && miscUrl !== "/miscs/none.png" && naturalMisc && (
          <TransformedImageLayer
            src={miscUrl}
            alt="Misc"
            naturalWidth={naturalMisc.naturalWidth}
            naturalHeight={naturalMisc.naturalHeight}
            left={miscPosition.left}
            top={miscPosition.top}
            scale={settings.miscScale / 100}
            rotate={settings.miscRotate}
            zIndex={10}
            transformOrigin="top-left"
          />
        )}

        {/* Character Layer */}
        {characterUrl && naturalCharacter && (
          <>
            {isEffectLoading ? (
              <TransformedImageLayer
                src={characterUrl}
                alt="Character Preview"
                naturalWidth={naturalCharacter.naturalWidth}
                naturalHeight={naturalCharacter.naturalHeight}
                left={characterPosition.left}
                top={characterPosition.top}
                scale={settings.characterScale / 100}
                rotate={settings.characterRotate}
                zIndex={20}
              />
            ) : effectPreviewUrl ? (
              <TransformedImageLayer
                src={effectPreviewUrl}
                alt="Character with effects"
                naturalWidth={naturalCharacter.naturalWidth}
                naturalHeight={naturalCharacter.naturalHeight}
                left={characterPosition.left}
                top={characterPosition.top}
                scale={settings.characterScale / 100}
                rotate={settings.characterRotate}
                zIndex={20}
              />
            ) : (
              <TransformedImageLayer
                src={characterUrl}
                alt="Character"
                naturalWidth={naturalCharacter.naturalWidth}
                naturalHeight={naturalCharacter.naturalHeight}
                left={characterPosition.left}
                top={characterPosition.top}
                scale={settings.characterScale / 100}
                rotate={settings.characterRotate}
                zIndex={20}
              />
            )}
          </>
        )}

        {/* CRT Overlay */}
        {crt && (
          <CanvasLayer src="/crt.png" alt="CRT Effect" fill zIndex={30} />
        )}

        {/* Loading final generation */}
        {generateMutation.isPending && (
          <LoadingOverlay message="Generating final image..." />
        )}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6"
        onClick={handleGenerateFinal}
        disabled={generateMutation.isPending || !settings.characterPath}
      >
        {generateMutation.isPending ? "Generating..." : "Generate Preview"}
      </Button>

      {modalOpen && finalModalImageUrl && (
        <FinalPreviewModal
          imageUrl={finalModalImageUrl}
          onClose={() => {
            setModalOpen(false);
            URL.revokeObjectURL(finalModalImageUrl);
            setFinalModalImageUrl(null);
          }}
        />
      )}
    </div>
  );
};
