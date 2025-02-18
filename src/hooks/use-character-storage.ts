import { useCallback } from 'react';

export const useCharacterStorage = () => {
    const STORAGE_KEY = 'vaporwaver_character';

    const storeCharacter = async (file: File) => {
        try {
            const buffer = await file.arrayBuffer();
            const base64 = btoa(
                new Uint8Array(buffer)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            localStorage.setItem(STORAGE_KEY, base64);
            return base64;
        } catch (error) {
            console.error('Failed to store character:', error);
            return null;
        }
    };

    const getStoredCharacter = () => {
        return localStorage.getItem(STORAGE_KEY);
    };

    const getCharacterUrl = useCallback(() => {
        const base64 = getStoredCharacter();
        if (!base64) return null;

        const byteCharacters = atob(base64);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            byteArrays.push(new Uint8Array(byteNumbers));
        }

        const blob = new Blob(byteArrays, { type: 'image/png' });
        return URL.createObjectURL(blob);
    }, []);

    return { storeCharacter, getStoredCharacter, getCharacterUrl };
};
