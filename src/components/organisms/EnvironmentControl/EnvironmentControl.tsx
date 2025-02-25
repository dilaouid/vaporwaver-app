"use client";
import React, { useCallback } from "react";
import { VaporwaverSettings } from "@/app/types/vaporwaver";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageSelector } from "@/components/molecules/ImageSelector/ImageSelector";
import { ControlGroup } from "@/components/molecules/ControlGroup/ControlGroup";
import { useAssets } from "@/hooks/use-assets";
import { Loader2, Mountain, Image as ImageIcon, Tv } from "lucide-react";

interface EnvironmentControlsProps {
  settings: VaporwaverSettings;
  setSettings: (settings: Partial<VaporwaverSettings>) => void;
  isLoading: boolean;
  onDragStateChange: (isDragging: boolean) => void;
}

export const EnvironmentControls: React.FC<EnvironmentControlsProps> = ({
  settings,
  setSettings,
  isLoading,
  onDragStateChange,
}) => {
  const { data: assets, isLoading: assetsLoading } = useAssets();

  const updateSetting = useCallback(
    (key: keyof VaporwaverSettings, value: VaporwaverSettings[keyof VaporwaverSettings]) => {
      setSettings({ [key]: value });
    },
    [setSettings]
  );

  if (assetsLoading) {
    return (
      <Card className="h-full flex items-center justify-center bg-black/40 backdrop-blur-xl border-cyan-500/20 rounded-xl overflow-hidden">
        <div className="flex flex-col items-center gap-3 text-cyan-300">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading assets...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-black/40 backdrop-blur-xl border-cyan-500/20 rounded-xl overflow-hidden relative">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      {/* Main content */}
      <div className={`relative z-10 p-6 space-y-8 h-full overflow-y-auto gradient-scroll transition-all duration-300 ${isLoading ? 'blur-sm' : ''}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Mountain className="w-5 h-5 text-cyan-300" />
          </div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-100">
            Environment
          </h2>
        </div>

        {assets && (
          <>
            {/* Background Section */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-cyan-300" />
                <h3 className="text-lg font-semibold text-cyan-100">Background</h3>
              </div>
              
              <div className="p-4 bg-black/30 rounded-lg border border-cyan-500/20">
                <ImageSelector
                  label="Background Image"
                  options={assets.backgrounds}
                  value={settings.background}
                  onChange={(value) => setSettings({ background: value })}
                  colorScheme="cyan"
                />
              </div>
            </section>

            {/* Misc Section */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-cyan-300" />
              <h3 className="text-lg font-semibold text-cyan-100">Misc Item</h3>
              </div>
              
              <div className="p-4 bg-black/30 rounded-lg border border-cyan-500/20">
              <ImageSelector
                label="Misc Item"
                options={assets.miscs}
                value={settings.misc}
                onChange={(value) => setSettings({ misc: value })}
                colorScheme="cyan"
              />
              
              <div className={`mt-4 grid grid-cols-2 gap-3 ${settings.misc === "none" ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="space-y-3">
                <ControlGroup
                  label="Position X"
                  value={settings.miscPosX}
                  min={-100}
                  max={100}
                  onChange={(value) => updateSetting("miscPosX", value)}
                  step={1}
                  onDragStateChange={onDragStateChange}
                  colorScheme="cyan"
                  disabled={settings.misc === "none"}
                />
                <ControlGroup
                  label="Scale"
                  value={settings.miscScale}
                  min={1}
                  max={200}
                  onChange={(value) => updateSetting("miscScale", value)}
                  unit="%"
                  step={1}
                  onDragStateChange={onDragStateChange}
                  colorScheme="cyan"
                  disabled={settings.misc === "none"}
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
                  onDragStateChange={onDragStateChange}
                  colorScheme="cyan"
                  disabled={settings.misc === "none"}
                />
                <ControlGroup
                  label="Rotation"
                  value={settings.miscRotate}
                  min={-360}
                  max={360}
                  onChange={(value) => updateSetting("miscRotate", value)}
                  unit="°"
                  step={1}
                  onDragStateChange={onDragStateChange}
                  colorScheme="cyan"
                  disabled={settings.misc === "none"}
                />
                </div>
              </div>

              <div className={`mt-4 flex items-center justify-between ${settings.misc === "none" ? "opacity-50 pointer-events-none" : ""}`}>
                <Label className="text-cyan-100">Above Character</Label>
                <Switch
                checked={settings.miscAboveCharacter}
                onCheckedChange={(checked) => updateSetting("miscAboveCharacter", checked)}
                className="data-[state=checked]:bg-cyan-500"
                disabled={settings.misc === "none"}
                />
              </div>
              </div>
            </section>

            {/* Effects Section */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Tv className="w-4 h-4 text-cyan-300" />
                <h3 className="text-lg font-semibold text-cyan-100">Effects</h3>
              </div>
              
              <div className="p-4 bg-black/30 rounded-lg border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <Label className="text-cyan-100 flex items-center gap-2">
                    <span className="crt-label relative">
                      CRT Effect
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></span>
                    </span>
                  </Label>
                  <Switch
                    checked={settings.crt}
                    onCheckedChange={(checked) => setSettings({ crt: checked })}
                    className="data-[state=checked]:bg-cyan-500"
                    id="crt-toggle"
                    aria-label="Toggle CRT effect"
                    role="switch"
                    aria-checked={settings.crt}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-md">
          <div className="bg-black/80 rounded-xl p-6 shadow-2xl border border-cyan-500/40 backdrop-blur-none">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-cyan-500/20 blur-md animate-pulse-slow"></div>
                <Loader2 className="w-10 h-10 animate-spin text-cyan-400 relative z-10" />
              </div>
              <p className="text-cyan-200 text-sm font-medium">Applying effects...</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};