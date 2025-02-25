import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

interface EffectsConfig {
  characterPathBase64: string;
  characterGlitch: number | string;
  characterGlitchSeed: number | string;
  characterGradient: string;
}

export async function createConfig(data: EffectsConfig, characterPath: string, outputPath: string) {
  // S'assurer que les chemins sont absolus
  const absCharacterPath = path.resolve(characterPath);
  const absOutputPath = path.resolve(outputPath);
  
  console.log(`Creating config with character path: ${absCharacterPath}`);
  console.log(`Output path: ${absOutputPath}`);
  
  // Créer le dossier parent s'il n'existe pas
  const outputDir = path.dirname(absOutputPath);
  if (!existsSync(outputDir)) {
    console.log(`Output directory ${outputDir} does not exist, creating it...`);
    await mkdir(outputDir, { recursive: true });
  }
  
  // Configurer pour character-only (mode effet uniquement)
  return {
    characterPath: absCharacterPath,
    outputPath: absOutputPath,
    characterGlitch: typeof data.characterGlitch === 'string' 
      ? parseFloat(data.characterGlitch || "0.1") 
      : data.characterGlitch || 0.1,
    characterGlitchSeed: typeof data.characterGlitchSeed === 'string'
      ? parseInt(data.characterGlitchSeed || "0", 10)
      : data.characterGlitchSeed || 0,
    characterGradient: data.characterGradient || "none",
    characterOnly: true, // Important pour les effets
    tmpDir: outputDir
  };
}