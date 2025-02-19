import React, { useCallback, useEffect, useRef, useState } from "react";
import { VaporwaverSettings } from "@/app/types/vaporwaver";
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
import { FileInput } from "@/components/molecules/FileInput/FileInput";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useAssets } from "@/hooks/use-assets";

// Mapping des gradients avec un aperçu de couleur
const gradientPreviews: { [key: string]: string } = {
  none: "none",
  autumn: "linear-gradient(to right, #ff0000, #ffff00)",
  bone: "linear-gradient(to right, #2e2e2e, #d9d9d9)",
  jet: "linear-gradient(to right, #00007F, #007FFF, #7FFF7F, #FF7F00, #7F0000)",
  winter: "linear-gradient(to right, black, red, yellow, white)",
  rainbow:
    "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)",
  ocean: "linear-gradient(to right, #012, #036, #05a, #09e)",
  summer: "linear-gradient(to right, #008000, #00ff00)",
  spring: "linear-gradient(to right, #00ffff, #ff00ff)",
  cool: "linear-gradient(to right, #ff00ff, #ffff00)",
  hsv: "linear-gradient(to right, red, yellow, green, cyan, blue, magenta, red)",
  pink: "linear-gradient(to right, #ffc0cb, #ff69b4)",
  hot: "linear-gradient(to right, #0000ff, #00ffff)",
  parula: "linear-gradient(to right, #00449e, #0082c8, #f0d430, #f0e130)",
  magma:
    "linear-gradient(to right, #000004, #3b0f70, #8c2981, #de4968, #fdbb84)",
  inferno:
    "linear-gradient(to right, #000004, #420a68, #932667, #dd513a, #fca50a)",
  plasma:
    "linear-gradient(to right, #0d0887, #6a00a8, #cb4679, #f89441, #f0f921)",
  viridis: "linear-gradient(to right, #440154, #31688e, #35b779, #fde725)",
  cividis: "linear-gradient(to right, #00204c, #005078, #7bb28f, #fcffa4)",
  deepgreen:
    "linear-gradient(to right, #001a00, #004d00, #008000, #00b300, #00e600)",
};

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

// Controls that trigger API effects
const EFFECT_CONTROLS = [
  "characterGlitch",
  "characterGlitchSeed",
  "characterGradient",
];

