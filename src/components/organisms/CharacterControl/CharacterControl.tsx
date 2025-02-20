"use client";
import React, { useCallback } from "react";
import { VaporwaverSettings } from "@/app/types/vaporwaver";
import { Card } from "@/components/ui/card";
import { ControlGroup } from "@/components/molecules/ControlGroup/ControlGroup";
import { FileInput } from "@/components/molecules/FileInput/FileInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GradientSwatch } from "@/components/atoms/GradientSwatch";
import { gradients } from "@/lib/gradientPreview";
import { Loader2, Upload, Zap, Move, Rotate3D, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";

interface CharacterControlsProps {
  settings: VaporwaverSettings;
  onFileChange: (file: File) => void;
  isLoading: boolean;
  onDragStateChange: (dragging: boolean) => void;
}

export const CharacterControls: React.FC<CharacterControlsProps> = ({
  settings,
  onFileChange,
  isLoading,
  onDragStateChange,
}) => {
  const { setSettings } = useStore();

  const updateSetting = useCallback(
    (
      key: keyof VaporwaverSettings,
      value: VaporwaverSettings[keyof VaporwaverSettings]
    ) => {
      setSettings({ [key]: value });
    },
    [setSettings]
  );

  const handleGradientChange = useCallback(
    (value: string) => {
      updateSetting("characterGradient", value);
    },
    [updateSetting]
  );

  return (
    <Card className="h-full bg-black/40 backdrop-blur-xl border-purple-500/20 rounded-xl overflow-hidden relative">
      {/* Ambient glow effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

      {/* Main content - blur when loading */}
      <div
        className={`relative z-10 p-6 space-y-8 h-full overflow-y-auto gradient-scroll transition-all duration-300 ${
          isLoading ? "blur-sm filter-saturate-50" : ""
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-200">
            Character
          </h2>
          <span className="ml-1 text-xs font-normal text-purple-400/80">
            * = Applied via API
          </span>
        </div>

        <section className="space-y-6">
          {/* Character Upload - always enabled */}
          <div className="p-4 bg-black/30 rounded-lg border border-purple-500/20">
            <div className="flex items-center space-x-2 mb-3">
              <Upload className="w-4 h-4 text-purple-300" />
              <h3 className="text-base font-semibold text-purple-100">
                Upload Character
              </h3>
            </div>
            <FileInput
              label="Character Image"
              onChange={onFileChange}
              colorScheme="purple"
            />
          </div>

          {/* Position & Scale - disabled if no character */}
          <div
            className={`p-4 bg-black/30 rounded-lg border border-purple-500/20 ${
              !settings.characterPath ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Move className="w-4 h-4 text-purple-300" />
              <h3 className="text-base font-semibold text-purple-100">
                Position & Scale
              </h3>
              {!settings.characterPath && (
                <div className="ml-auto text-purple-300 text-xs flex items-center">
                  <span className="bg-purple-800/50 px-2 py-0.5 rounded text-purple-200">
                    Upload image first
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <ControlGroup
                  label="Position X"
                  value={settings.characterXPos}
                  min={-100}
                  max={100}
                  onChange={(value) => updateSetting("characterXPos", value)}
                  step={1}
                  onDragStateChange={onDragStateChange}
                  colorScheme="purple"
                  disabled={!settings.characterPath}
                />
                <ControlGroup
                  label="Scale"
                  value={settings.characterScale}
                  min={1}
                  max={200}
                  onChange={(value) => updateSetting("characterScale", value)}
                  unit="%"
                  step={1}
                  onDragStateChange={onDragStateChange}
                  colorScheme="purple"
                  disabled={!settings.characterPath}
                />
              </div>
              <div className="space-y-4">
                <ControlGroup
                  label="Position Y"
                  value={settings.characterYPos}
                  min={-100}
                  max={100}
                  onChange={(value) => updateSetting("characterYPos", value)}
                  step={1}
                  onDragStateChange={onDragStateChange}
                  colorScheme="purple"
                  disabled={!settings.characterPath}
                />
                <ControlGroup
                  label="Rotation"
                  value={settings.characterRotate}
                  min={-360}
                  max={360}
                  onChange={(value) => updateSetting("characterRotate", value)}
                  unit="°"
                  step={1}
                  onDragStateChange={onDragStateChange}
                  colorScheme="purple"
                  disabled={!settings.characterPath}
                />
              </div>
            </div>
          </div>

          {/* Glitch Effects - disabled if no character */}
          <div
            className={`p-4 bg-black/30 rounded-lg border border-purple-500/20 ${
              !settings.characterPath ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-4 h-4 text-purple-300" />
              <h3 className="text-base font-semibold text-purple-100">
                Glitch Effects
              </h3>
              <span className="ml-1 text-xs text-purple-400">*</span>
              {!settings.characterPath && (
                <div className="ml-auto text-purple-300 text-xs flex items-center">
                  <span className="bg-purple-800/50 px-2 py-0.5 rounded text-purple-200">
                    Upload image first
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ControlGroup
                label="Glitch"
                value={settings.characterGlitch}
                min={0.1}
                max={10}
                step={0.1}
                onChange={(value) => updateSetting("characterGlitch", value)}
                onDragStateChange={onDragStateChange}
                isEffectControl={true}
                colorScheme="purple"
                disabled={!settings.characterPath}
              />
              <ControlGroup
                label="Seed"
                value={settings.characterGlitchSeed}
                min={0}
                max={100}
                onChange={(value) =>
                  updateSetting("characterGlitchSeed", value)
                }
                step={1}
                onDragStateChange={onDragStateChange}
                isEffectControl={true}
                colorScheme="purple"
                disabled={!settings.characterPath}
              />
            </div>
          </div>

          {/* Gradient - disabled if no character */}
          <div
            className={`p-4 bg-black/30 rounded-lg border border-purple-500/20 ${
              !settings.characterPath ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Rotate3D className="w-4 h-4 text-purple-300" />
              <h3 className="text-base font-semibold text-purple-100">
                Gradient
              </h3>
              <span className="ml-1 text-xs text-purple-400">*</span>
              {!settings.characterPath && (
                <div className="ml-auto text-purple-300 text-xs flex items-center">
                  <span className="bg-purple-800/50 px-2 py-0.5 rounded text-purple-200">
                    Upload image first
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label
                className={`text-gray-200 ${
                  !settings.characterPath ? "opacity-50" : ""
                }`}
              >
                Select Gradient
              </Label>
              <Select
                value={settings.characterGradient}
                onValueChange={handleGradientChange}
                disabled={!settings.characterPath}
                aria-label="Select gradient style"
              >
                <SelectTrigger
                  className={`bg-black/50 border-purple-500/50 text-gray-200 ${
                    !settings.characterPath
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  aria-label="Open gradient selection"
                >
                  <SelectValue placeholder="Select gradient" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-md border-purple-500/50 max-h-60">
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {gradients.map((gradient) => (
                      <SelectItem
                        key={gradient}
                        value={gradient}
                        className="text-gray-200 flex items-center gap-2 bg-transparent hover:bg-purple-500/20 rounded px-2 py-1"
                      >
                        <GradientSwatch gradient={gradient} />
                        <span className="truncate">
                          {gradient.charAt(0).toUpperCase() + gradient.slice(1)}
                        </span>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>

      {/* Loading overlay with centered loader that doesn't blur */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-md">
          <div className="bg-black/80 rounded-xl p-6 shadow-2xl border border-purple-500/40 backdrop-blur-none">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-purple-500/20 blur-md animate-pulse-slow"></div>
                <Loader2 className="w-10 h-10 animate-spin text-purple-400 relative z-10" />
              </div>
              <p className="text-purple-200 text-sm font-medium">
                Applying effects...
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
