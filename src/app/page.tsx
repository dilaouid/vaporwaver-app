"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { VaporwaverSettings } from "@/app/types/vaporwaver";
import { Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PreviewCard } from "@/components/molecules/PreviewCard/PreviewCard";
import { ControlPanel } from "@/components/organisms/ControlPanel/ControlPanel";
import { AnimatedTitle } from "@/components/molecules/AnimatedTitle/AnimateTitle";
import { useEffectsPreview } from "@/hooks/use-effects-preview";
import { useCharacterStorage } from "@/hooks/use-character-storage";

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
  // Main state
  const [settings, setSettings] = useState<VaporwaverSettings>(initialSettings);
  const [, setGeneratedPreviewUrl] = useState("/api/placeholder/460/595");
  const [isGenerating, setIsGenerating] = useState(false);
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { toast } = useToast();
  const { storeCharacter, getCharacterUrl } = useCharacterStorage();

  // Effects preview hook
  const { 
    isLoading: effectsLoading, 
    previewImage
  } = useEffectsPreview(settings, isDragging);

  // Memoize background URL to prevent unnecessary re-renders
  const backgroundUrl = useMemo(() => 
    `/backgrounds/${settings.background}.png`,
    [settings.background]
  );

  // Memoize misc URL to prevent unnecessary re-renders
  const miscUrl = useMemo(() => 
    settings.misc !== "none" ? `/miscs/${settings.misc}.png` : undefined, 
    [settings.misc]
  );

  // Settings change handler with performance optimization
  const handleSettingsChange = useCallback((newSettings: Partial<VaporwaverSettings>) => {
    setSettings(prev => {
      // Only update if values actually changed
      const hasChanges = Object.entries(newSettings).some(
        ([key, value]) => prev[key as keyof VaporwaverSettings] !== value
      );
      
      return hasChanges ? { ...prev, ...newSettings } : prev;
    });
  }, []);

  // Handle drag state changes across the application
  const handleDragStateChange = useCallback((dragging: boolean) => {
    setIsDragging(dragging);
  }, []);

  // Generate final preview handler
  const handleGeneratePreview = useCallback(async () => {
    if (!settings.characterPath) {
      toast({
        title: "Character Required",
        description: "Please select a character image to generate a preview.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();

      // Add all settings to form data
      Object.entries(settings).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await fetch("/api/generate-preview", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to generate preview: ${response.status}`
        );
      }

      const data = await response.json();
      setGeneratedPreviewUrl(data.previewUrl);

      toast({
        title: "Preview Generated",
        description: "Your vaporwave image has been generated successfully!",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error 
          ? error.message 
          : "An error occurred while generating the preview.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [settings, toast]);

  // File change handler
  const handleFileChange = useCallback(async (file: File) => {
    if (characterUrl) {
      URL.revokeObjectURL(characterUrl);
    }
    // store the character in local storage
    await storeCharacter(file);
    const url = URL.createObjectURL(file);
    setCharacterUrl(url);
    handleSettingsChange({ characterPath: file });
  }, [characterUrl, storeCharacter, handleSettingsChange]);
  

  useEffect(() => {
    localStorage.clear();
  }, []);

  // Load stored character on component mount
  useEffect(() => {
    const storedCharacterUrl = getCharacterUrl();
    if (storedCharacterUrl) {
      setCharacterUrl(storedCharacterUrl);
    }
  }, [getCharacterUrl]);
  
  // Cleanup object URLs on unmount
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

        <div className="flex flex-col lg:flex-row justify-center gap-4 mt-8">
          <PreviewCard
            isGenerating={isGenerating}
            onGenerate={handleGeneratePreview}
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