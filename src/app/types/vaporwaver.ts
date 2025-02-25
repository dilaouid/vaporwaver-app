import { GradientType } from "vaporwaver-ts";

// app/types/vaporwaver.ts
export interface VaporwaverSettings {
  characterPath: File | string;
  characterId?: string;
  background: string;
  misc: string;
  miscPosX: number;
  miscPosY: number;
  miscScale: number;
  miscRotate: number;
  characterXPos: number;
  characterYPos: number;
  characterScale: number;
  characterRotate: number;
  characterGlitch: number;
  characterGlitchSeed: number;
  characterGradient: GradientType;
  crt: boolean;
  miscAboveCharacter: boolean;
}

export interface ImageOption {
  id: string;
  name: string;
  thumbnail: string;
}

export interface PreviewGenerationResponse {
  previewUrl: string;
  error?: string;
}

export interface Assets {
  backgrounds: ImageOption[];
  miscs: ImageOption[];
}

export interface ImageDimensions {
  naturalWidth: number;
  naturalHeight: number;
  width: number;
  height: number;
}