interface ControlPanelProps {
  settings: VaporwaverSettings;
  onSettingsChange: (settings: Partial<VaporwaverSettings>) => void;
  onFileChange: (file: File) => void;
  isLoading: boolean;
  onDragStateChange: (dragging: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onFileChange,
  onDragStateChange,
  isLoading,
}) => {
  const { data: assets, isLoading: assetsLoading } = useAssets();
  const [scrollInfo, setScrollInfo] = useState({
    canScrollUp: false,
    canScrollDown: false,
  });
  const [anyControlDragging, setAnyControlDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { settings, setSettings } = useStore();

  const checkScrollPosition = useCallback(() => {
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
  }, []);

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;

    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  const updateSettings = useCallback(
    (
      key: keyof VaporwaverSettings,
      value: VaporwaverSettings[keyof VaporwaverSettings]
    ) => {
      setSettings({ [key]: value });
    },
    [setSettings]
  );

  const handleDragStateChange = useCallback(
    (dragging: boolean) => {
      setAnyControlDragging(dragging);
      onDragStateChange(dragging);
    },
    [onDragStateChange]
  );

  // Check if a control affects effects
  const isEffectRelated = useCallback((control: string): boolean => {
    return EFFECT_CONTROLS.includes(control);
  }, []);

  // Handle gradient selection change
  const handleGradientChange = useCallback(
    (value: string) => {
      updateSettings("characterGradient", value);
    },
    [updateSettings]
  );

  return (
    <Card className="bg-black/30 backdrop-blur-xl border-purple-500/20 p-4 relative">
      {/* Scroll indicators */}
      {scrollInfo.canScrollUp && (
        <>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-purple-400/70 animate-bounce-subtle">
            <ChevronUp className="w-5 h-5" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-10" />
        </>
      )}

      {/* Main container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="space-y-6 h-[595px] overflow-y-auto no-scrollbar"
      >
        {/* Loading overlay */}
        {isLoading && !anyControlDragging && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-purple-200 text-sm font-medium">
                Applying effects...
              </p>
            </div>
          </div>
        )}

        {assetsLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="text-purple-500 text-sm font-medium ml-3">
              Loading assets...
            </span>
          </div>
        )}
        {!assetsLoading && assets && (
          <>
            {/* Background */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300">
                Background
              </h3>
              <ImageSelector
                label="Background Image"
                options={assets.backgrounds}
                value={settings.background}
                onChange={(value) => setSettings({ background: value })}
              />
            </section>

            {/* Character */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300">
                Character
                <span className="ml-2 text-xs font-normal text-purple-400/80">
                  * = Applied via API
                </span>
              </h3>
              <div className="space-y-4">
                <FileInput label="Character Image" onChange={onFileChange} />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <ControlGroup
                      label="Position X"
                      value={settings.characterXPos}
                      min={-100}
                      max={100}
                      onChange={(value) =>
                        updateSettings("characterXPos", value)
                      }
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                    <ControlGroup
                      label="Scale"
                      value={settings.characterScale}
                      min={1}
                      max={200}
                      onChange={(value) =>
                        updateSettings("characterScale", value)
                      }
                      unit="%"
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                    <ControlGroup
                      label="Glitch"
                      value={settings.characterGlitch}
                      min={0.1}
                      max={10}
                      step={0.1}
                      onChange={(value) =>
                        updateSettings("characterGlitch", value)
                      }
                      onDragStateChange={handleDragStateChange}
                      isEffectControl={isEffectRelated("characterGlitch")}
                    />
                  </div>
                  <div className="space-y-3">
                    <ControlGroup
                      label="Position Y"
                      value={settings.characterYPos}
                      min={-100}
                      max={100}
                      onChange={(value) =>
                        updateSettings("characterYPos", value)
                      }
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                    <ControlGroup
                      label="Rotation"
                      value={settings.characterRotate}
                      min={-360}
                      max={360}
                      onChange={(value) =>
                        updateSettings("characterRotate", value)
                      }
                      unit="°"
                      step={1}
                      onDragStateChange={handleDragStateChange}
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
                      onDragStateChange={handleDragStateChange}
                      isEffectControl={isEffectRelated("characterGlitchSeed")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">
                    Gradient
                    <span className="ml-1 text-purple-400 text-xs">*</span>
                  </Label>
                  <Select
                    value={settings.characterGradient}
                    onValueChange={handleGradientChange}
                  >
                    <SelectTrigger className="bg-black/50 border-purple-500/50 text-gray-200">
                      <SelectValue placeholder="Select gradient" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-md border-purple-500/50">
                      {gradients.map((gradient) => (
                        <SelectItem
                          key={gradient}
                          value={gradient}
                          className="text-gray-200 flex items-center gap-2 bg-transparent hover:bg-transparent"
                        >
                          {/* Swatch de couleur */}
                          {gradient !== "none" && (
                            <span
                              className="inline-block w-5 h-5 rounded-full mr-2"
                              style={{
                                backgroundImage: gradientPreviews[gradient],
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
                          )}
                          <span>
                            {gradient.charAt(0).toUpperCase() +
                              gradient.slice(1)}
                          </span>
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
                  onChange={(value) => setSettings({ misc: value })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <ControlGroup
                      label="Position X"
                      value={settings.miscPosX}
                      min={-100}
                      max={100}
                      onChange={(value) => updateSettings("miscPosX", value)}
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                    <ControlGroup
                      label="Scale"
                      value={settings.miscScale}
                      min={1}
                      max={200}
                      onChange={(value) => updateSettings("miscScale", value)}
                      unit="%"
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                  </div>
                  <div className="space-y-3">
                    <ControlGroup
                      label="Position Y"
                      value={settings.miscPosY}
                      min={-100}
                      max={100}
                      onChange={(value) => updateSettings("miscPosY", value)}
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                    <ControlGroup
                      label="Rotation"
                      value={settings.miscRotate}
                      min={-360}
                      max={360}
                      onChange={(value) => updateSettings("miscRotate", value)}
                      unit="°"
                      step={1}
                      onDragStateChange={handleDragStateChange}
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
                  onCheckedChange={(checked) => setSettings({ crt: checked })}
                />
                <Label className="text-gray-200">CRT Effect</Label>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Bottom scroll indicator */}
      {scrollInfo.canScrollDown && (
        <>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-purple-400/70 animate-bounce-subtle">
            <ChevronDown className="w-5 h-5" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />
        </>
      )}
    </Card>
  );
};
