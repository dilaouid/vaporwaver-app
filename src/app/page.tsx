"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { VaporwaverSettings } from "@/app/types/vaporwaver";

import { useEffectsPreview } from "@/hooks/use-effects-preview";
import { useCharacterStorage } from "@/hooks/use-character-storage";
import { AnimatedTitle, PreviewCard, Footer, FinalPreviewModal } from "@/components/molecules";
import { ControlPanel } from "@/components/organisms";

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
  // États principaux
  const [settings, setSettings] = useState<VaporwaverSettings>(initialSettings);
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  // Hooks personnalisés
  const { storeCharacter } = useCharacterStorage();
  const { isLoading: effectsLoading, previewImage } = useEffectsPreview(settings, isDragging);

  // URL dérivées pour le background et le misc
  const backgroundUrl = useMemo(() => `/backgrounds/${settings.background}.png`, [settings.background]);
  const miscUrl = useMemo(
    () => (settings.misc !== "none" ? `/miscs/${settings.misc}.png` : undefined),
    [settings.misc]
  );

  // Handler pour mettre à jour les settings
  const handleSettingsChange = useCallback((newSettings: Partial<VaporwaverSettings>) => {
    setSettings((prev) => {
      const hasChanges = Object.entries(newSettings).some(
        ([key, value]) => prev[key as keyof VaporwaverSettings] !== value
      );
      return hasChanges ? { ...prev, ...newSettings } : prev;
    });
  }, []);

  // Handler pour le drag
  const handleDragStateChange = useCallback((dragging: boolean) => {
    setIsDragging(dragging);
  }, []);

  // Handler pour le changement de fichier
  const handleFileChange = useCallback(
    async (file: File) => {
      if (characterUrl) {
        URL.revokeObjectURL(characterUrl);
      }
      await storeCharacter(file);
      const url = URL.createObjectURL(file);
      setCharacterUrl(url);
      handleSettingsChange({ characterPath: file });
    },
    [characterUrl, storeCharacter, handleSettingsChange]
  );

  // Nettoyage du localStorage lors du montage
  useEffect(() => {
    localStorage.clear();
  }, []);

  // Nettoyage de l'URL d'objet au démontage
  useEffect(() => {
    return () => {
      if (characterUrl) {
        URL.revokeObjectURL(characterUrl);
      }
    };
  }, [characterUrl]);

  // Rendu de la modal finale
  const renderModal = () => {
    if (!modalOpen || !modalImageUrl) return null;
    return (
      <FinalPreviewModal
        imageUrl={modalImageUrl}
        onClose={() => {
          setModalOpen(false);
          URL.revokeObjectURL(modalImageUrl);
          setModalImageUrl(null);
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900">
      <main className="container mx-auto px-4 py-8">
        <AnimatedTitle />
        {renderModal()}
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
        <Footer />
      </main>
    </div>
  );
}