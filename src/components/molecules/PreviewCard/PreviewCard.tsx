"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { VaporwaverSettings } from "@/app/types/vaporwaver";
import { FinalPreviewModal } from "@/components/molecules/FinalPreviewModal";
import { useCharacterStorage } from "@/hooks/use-character-storage";
import { blobToBase64 } from "@/lib/base64";

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

interface ImageDimensions {
  naturalWidth: number;
  naturalHeight: number;
  width: number;
  height: number;
}

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
  const [characterDimensions, setCharacterDimensions] = useState<ImageDimensions | null>(null);
  const [miscDimensions, setMiscDimensions] = useState<ImageDimensions | null>(null);
  const [isFinalGenerating, setIsFinalGenerating] = useState(false);
  const [finalModalImageUrl, setFinalModalImageUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { getStoredCharacter } = useCharacterStorage();

  // Constantes du canvas
  const CANVAS_WIDTH = 460;
  const CANVAS_HEIGHT = 595;

  const needsApiPreview = useMemo(
    () =>
      settings.characterGlitch > 0.1 || settings.characterGradient !== "none",
    [settings.characterGlitch, settings.characterGradient]
  );

  // MàJ des dimensions du personnage
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

  // MàJ des dimensions du misc
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

  // Calcul de la position du personnage (anchor=center)
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

  // Calcul de la position du misc (anchor=NW)
  const calculateMiscPosition = (
    xPos: number,
    yPos: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (!miscDimensions) return { left: 0, top: 0 };
    return {
      left: (canvasWidth * xPos) / 100,
      top: (canvasHeight * yPos) / 100,
    };
  };

  // Fonction de génération finale
  const handleGenerateFinal = useCallback(async () => {
    if (!settings.characterPath) {
      alert("Please select a character image to generate a preview.");
      return;
    }
    setIsFinalGenerating(true);
    try {
      const formData = new FormData();
      let processedBase64: string | null = null;
  
      if (effectPreviewUrl) {
        const res = await fetch(effectPreviewUrl);
        const blob = await res.blob();
        processedBase64 = await blobToBase64(blob);
      } else {
        processedBase64 = getStoredCharacter();
      }
      if (!processedBase64) {
        throw new Error("No processed character data available");
      }
      formData.append("characterPathBase64", processedBase64);
  
      // Envoyer les options de positionnement, scale, rotation...
      formData.append("characterXPos", String(settings.characterXPos));
      formData.append("characterYPos", String(settings.characterYPos));
      formData.append("characterScale", String(settings.characterScale));
      formData.append("characterRotate", String(settings.characterRotate));
  
      // On force les options d'effets à leurs valeurs par défaut (pas de glitch, gradient none)
      formData.append("characterGlitch", String(0.1));
      formData.append("characterGlitchSeed", String(0));
      formData.append("characterGradient", "none");
  
      // Envoyer misc et background
      formData.append("misc", settings.misc);
      formData.append("miscPosX", String(settings.miscPosX));
      formData.append("miscPosY", String(settings.miscPosY));
      formData.append("miscScale", String(settings.miscScale));
      formData.append("miscRotate", String(settings.miscRotate));
      formData.append("background", settings.background);
      if (settings.crt) {
        formData.append("crt", "true");
      }
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to generate preview: ${response.status}`);
      }
      const blob = await response.blob();
      const finalUrl = URL.createObjectURL(blob);
      setFinalModalImageUrl(finalUrl);
      setModalOpen(true);
    } catch (error) {
      console.error("Final generation error:", error);
      alert(error instanceof Error ? error.message : "An error occurred during final generation.");
    } finally {
      setIsFinalGenerating(false);
    }
  }, [settings, effectPreviewUrl, getStoredCharacter]);  

  return (
    <div className={cn("w-full lg:w-[460px] flex flex-col gap-4", className)}>
      <div ref={containerRef} className="h-[595px] relative rounded-lg overflow-hidden bg-black/40 shadow-xl">
        {/* Background Layer */}
        <Image src={backgroundUrl} alt="Background" width={460} height={595} className="object-cover absolute inset-0" priority />
        
        {needsApiPreview ? (
          <>
            {isEffectLoading && (
              <div className="absolute top-4 right-4 z-50">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-600/20 backdrop-blur-sm border border-purple-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span className="text-sm font-medium text-purple-100">Applying effects...</span>
                </div>
              </div>
            )}
            {miscUrl && miscUrl !== "/miscs/none.png" && miscDimensions && (
              <div
                className="absolute transition-all duration-200"
                style={{
                  left: calculateMiscPosition(settings.miscPosX, settings.miscPosY, CANVAS_WIDTH, CANVAS_HEIGHT).left,
                  top: calculateMiscPosition(settings.miscPosX, settings.miscPosY, CANVAS_WIDTH, CANVAS_HEIGHT).top,
                  width: miscDimensions.width * (settings.miscScale / 100),
                  height: miscDimensions.height * (settings.miscScale / 100),
                  transform: `rotate(${settings.miscRotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 10,
                }}
              >
                <Image src={miscUrl} alt="Misc Item" fill style={{ objectFit: "contain" }} />
              </div>
            )}
            {characterUrl && characterDimensions && isEffectLoading && (
              <div
                className="absolute transition-all duration-200 opacity-40"
                style={{
                  left: calculateCharacterPosition(settings.characterXPos, settings.characterYPos, characterDimensions).left,
                  top: calculateCharacterPosition(settings.characterXPos, settings.characterYPos, characterDimensions).top,
                  width: characterDimensions.width,
                  height: characterDimensions.height,
                  transform: `rotate(${settings.characterRotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 20,
                }}
              >
                <Image src={characterUrl} alt="Character Preview" fill style={{ objectFit: "contain" }} />
              </div>
            )}
            {effectPreviewUrl && characterDimensions && !isEffectLoading && (
              <div
                className="absolute transition-all duration-200"
                style={{
                  left: calculateCharacterPosition(settings.characterXPos, settings.characterYPos, characterDimensions).left,
                  top: calculateCharacterPosition(settings.characterXPos, settings.characterYPos, characterDimensions).top,
                  width: characterDimensions.width,
                  height: characterDimensions.height,
                  transform: `rotate(${settings.characterRotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 20,
                }}
              >
                <Image src={effectPreviewUrl} alt="Character with effects" fill style={{ objectFit: "contain" }} />
              </div>
            )}
          </>
        ) : (
          <>
            {miscUrl && miscUrl !== "/miscs/none.png" && miscDimensions && (
              <div
                className="absolute transition-all duration-200"
                style={{
                  left: calculateMiscPosition(settings.miscPosX, settings.miscPosY, CANVAS_WIDTH, CANVAS_HEIGHT).left,
                  top: calculateMiscPosition(settings.miscPosX, settings.miscPosY, CANVAS_WIDTH, CANVAS_HEIGHT).top,
                  width: miscDimensions.width * (settings.miscScale / 100),
                  height: miscDimensions.height * (settings.miscScale / 100),
                  transform: `rotate(${settings.miscRotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 10,
                }}
              >
                <Image src={miscUrl} alt="Misc Item" fill style={{ objectFit: "contain" }} />
              </div>
            )}
            {characterUrl && characterDimensions && (
              <div
                className="absolute transition-all duration-200"
                style={{
                  left: calculateCharacterPosition(settings.characterXPos, settings.characterYPos, characterDimensions).left,
                  top: calculateCharacterPosition(settings.characterXPos, settings.characterYPos, characterDimensions).top,
                  width: characterDimensions.width,
                  height: characterDimensions.height,
                  transform: `rotate(${settings.characterRotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 20,
                }}
              >
                <Image src={characterUrl} alt="Character" fill style={{ objectFit: "contain" }} />
              </div>
            )}
          </>
        )}

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

        {isFinalGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-40">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
              <p className="text-purple-200 text-sm font-medium">Generating final image...</p>
            </div>
          </div>
        )}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6"
        onClick={handleGenerateFinal}
        disabled={isFinalGenerating || !settings.characterPath}
      >
        {isFinalGenerating ? "Generating..." : "Generate Preview"}
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
