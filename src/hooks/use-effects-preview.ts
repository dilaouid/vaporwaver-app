import { useState, useEffect, useRef, useCallback } from 'react';
import { VaporwaverSettings } from '@/app/types/vaporwaver';
import { useCharacterStorage } from './use-character-storage';
import { VAPORWAVER_ERRORS } from '@/lib/errors';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export function useEffectsPreview(settings: VaporwaverSettings, isDragging: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { getStoredCharacter } = useCharacterStorage();
  const { rollbackSettings, isRollbackInProgress, resetCharacter } = useStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSuccessfulSettingsRef = useRef<VaporwaverSettings>(settings);
  const lastRequestTimeRef = useRef<number>(0);
  const [hasFetchedPreview, setHasFetchedPreview] = useState(false);

  const handleError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let toastMessage = "An unexpected error occurred";
    let description = "";

    if (errorMessage.includes("Invalid PNG")) {
      toastMessage = "Invalid Image Format";
      description = VAPORWAVER_ERRORS.INVALID_IMAGE;
      resetCharacter(); // Reset character on invalid image
    } else if (errorMessage.includes("Rate limit")) {
      toastMessage = "Too Many Requests";
      description = VAPORWAVER_ERRORS.RATE_LIMIT;
    } else if (errorMessage.includes("too large")) {
      toastMessage = "File Too Large";
      description = VAPORWAVER_ERRORS.FILE_TOO_LARGE;
      resetCharacter();
    }

    toast.error(toastMessage, {
      description,
      style: {
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff'
      }
    });

    rollbackSettings(lastSuccessfulSettingsRef.current);
    setIsLoading(false);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
    setHasFetchedPreview(true);
  }, [rollbackSettings, resetCharacter, previewImage]);

  const processApiResult = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setPreviewImage(prevUrl => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return url;
    });
    lastSuccessfulSettingsRef.current = settings;
    setIsLoading(false);
    setHasFetchedPreview(true);
  }, [settings]);

  const needsApiPreview = useCallback(() => {
    return settings.characterId && (
      settings.characterGlitch !== 0.1 ||
      settings.characterGlitchSeed !== 0 ||
      settings.characterGradient !== 'none'
    );
  }, [settings]);

  const fetchEffectsPreview = useCallback(async () => {
    if (hasFetchedPreview) return;

    const now = Date.now();
    if (now - lastRequestTimeRef.current < 300) {
      return;
    }
    lastRequestTimeRef.current = now;

    if (isRollbackInProgress) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Extraire l'ID du character des settings
    const characterId = settings.characterId;
    if (!characterId) {
      setIsLoading(false);
      return;
    }

    try {
      // Obtenir le character en base64
      const characterBase64 = await getStoredCharacter(characterId);
      if (!characterBase64) {
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('characterGlitch', String(settings.characterGlitch));
      formData.append('characterGlitchSeed', String(settings.characterGlitchSeed));
      formData.append('characterGradient', settings.characterGradient);
      formData.append('characterPathBase64', characterBase64);

      const response = await fetch('/api/preview-effects', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error);
      }

      const blob = await response.blob();
      processApiResult(blob);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      handleError(error);
    }
  }, [settings, getStoredCharacter, processApiResult, handleError, isRollbackInProgress, hasFetchedPreview]);

  useEffect(() => {
    setHasFetchedPreview(false);
  }, [
    settings.characterGlitch,
    settings.characterGlitchSeed,
    settings.characterGradient,
    settings.characterId
  ]);

  useEffect(() => {
    if (isDragging || isRollbackInProgress || !settings.characterId || !needsApiPreview()) {
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchEffectsPreview();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    isDragging,
    isRollbackInProgress,
    settings.characterGlitch,
    settings.characterGlitchSeed,
    settings.characterGradient,
    settings.characterId,
    fetchEffectsPreview,
    needsApiPreview
  ]);

  // Clean up on unmount
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
    previewImage
  };
}