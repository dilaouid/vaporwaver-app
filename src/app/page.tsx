"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useStore } from "@/store/useStore";
import { useEffectsPreview } from "@/hooks/use-effects-preview";
import { useCharacterStorage } from "@/hooks/use-character-storage";
import {
  AnimatedTitle,
  PreviewCard,
  Footer,
  FinalPreviewModal,
} from "@/components/molecules";
import { ControlPanel } from "@/components/organisms";

export default function Home() {
  // États principaux
  const [isDragging, setIsDragging] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  // Hooks personnalisés
  const { settings, characterUrl, setSettings, setCharacterUrl } = useStore();
  const { storeCharacter } = useCharacterStorage();
  const { isLoading: effectsLoading, previewImage } = useEffectsPreview(
    settings,
    isDragging
  );

  // URL dérivées pour le background et le misc
  const backgroundUrl = useMemo(
    () => `/backgrounds/${settings.background}.png`,
    [settings.background]
  );
  const miscUrl = useMemo(
    () =>
      settings.misc !== "none" ? `/miscs/${settings.misc}.png` : undefined,
    [settings.misc]
  );

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
      setSettings({ characterPath: file });
    },
    [characterUrl, storeCharacter, setSettings, setCharacterUrl]
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900">
      <main className="container mx-auto px-4 py-8">
        <AnimatedTitle />

        { modalOpen && modalImageUrl && (
          <FinalPreviewModal
            imageUrl={modalImageUrl}
            onClose={() => {
              setModalOpen(false);
              URL.revokeObjectURL(modalImageUrl);
              setModalImageUrl(null);
            }}
          />
        ) }
  
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
              onSettingsChange={setSettings}
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