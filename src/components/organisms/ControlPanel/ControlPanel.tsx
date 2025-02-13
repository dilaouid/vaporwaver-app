import React, { useEffect, useRef, useState } from "react";
import { ImageOption, VaporwaverSettings } from "@/app/types/vaporwaver";
import { ImageSelector } from "@/components/molecules/ImageSelector/ImageSelector";
import { ControlGroup } from "@/components/molecules/ControlGroup/ControlGroup";

import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FileInput } from "@/components/molecules/FileInput/FileInput";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ControlPanelProps {
  settings: VaporwaverSettings;
  onSettingsChange: (settings: Partial<VaporwaverSettings>) => void;
  onFileChange: (file: File) => void;
}

interface ControlPanelProps {
  settings: VaporwaverSettings;
  onSettingsChange: (settings: Partial<VaporwaverSettings>) => void;
}

interface Assets {
  backgrounds: ImageOption[];
  miscs: ImageOption[];
}

const gradients = [
  "none",
  "autumn",
  "bone",
  "jet",
  "winter",
  "rainbow",
  "ocean",
  "summer",
  "spring",
  "cool",
  "hsv",
  "pink",
  "hot",
  "parula",
  "magma",
  "inferno",
  "plasma",
  "viridis",
  "cividis",
  "deepgreen",
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  onSettingsChange,
  onFileChange
}) => {
  const [assets, setAssets] = useState<Assets>({
    backgrounds: [],
    miscs: [],
  });
  const [scrollInfo, setScrollInfo] = useState({
    canScrollUp: false,
    canScrollDown: false,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch("/api/assets");
        if (!response.ok) throw new Error("Failed to fetch assets");
        const data = await response.json();
        setAssets(data);
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to load image assets: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          variant: "destructive",
        });
      }
    };

    fetchAssets();
  }, [toast]);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const hasScrollRoom = scrollHeight > clientHeight;

      setScrollInfo({
        canScrollUp: scrollTop > 10,
        canScrollDown:
          hasScrollRoom && scrollTop < scrollHeight - clientHeight - 10,
      });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, []);

  const updateSettings = (
    key: keyof VaporwaverSettings,
    value: VaporwaverSettings[keyof VaporwaverSettings]
  ) => {
    onSettingsChange({ [key]: value });
  };

  const handleFileInputChange = (file: File) => {
    console.log(
      "ControlPanel: File change handler called with file:",
      file.name
    );
    onFileChange(file);
  };

  return (
    <Card className="bg-black/30 backdrop-blur-xl border-purple-500/20 p-4">
      {scrollInfo.canScrollUp && (
        <>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-purple-400/70 animate-bounce-subtle">
            <ChevronUp className="w-5 h-5" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-10" />
        </>
      )}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="space-y-6 h-[595px] overflow-y-auto no-scrollbar"
      >
        {/* Background */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300">Background</h3>
          <ImageSelector
            label="Background Image"
            options={assets.backgrounds}
            value={settings.background}
            onChange={(value) => onSettingsChange({ background: value })}
          />
        </section>

        {/* Character */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300">Character</h3>
          <div className="space-y-4">
            <FileInput
              label="Character Image"
              onChange={handleFileInputChange}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <ControlGroup
                  label="Position X"
                  value={settings.characterXPos}
                  min={-100}
                  max={100}
                  onChange={(value) => updateSettings("characterXPos", value)}
                  step={0.1}
                />
                <ControlGroup
                  label="Scale"
                  value={settings.characterScale}
                  min={1}
                  max={200}
                  onChange={(value) => updateSettings("characterScale", value)}
                  unit="%"
                  step={1}
                />
                <ControlGroup
                  label="Glitch"
                  value={settings.characterGlitch}
                  min={0.1}
                  max={10}
                  step={0.1}
                  onChange={(value) => updateSettings("characterGlitch", value)}
                />
              </div>
              <div className="space-y-3">
                <ControlGroup
                  label="Position Y"
                  value={settings.characterYPos}
                  min={-100}
                  max={100}
                  onChange={(value) => updateSettings("characterYPos", value)}
                  step={0.1}
                />
                <ControlGroup
                  label="Rotation"
                  value={settings.characterRotate}
                  min={-360}
                  max={360}
                  onChange={(value) => updateSettings("characterRotate", value)}
                  unit="°"
                  step={1}
                />
                <ControlGroup
                  label="Seed"
                  value={settings.characterGlitchSeed}
                  min={0}
                  max={100}
                  onChange={(value) =>
                    updateSettings("characterGlitchSeed", value)
                  }
                  step={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">Gradient</Label>
              <Select
                value={settings.characterGradient}
                onValueChange={(value) =>
                  updateSettings("characterGradient", value)
                }
              >
                <SelectTrigger className="bg-black/50 border-purple-500/50 text-gray-200">
                  <SelectValue placeholder="Select gradient" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-md border-purple-500/50">
                  {gradients.map((gradient) => (
                    <SelectItem
                      key={gradient}
                      value={gradient}
                      className="text-gray-200"
                    >
                      {gradient.charAt(0).toUpperCase() + gradient.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Misc Item */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">
            Misc Item
          </h3>
          <div className="space-y-4">
            <ImageSelector
              label="Misc Item"
              options={assets.miscs}
              value={settings.misc}
              onChange={(value) => onSettingsChange({ misc: value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <ControlGroup
                  label="Position X"
                  value={settings.miscPosX}
                  min={-100}
                  max={100}
                  onChange={(value) => updateSettings("miscPosX", value)}
                  step={0.1}
                />
                <ControlGroup
                  label="Scale"
                  value={settings.miscScale}
                  min={1}
                  max={200}
                  onChange={(value) => updateSettings("miscScale", value)}
                  unit="%"
                  step={1}
                />
              </div>
              <div className="space-y-3">
                <ControlGroup
                  label="Position Y"
                  value={settings.miscPosY}
                  min={-100}
                  max={100}
                  onChange={(value) => updateSettings("miscPosY", value)}
                  step={0.1}
                />
                <ControlGroup
                  label="Rotation"
                  value={settings.miscRotate}
                  min={-360}
                  max={360}
                  onChange={(value) => updateSettings("miscRotate", value)}
                  unit="°"
                  step={1}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Effects */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">
            Effects
          </h3>
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.crt}
              onCheckedChange={(checked) => onSettingsChange({ crt: checked })}
            />
            <Label className="text-gray-200">CRT Effect</Label>
          </div>
        </section>
        {/* Indicateur et dégradé du bas */}
        {scrollInfo.canScrollDown && (
          <>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-purple-400/70 animate-bounce-subtle">
              <ChevronDown className="w-5 h-5" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />
          </>
        )}
      </div>
    </Card>
  );
};
