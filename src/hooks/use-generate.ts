import { useMutation } from "@tanstack/react-query";
import { objectToFormData } from "@/lib/objectToFormData";
import { GradientType } from "vaporwaver-ts";

interface GenerateParams {
    characterPathBase64: string;
    characterXPos: string;
    characterYPos: string;
    characterScale: string;
    characterRotate: string;
    characterGlitch: string;
    characterGlitchSeed: string;
    characterGradient: GradientType;
    misc: string;
    miscPosX: string;
    miscPosY: string;
    miscScale: string;
    miscRotate: string;
    background: string;
    crt?: string;
    miscAboveCharacter?: string;
}

export function useGenerate() {
    return useMutation<Blob, Error, GenerateParams>({
        mutationFn: async (params: GenerateParams) => {
            const formData = objectToFormData(params);
            const res = await fetch("/api/generate", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to generate preview: ${res.status}`);
            }
            return res.blob();
        },
    });
}
