"use client";
import React, { useEffect, useState } from "react";
import { VaporwaverSettings } from "@/app/types/vaporwaver";
import { Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PreviewCard } from "@/components/molecules/PreviewCard/PreviewCard";
import { ControlPanel } from "@/components/organisms/ControlPanel/ControlPanel";
import { AnimatedTitle } from "@/components/molecules/AnimatedTitle/AnimateTitle";

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
  const [previewUrl, setPreviewUrl] = useState("/api/placeholder/460/595");
  const [isGenerating, setIsGenerating] = useState(false);
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSettingsChange = (newSettings: Partial<VaporwaverSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleGeneratePreview = async () => {
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

      if (!response.ok) throw new Error("Failed to generate preview");

      const data = await response.json();
      setPreviewUrl(data.previewUrl);

      toast({
        title: "Preview Generated",
        description: "Your vaporwave image has been generated successfully!",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: "An error occurred while generating the preview.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (file: File) => {
    console.log("New character file:", file); // Pour déboguer
    
    // Révoquer l'ancienne URL si elle existe
    if (characterUrl) {
      URL.revokeObjectURL(characterUrl);
    }

    // Créer une nouvelle URL pour le fichier
    const url = URL.createObjectURL(file);
    console.log("New character URL:", url); // Pour déboguer
    setCharacterUrl(url);
    handleSettingsChange({ characterPath: file });
  };

  // Nettoyer les URLs lors du démontage du composant
  useEffect(() => {
    return () => {
      console.log(characterUrl);

      if (characterUrl) {
        URL.revokeObjectURL(characterUrl);
      }
    };
  }, [characterUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900">
      <main className="container mx-auto px-4 py-8">
        <AnimatedTitle />

        <div className="flex justify-center gap-4 mt-8">
          <PreviewCard
            previewUrl={previewUrl}
            isGenerating={isGenerating}
            onGenerate={handleGeneratePreview}
            backgroundUrl={`/backgrounds/${settings.background}.png`}
            characterUrl={characterUrl}
            miscUrl={
              settings.misc !== "none"
                ? `/miscs/${settings.misc}.png`
                : undefined
            }
            settings={settings}
          />
          <div className="w-[380px]">
            <ControlPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onFileChange={handleFileChange}
            />
          </div>
        </div>

        <footer className="text-center mt-8">
          <a
            href="https://github.com/dilaouid/vaporwaver-ts"
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
