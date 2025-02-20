"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useEffectsPreview } from "@/hooks/use-effects-preview";
import { useCharacterStorage } from "@/hooks/use-character-storage";
import { AnimatedBackground } from "@/components/atoms";
import { Footer } from "@/components/molecules";
import { MainPreview, EnvironmentControls, CharacterControls } from "@/components/organisms";

export default function Home() {
  // Main states
  const [isDragging, setIsDragging] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  // Custom hooks
  const { settings, characterUrl, setSettings, setCharacterUrl } = useStore();
  const { storeCharacter } = useCharacterStorage();
  const { isLoading: effectsLoading, previewImage } = useEffectsPreview(
    settings,
    isDragging
  );

  // Derived URLs for background and misc
  const backgroundUrl = `/backgrounds/${settings.background}.png`;
  const miscUrl = settings.misc !== "none" ? `/miscs/${settings.misc}.png` : undefined;

  // Drag state handler
  const handleDragStateChange = useCallback((dragging: boolean) => {
    setIsDragging(dragging);
  }, []);

  // File change handler
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

  // Clean localStorage on mount
  useEffect(() => {
    localStorage.clear();
  }, []);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (characterUrl) {
        URL.revokeObjectURL(characterUrl);
      }
    };
  }, [characterUrl]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    if (modalImageUrl) {
      URL.revokeObjectURL(modalImageUrl);
      setModalImageUrl(null);
    }
  }, [modalImageUrl]);

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden relative">
      <AnimatedBackground />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 animate-gradient-x">
            VAPORWAVER
          </h1>
          <div className="flex flex-col items-center">
            <p className="text-cyan-200 text-base sm:text-lg">Transform your images into vaporwave aesthetics</p>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 my-2 rounded-full"></div>
            <p className="text-purple-300 text-xs sm:text-sm">A modern web interface for the vaporwaver-ts library</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[350px_auto_350px] gap-3 mt-8 max-w-[1280px] mx-auto">
          {/* Left column - Environment controls */}
          <div className="order-2 xl:order-1">
            <EnvironmentControls 
              settings={settings}
              setSettings={setSettings}
              isLoading={effectsLoading && !isDragging}
              onDragStateChange={handleDragStateChange}
            />
          </div>

          {/* Center column - Main preview */}
          <div className="order-1 xl:order-2 flex justify-center">
            <MainPreview
              backgroundUrl={backgroundUrl}
              characterUrl={characterUrl}
              miscUrl={miscUrl}
              settings={settings}
              crt={settings.crt}
              effectPreviewUrl={previewImage}
              isEffectLoading={effectsLoading && !isDragging}
              isModalOpen={modalOpen}
              modalImageUrl={modalImageUrl}
              onCloseModal={handleCloseModal}
              setModalOpen={setModalOpen}
              setModalImageUrl={setModalImageUrl}
            />
          </div>

          {/* Right column - Character controls */}
          <div className="order-3">
            <CharacterControls
              settings={settings}
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

