"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { VaporwaverSettings } from "@/app/types/vaporwaver";
import { Github } from "lucide-react";
import { useEffectsPreview } from "@/hooks/use-effects-preview";
import { useCharacterStorage } from "@/hooks/use-character-storage";
import FinalPreviewModal from "@/components/molecules/FinalPreviewModal/FinalPreviewModal";
import { AnimatedTitle } from "@/components/molecules/AnimatedTitle/AnimateTitle";
import { PreviewCard } from "@/components/molecules/PreviewCard/PreviewCard";
import { ControlPanel } from "@/components/organisms/ControlPanel/ControlPanel";

const initialSettings: VaporwaverSettings = {
  characterPath: "",
  background: "default",
  misc: "none",
  miscPosX: 0,
  miscPosY: 0,
  miscScale: 100,
  miscRotate: 0,
  characterXPos: 0,
  characterYPos: 0,
  characterScale: 100,
  characterRotate: 0,
  characterGlitch: 0.1,
  characterGlitchSeed: 0,
  characterGradient: "none",
  crt: false,
};

export default function Home() {
  const [settings, setSettings] = useState<VaporwaverSettings>(initialSettings);
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const { storeCharacter } = useCharacterStorage();

  const { isLoading: effectsLoading, previewImage } = useEffectsPreview(settings, isDragging);

  const backgroundUrl = useMemo(() => `/backgrounds/${settings.background}.png`, [settings.background]);
  const miscUrl = useMemo(() => (settings.misc !== "none" ? `/miscs/${settings.misc}.png` : undefined), [settings.misc]);

  const handleSettingsChange = useCallback((newSettings: Partial<VaporwaverSettings>) => {
    setSettings((prev) => {
      const hasChanges = Object.entries(newSettings).some(
        ([key, value]) => prev[key as keyof VaporwaverSettings] !== value
      );
      return hasChanges ? { ...prev, ...newSettings } : prev;
    });
  }, []);

  const handleDragStateChange = useCallback((dragging: boolean) => {
    setIsDragging(dragging);
  }, []);

  const handleFileChange = useCallback(async (file: File) => {
    if (characterUrl) {
      URL.revokeObjectURL(characterUrl);
    }
    await storeCharacter(file);
    const url = URL.createObjectURL(file);
    setCharacterUrl(url);
    handleSettingsChange({ characterPath: file });
  }, [characterUrl, storeCharacter, handleSettingsChange]);

  // Clear localStorage au chargement
  useEffect(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    return () => {
      if (characterUrl) {
        URL.revokeObjectURL(characterUrl);
      }
    };
  }, [characterUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900">
      <main className="container mx-auto px-4 py-8">
        <AnimatedTitle />
        {modalOpen && modalImageUrl && (
          <FinalPreviewModal
            imageUrl={modalImageUrl}
            onClose={() => {
              setModalOpen(false);
              URL.revokeObjectURL(modalImageUrl);
              setModalImageUrl(null);
            }}
          />
        )}
        <div className="flex flex-col lg:flex-row justify-center gap-4 mt-8">
          <PreviewCard
            backgroundUrl={backgroundUrl}
            characterUrl={characterUrl}
            miscUrl={miscUrl}
            settings={settings}
            crt={settings.crt}
            effectPreviewUrl={previewImage}
            isEffectLoading={effectsLoading && !isDragging}
          />
          <div className="w-full lg:w-[380px]">
            <ControlPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onFileChange={handleFileChange}
              isLoading={effectsLoading && !isDragging}
              onDragStateChange={handleDragStateChange}
            />
          </div>
        </div>
        <footer className="text-center mt-8">
          <a
            href="https://github.com/dilaouid/vaporwaver"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
          >
            <Github className="w-4 h-4" />
            Source Code
          </a>
          <p className="text-gray-400 text-sm mt-2">
            Created by dilaouid • Powered by vaporwaver-ts
          </p>
        </footer>
      </main>
    </div>
  );
}