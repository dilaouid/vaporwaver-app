import { create } from 'zustand';
import { VaporwaverSettings } from '@/app/types/vaporwaver';
import { FileService } from '@/services/fileService';

const initialSettings: VaporwaverSettings = {
    characterId: "",
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
    miscAboveCharacter: false
};

interface StoreState {
    settings: VaporwaverSettings;
    characterUrl: string | null;
    isRollbackInProgress: boolean;
    setSettings: (newSettings: Partial<VaporwaverSettings>) => void;
    setCharacterUrl: (url: string | null) => void;
    rollbackSettings: (settings: VaporwaverSettings) => void;
    resetCharacter: () => void;
    fileService: FileService;
}

export const useStore = create<StoreState>((set) => ({
    settings: initialSettings,
    fileService: FileService.getInstance(),
    characterUrl: null,
    isRollbackInProgress: false,
    setSettings: (newSettings: Partial<VaporwaverSettings>) =>
        set((state) => ({
            settings: { ...state.settings, ...newSettings },
            isRollbackInProgress: false
        })),
    setCharacterUrl: (url: string | null) => set({ characterUrl: url }),
    rollbackSettings: (settings: VaporwaverSettings) =>
        set(() => ({
            settings,
            isRollbackInProgress: true
        })),
    resetCharacter: () =>
        set(() => ({
            characterUrl: null,
            settings: {
                ...initialSettings,
                background: "default",
                misc: "none",
                miscPosX: 0,
                miscPosY: 0,
                miscScale: 100,
                miscRotate: 0,
            }
        })),
}));