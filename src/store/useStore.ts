import { create } from 'zustand';
import { VaporwaverSettings } from '@/app/types/vaporwaver';

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

interface StoreState {
    settings: VaporwaverSettings;
    characterUrl: string | null;
    setSettings: (newSettings: Partial<VaporwaverSettings>) => void;
    setCharacterUrl: (url: string | null) => void;
}

export const useStore = create<StoreState>((set) => ({
    settings: initialSettings,
    characterUrl: null,
    setSettings: (newSettings: Partial<VaporwaverSettings>) =>
        set((state) => ({
            settings: { ...state.settings, ...newSettings },
        })),
    setCharacterUrl: (url: string | null) => set({ characterUrl: url }),
}))