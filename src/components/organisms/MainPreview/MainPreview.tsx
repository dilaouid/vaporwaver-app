"use client";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { VaporwaverSettings } from "@/app/types/vaporwaver";
import { Button } from "@/components/ui/button";
import { FinalPreviewModal, /* FloatingThumbnail */ } from "@/components/molecules";
import { CanvasLayer, TransformedImageLayer } from "@/components/atoms";
import { useImageDimensions } from "@/hooks/use-image-dimensions";
import { useGenerate } from "@/hooks/use-generate";
import { useCharacterStorage } from "@/hooks/use-character-storage";
import { blobToBase64 } from "@/lib/base64";
import { Loader2 } from "lucide-react";

interface MainPreviewProps {
  backgroundUrl?: string;
  characterUrl?: string | null;
  miscUrl?: string;
  settings: VaporwaverSettings;
  crt: boolean;
  effectPreviewUrl?: string | null;
  isEffectLoading?: boolean;
  isModalOpen: boolean;
  modalImageUrl: string | null;
  onCloseModal: () => void;
  setModalOpen: (open: boolean) => void;
  setModalImageUrl: (url: string | null) => void;
}

const CANVAS_WIDTH = 460;
const CANVAS_HEIGHT = 595;

export const MainPreview: React.FC<MainPreviewProps> = ({
  backgroundUrl = "/backgrounds/default.png",
  characterUrl,
  miscUrl,
  settings,
  crt,
  effectPreviewUrl,
  isEffectLoading = false,
  isModalOpen,
  modalImageUrl,
  onCloseModal,
  setModalOpen,
  setModalImageUrl,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [displayedEffectUrl, setDisplayedEffectUrl] = useState<string | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getStoredCharacter } = useCharacterStorage();
  const generateMutation = useGenerate();

  // Natural dimensions (scale = 1)
  const naturalCharacter = useImageDimensions(characterUrl ?? "", 1);
  const naturalMisc = useImageDimensions(
    miscUrl && miscUrl !== "/miscs/none.png" ? miscUrl : null,
    1
  );

  // Scroll to preview function
  /* const scrollToPreview = useCallback(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []); */

  // Safely set and maintain loading state
  const setLoadingState = useCallback((isLoading: boolean) => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    if (isLoading) {
      setIsLoading(true);
    } else {
      // Minimum loading time of 500ms
      loadingTimerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, []);
  
  // Synchronize displayed effect with loading state
  useEffect(() => {
    if (effectPreviewUrl && effectPreviewUrl !== displayedEffectUrl) {
      setLoadingState(true);
      
      const img = new Image();
      img.onload = () => {
        setDisplayedEffectUrl(effectPreviewUrl);
        setThumbnailUrl(effectPreviewUrl);
        setLoadingState(false);
      };
      img.onerror = () => {
        console.error("Failed to load effect preview");
        setLoadingState(false);
      };
      img.src = effectPreviewUrl;
    }
  }, [effectPreviewUrl, displayedEffectUrl, setLoadingState]);

  // Update thumbnail when character changes
  useEffect(() => {
    if (characterUrl && !thumbnailUrl) {
      setThumbnailUrl(characterUrl);
    }
  }, [characterUrl, thumbnailUrl]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const characterPosition = React.useMemo(() => {
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

  // For misc, using center anchor
  const miscPosition = React.useMemo(() => {
    if (!naturalMisc) return { left: 0, top: 0 };
    return {
      left: (CANVAS_WIDTH * settings.miscPosX) / 100 - naturalMisc.naturalWidth / 2,
      top: (CANVAS_HEIGHT * settings.miscPosY) / 100 - naturalMisc.naturalHeight / 2,
    };
  }, [settings.miscPosX, settings.miscPosY, naturalMisc]);

  const handleGenerateFinal = useCallback(async () => {
    setLoadingState(true);
    
    if (!settings.characterPath) {
      alert("Please select a character image to generate a preview.");
      setLoadingState(false);
      return;
    }
    
    try {
      let processedBase64: string | null = null;
      
      // Get the right image source - either processed or original
      if (effectPreviewUrl) {
        try {
          const res = await fetch(effectPreviewUrl);
          if (!res.ok) throw new Error("Failed to fetch effect preview");
          const blob = await res.blob();
          processedBase64 = await blobToBase64(blob);
        } catch (error) {
          console.error("Error fetching effect preview:", error);
          // Fall back to stored character if effect fetch fails
          processedBase64 = getStoredCharacter();
        }
      } else {
        processedBase64 = getStoredCharacter();
      }
      
      if (!processedBase64) {
        throw new Error("No processed character data available");
      }

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
            setModalImageUrl(finalUrl);
            setThumbnailUrl(finalUrl);
            setModalOpen(true);
            setLoadingState(false);
          },
          onError: (error: Error) => {
            console.error("Final generation error:", error);
            alert(error.message);
            setLoadingState(false);
          },
        }
      );
    } catch (error) {
      console.error("Error preparing generation:", error);
      alert(error instanceof Error ? error.message : "Failed to prepare generation");
      setLoadingState(false);
    }
  }, [
    settings,
    effectPreviewUrl,
    getStoredCharacter,
    generateMutation,
    setModalImageUrl,
    setModalOpen,
    setLoadingState,
  ]);

  // Determine if we should show loading indicator
  const showLoading = isLoading || isEffectLoading || generateMutation.isPending;

  return (
    <>
      <div
        id="preview-container"
        ref={containerRef}
        className="flex flex-col items-center w-full max-w-[460px] select-none pointer-events-none"
      >
        <div className="preview-card-container relative w-full">
          {/* Preview Card with Pulse Effect */}
          <div className="preview-card-pulse absolute -inset-1 rounded-2xl animate-pulse-slow"></div>

          <div className="preview-card relative h-[595px] w-full rounded-2xl overflow-hidden bg-black/60 shadow-2xl border border-purple-500/30 backdrop-blur-sm z-10">
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
                rotate={-settings.miscRotate}
                zIndex={10}
                transformOrigin="center"
              />
            )}

            {/* Character Layer */}
            {characterUrl && naturalCharacter && (
              <>
                <TransformedImageLayer
                  src={displayedEffectUrl || characterUrl}
                  alt={displayedEffectUrl ? "Character with effects" : "Character"}
                  naturalWidth={naturalCharacter.naturalWidth}
                  naturalHeight={naturalCharacter.naturalHeight}
                  left={characterPosition.left}
                  top={characterPosition.top}
                  scale={settings.characterScale / 100}
                  rotate={-settings.characterRotate}
                  zIndex={20}
                />
              </>
            )}

            {/* CRT Overlay */}
            {crt && (
              <CanvasLayer src="/crt.png" alt="CRT Effect" fill zIndex={30} />
            )}

            {/* Retro scan line effect */}
            <div className="absolute inset-0 bg-scan-lines opacity-10 z-40 pointer-events-none"></div>

            {/* Overlay glitch effects */}
            <div className="absolute inset-0 glitch-overlay opacity-20 z-35 pointer-events-none"></div>

            {/* Loading overlay - Active during any loading state */}
            {showLoading && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-black/80 rounded-2xl p-6 shadow-2xl border border-purple-500/40">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-full bg-purple-500/20 blur-md animate-pulse-slow"></div>
                      <Loader2 className="w-12 h-12 animate-spin text-purple-400 relative z-10" />
                    </div>
                    <p className="text-purple-200 font-medium">
                      {generateMutation.isPending
                        ? "Generating final image..."
                        : "Applying effects..."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          className="generate-button relative mt-6 w-full max-w-[460px] bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-medium py-6 rounded-xl shadow-neon transition-all duration-300 overflow-hidden group"
          onClick={handleGenerateFinal}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          disabled={showLoading || !settings.characterPath}
        >
          <span className="relative z-10 flex items-center justify-center gap-3 text-lg tracking-wider">
            {showLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span className={`transition-transform duration-300 ${isButtonHovered ? 'scale-110' : ''}`}>
                  GENERATE PREVIEW
                </span>
              </>
            )}
          </span>
          <span className={`absolute inset-0 bg-gradient-to-r from-pink-500 to-cyan-500 opacity-0 transition-opacity duration-300 blur ${isButtonHovered ? 'opacity-100' : ''}`}></span>
        </Button>

        {isModalOpen && modalImageUrl && (
          <FinalPreviewModal imageUrl={modalImageUrl} onClose={onCloseModal} />
        )}
      </div>
    </>
  );
};