import { useState, useEffect, useRef } from 'react';
import { VaporwaverSettings } from '@/app/types/vaporwaver';
import { useCharacterStorage } from './use-character-storage';

export function useEffectsPreview(settings: VaporwaverSettings, isDragging: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { getStoredCharacter } = useCharacterStorage();
  const abortControllerRef = useRef<AbortController | null>(null);

  // On retient les derniers filtres appliqués
  const appliedEffectsRef = useRef({
    characterGlitch: settings.characterGlitch,
    characterGlitchSeed: settings.characterGlitchSeed,
    characterGradient: settings.characterGradient,
  });

  // On retient la dernière image base64 utilisée pour générer la preview
  const appliedBase64Ref = useRef<string | null>(null);

  const needsApiPreview =
    settings.characterGlitch !== 0.1 ||
    settings.characterGlitchSeed !== 0 ||
    settings.characterGradient !== 'none';

  useEffect(() => {
    if (isDragging) return;
    if (!needsApiPreview) return;

    const currentBase64 = getStoredCharacter();

    if (
      settings.characterGlitch === appliedEffectsRef.current.characterGlitch &&
      settings.characterGlitchSeed === appliedEffectsRef.current.characterGlitchSeed &&
      settings.characterGradient === appliedEffectsRef.current.characterGradient &&
      currentBase64 === appliedBase64Ref.current
    ) {
      return;
    }

    // Dès qu'un changement est détecté (fichier ou filtres), on freeze l'interface en affichant le loading
    setIsLoading(true);

    const handler = setTimeout(() => {
      const fetchEffectsPreview = async () => {
        // Si un appel est en cours, on l'annule
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        if (!currentBase64) {
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('characterGlitch', String(settings.characterGlitch));
        formData.append('characterGlitchSeed', String(settings.characterGlitchSeed));
        formData.append('characterGradient', settings.characterGradient);
        // Toujours envoyer l'image pure stockée en base64
        formData.append('characterPathBase64', currentBase64);

        try {
          const response = await fetch('/api/preview-effects', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          const blob = await response.blob();
          setPreviewImage((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
          // Mémoriser les filtres et le fichier actuellement utilisés
          appliedEffectsRef.current = {
            characterGlitch: settings.characterGlitch,
            characterGlitchSeed: settings.characterGlitchSeed,
            characterGradient: settings.characterGradient,
          };
          appliedBase64Ref.current = currentBase64;
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            console.error('Failed to fetch effect preview:', error);
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchEffectsPreview();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [
    isDragging,
    settings.characterGlitch,
    settings.characterGlitchSeed,
    settings.characterGradient,
    needsApiPreview,
    getStoredCharacter,
  ]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [previewImage]);

  return {
    isLoading,
    previewImage,
  };
}
