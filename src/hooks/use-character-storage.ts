import { useCallback } from 'react';
import { FileService } from '@/services/fileService';

export const useCharacterStorage = () => {
    const fileService = FileService.getInstance();

    const storeCharacter = useCallback(async (file: File) => {
        try {
            const id = await fileService.storeFile(file);
            
            const buffer = await file.arrayBuffer();
            const base64 = btoa(
                new Uint8Array(buffer)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            
            return { id, base64, url: fileService.getFileUrl(id) };
        } catch (error) {
            console.error('Failed to store character:', error);
            return null;
        }
    }, [fileService]);

    const getStoredCharacter = useCallback((id: string | null) => {
        if (!id) return null;
        
        const file = fileService.getFile(id);
        if (!file) return null;
        
        // Convertir en base64 pour les API
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Extraire la partie base64 de "data:image/png;base64,..."
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }, [fileService]);

    const getCharacterUrl = useCallback((id: string | null) => {
        if (!id) return null;
        return fileService.getFileUrl(id);
    }, [fileService]);
    
    return { 
        storeCharacter, 
        getStoredCharacter, 
        getCharacterUrl
    };
};