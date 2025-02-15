export type GradientType =
    | "none" | "autumn" | "bone" | "jet" | "winter" | "rainbow"
    | "ocean" | "summer" | "spring" | "cool" | "hsv" | "pink"
    | "hot" | "parula" | "magma" | "inferno" | "plasma"
    | "viridis" | "cividis" | "deepgreen";

export interface VaporwaverSettings {
    characterPath: string | File;
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