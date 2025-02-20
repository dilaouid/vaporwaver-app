import { useState, useEffect, useRef, useCallback } from 'react';
import { VaporwaverSettings } from '@/app/types/vaporwaver';
import { useCharacterStorage } from './use-character-storage';

export function useEffectsPreview(settings: VaporwaverSettings, isDragging: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { getStoredCharacter } = useCharacterStorage();
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);

  // Remember last applied effects
  const appliedEffectsRef = useRef({
    characterGlitch: settings.characterGlitch,
    characterGlitchSeed: settings.characterGlitchSeed,
    characterGradient: settings.characterGradient,
  });

  // Remember last base64 used for preview
  const appliedBase64Ref = useRef<string | null>(null);

  // Process API result with proper image loading
  const processApiResult = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setPreviewImage(prevUrl => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return url;
    });
    
    // Update the applied effects reference
    appliedEffectsRef.current = {
      characterGlitch: settings.characterGlitch,
      characterGlitchSeed: settings.characterGlitchSeed,
      characterGradient: settings.characterGradient,
    };
    
    // Update applied base64
    appliedBase64Ref.current = getStoredCharacter();
    
    // Immediately turn off loading when image is set
    setIsLoading(false);
    isUpdatingRef.current = false;
  }, [settings, getStoredCharacter]);

  // Actual API request function
  const fetchEffectsPreview = useCallback(async () => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    // Abort any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const characterBase64 = getStoredCharacter();
    if (!characterBase64) {
      setIsLoading(false);
      isUpdatingRef.current = false;
      return;
    }
    
    try {
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
        throw new Error(`API error: ${response.status}`);
      }
      
      const blob = await response.blob();
      processApiResult(blob);
      
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Ignore aborted requests
        return;
      }
      
      console.error('Failed to fetch effect preview:', error);
      setIsLoading(false);
      isUpdatingRef.current = false;
    }
  }, [settings, getStoredCharacter, processApiResult]);

  // Debounced effect updater
  const debouncedUpdateEffect = useCallback(() => {
    // Clear any existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Don't trigger updates if already updating
    if (isUpdatingRef.current) return;
    
    // Set a new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      const currentBase64 = getStoredCharacter();
      
      // Skip if nothing changed
      if (
        settings.characterGlitch === appliedEffectsRef.current.characterGlitch &&
        settings.characterGlitchSeed === appliedEffectsRef.current.characterGlitchSeed &&
        settings.characterGradient === appliedEffectsRef.current.characterGradient &&
        currentBase64 === appliedBase64Ref.current
      ) {
        return;
      }
      
      fetchEffectsPreview();
      debounceTimerRef.current = null;
    }, 300);
  }, [settings, getStoredCharacter, fetchEffectsPreview]);

  

  const needsApiPreview = useCallback(() => {
    const hasEffectsToApply = 
      settings.characterGlitch !== 0.1 ||
      settings.characterGlitchSeed !== 0 ||
      settings.characterGradient !== 'none';

    const hasEffectsToRemove = 
      (settings.characterGlitch === 0.1 && appliedEffectsRef.current.characterGlitch !== 0.1) ||
      (settings.characterGlitchSeed === 0 && appliedEffectsRef.current.characterGlitchSeed !== 0) ||
      (settings.characterGradient === 'none' && appliedEffectsRef.current.characterGradient !== 'none');

    return hasEffectsToApply || hasEffectsToRemove;
  }, [settings]);

  // Effect to handle changes and trigger updates
  useEffect(() => {
    if (isDragging || !needsApiPreview()) return;
    debouncedUpdateEffect();
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [
    isDragging,
    needsApiPreview,
    settings.characterGlitch,
    settings.characterGlitchSeed,
    settings.characterGradient,
    debouncedUpdateEffect
  ]);

  // Effect to handle changes and trigger updates
  useEffect(() => {
    if (isDragging || !needsApiPreview) return;
    debouncedUpdateEffect();
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [
    isDragging,
    needsApiPreview,
    settings.characterGlitch,
    settings.characterGlitchSeed,
    settings.characterGradient,
    debouncedUpdateEffect
  ]);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [previewImage]);

  return {
    isLoading,
    previewImage
  };
}