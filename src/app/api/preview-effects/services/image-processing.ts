import { existsSync } from 'fs';
import { readFile, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { processCharacterOnly } from './direct-character-only';

export class ImageProcessor {
  static async processImage(config: any, imageBuffer: Buffer): Promise<Buffer> {
    try {
      // S'assurer que les dossiers existent
      const characterDir = path.dirname(config.characterPath);
      const outputDir = path.dirname(config.outputPath);
      
      await mkdir(characterDir, { recursive: true });
      await mkdir(outputDir, { recursive: true });
      
      // Extraire le suffixe du fichier d'entrée pour la recherche ultérieure
      const inputFileName = path.basename(config.characterPath);
      const suffix = inputFileName.includes('_') 
        ? inputFileName.split('_')[1].replace('.png', '') 
        : undefined;
      
      // Écrire le fichier d'entrée
      // console.log(`Writing character to ${config.characterPath}, size: ${imageBuffer.length} bytes`);
      await writeFile(config.characterPath, imageBuffer);
      
      // Vérifier que le fichier a bien été écrit
      if (!existsSync(config.characterPath)) {
        throw new Error(`Failed to write input file to ${config.characterPath}`);
      }
      
      /* console.log(`Character file written successfully to ${config.characterPath}`);
      console.log(`Will generate output to ${config.outputPath}`); */
      
      // Appeler directement la fonction qui traite les effets character-only
      const processedBuffer = await processCharacterOnly({
        characterPath: config.characterPath,
        outputPath: config.outputPath,
        characterGlitch: config.characterGlitch,
        characterGlitchSeed: config.characterGlitchSeed,
        characterGradient: config.characterGradient,
        suffix: suffix
      });
      
      return processedBuffer;
    } catch (error) {
      console.error("Error in ImageProcessor.processImage:", error);
      
      // Renvoyer l'image originale en cas d'erreur si possible
      try {
        if (existsSync(config.characterPath)) {
          console.log('Using original image as fallback after error');
          return await readFile(config.characterPath);
        }
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
      }
      
      throw error;
    }
  }
}