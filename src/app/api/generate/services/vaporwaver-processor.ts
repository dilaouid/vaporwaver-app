import { IFlag, vaporwaver } from "vaporwaver-ts";
import path from 'path';
import { existsSync } from "fs";
import { mkdir, readdir, copyFile } from "fs/promises";

export class VaporwaverProcessor {
    static async process(config: IFlag): Promise<void> {
        try {
            // Vérifier que le fichier existe avant de le passer à Python
            if (!existsSync(config.characterPath)) {
                throw new Error(`Character file not found at ${config.characterPath}`);
            }

            // Vérifier que le dossier temporaire existe
            if (!config.tmpDir) {
                throw new Error('Temporary directory is not defined');
            }
            
            if (!existsSync(config.tmpDir)) {
                await mkdir(config.tmpDir, { recursive: true });
            }

            // Faire une copie de sauvegarde du fichier character
            const backupPath = path.join(config.tmpDir, `char-backup.png`);
            await copyFile(config.characterPath, backupPath);

            // Logger les paramètres complets pour le debug
            /* console.log('Starting vaporwaver process with complete config:', {
                characterPath: config.characterPath,
                outputPath: config.outputPath,
                tmpDir: config.tmpDir,
                miscAboveCharacter: config.miscAboveCharacter,
                background: config.background,
                misc: config.misc,
                crt: config.crt,
                characterXPos: config.characterXPos,
                characterYPos: config.characterYPos,
                characterScale: config.characterScale,
                characterRotate: config.characterRotate,
                miscPosX: config.miscPosX,
                miscPosY: config.miscPosY,
                miscScale: config.miscScale,
                miscRotate: config.miscRotate,
                characterGlitch: config.characterGlitch,
                characterGlitchSeed: config.characterGlitchSeed,
                characterGradient: config.characterGradient
            }); */

            // Définir explicitement VAPORWAVER_TMP
            // process.env.VAPORWAVER_TMP = config.tmpDir;

            // S'assurer que tous les paramètres nécessaires sont définis
            // et convertir les valeurs numériques si elles sont des chaînes
            const completeConfig: IFlag = {
                ...config,
                characterPath: path.resolve(config.characterPath),
                outputPath: path.resolve(config.outputPath as string),
                tmpDir: config.tmpDir,
                // Valeurs par défaut explicites avec conversion
                characterXPos: this.ensureNumber(config.characterXPos),
                characterYPos: this.ensureNumber(config.characterYPos),
                characterScale: this.ensureNumber(config.characterScale, 100),
                characterRotate: this.ensureNumber(config.characterRotate),
                characterGlitch: this.ensureNumber(config.characterGlitch, 0.1),
                characterGlitchSeed: this.ensureNumber(config.characterGlitchSeed),
                characterGradient: config.characterGradient || "none",
                miscPosX: this.ensureNumber(config.miscPosX),
                miscPosY: this.ensureNumber(config.miscPosY),
                miscScale: this.ensureNumber(config.miscScale, 100),
                miscRotate: this.ensureNumber(config.miscRotate),
                crt: typeof config.crt === 'string' 
                    ? String(config.crt).toLowerCase() === 'true' 
                    : !!config.crt,
                miscAboveCharacter: typeof config.miscAboveCharacter === 'string'
                    ? String(config.miscAboveCharacter).toLowerCase() === 'true'
                    : !!config.miscAboveCharacter
            };

            try {
                await vaporwaver(completeConfig);
                
                // Attendre un peu que le fichier soit écrit
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Vérifier que le fichier de sortie existe
                if (existsSync(config.outputPath as string)) {
                    console.log('Vaporwaver process completed successfully');
                    return;
                }
                
                console.warn(`Output file not found at expected path: ${config.outputPath}`);
                
                // Lister tous les fichiers du dossier et chercher un candidat potentiel
                const files = await readdir(config.tmpDir);
                console.log(`Files in tmp directory after processing: ${files.join(', ')}`);
                
                // Chercher un fichier de sortie potentiel (qui n'est pas le fichier d'entrée)
                const potentialOutputFile = files.find(file => 
                    file.endsWith('.png') && 
                    file !== path.basename(config.characterPath as string) &&
                    file !== 'char-backup.png'
                );
                
                if (potentialOutputFile) {
                    const sourcePath = path.join(config.tmpDir, potentialOutputFile);
                    console.log(`Found potential output file: ${sourcePath}`);
                    
                    // Copier le fichier trouvé vers le chemin de sortie attendu
                    await copyFile(sourcePath, config.outputPath as string);
                    console.log(`Copied ${sourcePath} to ${config.outputPath}`);
                    
                    if (existsSync(config.outputPath as string)) {
                        console.log('Alternative output file successfully copied');
                        return;
                    }
                }
                
                throw new Error(`No valid output file found in ${config.tmpDir}`);
            } catch (error) {
                console.error('Error during vaporwaver execution:', error);
                
                // Si le fichier d'entrée a été altéré, restaurer à partir de la sauvegarde
                if (!existsSync(config.characterPath) && existsSync(backupPath)) {
                    console.log('Restoring character file from backup');
                    await copyFile(backupPath, config.characterPath);
                }
                
                throw error;
            }
        } catch (error) {
            console.error("Full composition failed:", error);
            throw error;
        }
    }

    // Méthode utilitaire pour garantir qu'une valeur est bien un nombre
    private static ensureNumber(value: number | string | undefined | null, defaultValue: number = 0): number {
        if (value === undefined || value === null) {
            return defaultValue;
        }
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? defaultValue : parsed;
        }
        return defaultValue;
    }
}