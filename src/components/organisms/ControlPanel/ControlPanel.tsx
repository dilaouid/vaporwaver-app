"use client";
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
import { GradientSwatch } from "@/components/atoms/GradientSwatch";
import { gradients } from "@/lib/gradientPreview";
import { useAssets } from "@/hooks/use-assets";

interface ControlPanelProps {
  onFileChange: (file: File) => void;
  isLoading: boolean;
  onDragStateChange: (dragging: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onFileChange,
  isLoading,
  onDragStateChange,
}) => {
  const { settings, setSettings } = useStore();
  const { data: assets, isLoading: assetsLoading } = useAssets();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollInfo, setScrollInfo] = useState({ canScrollUp: false, canScrollDown: false });

  const checkScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setScrollInfo({
        canScrollUp: scrollTop > 10,
        canScrollDown: scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 10,
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
      if (container) container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  const updateSetting = useCallback(
    (key: keyof VaporwaverSettings, value: VaporwaverSettings[keyof VaporwaverSettings]) => {
      setSettings({ [key]: value });
    },
    [setSettings]
  );

  const handleDragStateChange = useCallback(
    (dragging: boolean) => {
      onDragStateChange(dragging);
    },
    [onDragStateChange]
  );

  const handleGradientChange = useCallback(
    (value: string) => {
      updateSetting("characterGradient", value);
    },
    [updateSetting]
  );

  return (
    <Card className="bg-black/30 backdrop-blur-xl border-purple-500/20 p-4 relative">
      {scrollInfo.canScrollUp && (
        <>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-purple-400/70 animate-bounce-subtle">
            <ChevronUp className="w-5 h-5" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-10" />
        </>
      )}

      <div ref={scrollContainerRef} className="space-y-6 h-[595px] overflow-y-auto no-scrollbar">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-purple-200 text-sm font-medium">Applying effects...</p>
            </div>
          </div>
        )}

        {assetsLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="text-purple-500 text-sm font-medium ml-3">Loading assets...</span>
          </div>
        )}

        {!assetsLoading && assets && (
          <>
            {/* Background Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300">Background</h3>
              <ImageSelector
                label="Background Image"
                options={assets.backgrounds}
                value={settings.background}
                onChange={(value) => setSettings({ background: value })}
              />
            </section>

            {/* Character Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300">
                Character <span className="ml-2 text-xs font-normal text-purple-400/80">* = Applied via API</span>
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
                      onChange={(value) => updateSetting("characterXPos", value)}
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                    <ControlGroup
                      label="Scale"
                      value={settings.characterScale}
                      min={1}
                      max={200}
                      onChange={(value) => updateSetting("characterScale", value)}
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
                      onChange={(value) => updateSetting("characterGlitch", value)}
                      onDragStateChange={handleDragStateChange}
                    />
                  </div>
                  <div className="space-y-3">
                    <ControlGroup
                      label="Position Y"
                      value={settings.characterYPos}
                      min={-100}
                      max={100}
                      onChange={(value) => updateSetting("characterYPos", value)}
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                    <ControlGroup
                      label="Rotation"
                      value={settings.characterRotate}
                      min={-360}
                      max={360}
                      onChange={(value) => updateSetting("characterRotate", value)}
                      unit="°"
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                    <ControlGroup
                      label="Seed"
                      value={settings.characterGlitchSeed}
                      min={0}
                      max={100}
                      onChange={(value) => updateSetting("characterGlitchSeed", value)}
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-200">
                    Gradient <span className="ml-1 text-purple-400 text-xs">*</span>
                  </Label>
                  <Select value={settings.characterGradient} onValueChange={handleGradientChange}>
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
                          <GradientSwatch gradient={gradient} />
                          <span>{gradient.charAt(0).toUpperCase() + gradient.slice(1)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Misc Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Misc Item</h3>
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
                      onChange={(value) => updateSetting("miscPosX", value)}
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                    <ControlGroup
                      label="Scale"
                      value={settings.miscScale}
                      min={1}
                      max={200}
                      onChange={(value) => updateSetting("miscScale", value)}
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
                      onChange={(value) => updateSetting("miscPosY", value)}
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                    <ControlGroup
                      label="Rotation"
                      value={settings.miscRotate}
                      min={-360}
                      max={360}
                      onChange={(value) => updateSetting("miscRotate", value)}
                      unit="°"
                      step={1}
                      onDragStateChange={handleDragStateChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Effects Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Effects</h3>
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