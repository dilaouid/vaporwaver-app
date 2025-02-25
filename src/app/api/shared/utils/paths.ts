import { join } from "path";
import { existsSync } from "fs";
import fs from "fs/promises";

function generateUniqueId(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
}

async function findPackagePath(): Promise<string> {
    const appTmpDir = join(process.cwd(), 'tmp');
    if (!existsSync(appTmpDir)) {
        await fs.mkdir(appTmpDir, { recursive: true });
    }
    return appTmpDir;
}

export async function setupPaths(uniqueId?: string) {
    const id = uniqueId || generateUniqueId();
    const baseTmpDir = await findPackagePath();
    
    // Créer un sous-dossier unique pour cette requête
    const tmpDir = join(baseTmpDir, `req-${id}`);
    await fs.mkdir(tmpDir, { recursive: true });
    
    // Utiliser des noms simples à l'intérieur du dossier unique
    const characterPath = join(tmpDir, `char.png`);
    const outputPath = join(tmpDir, `output.png`);

    return {
        characterPath,
        outputPath,
        tmpDir,
        suffix: id,
        cleanup: async () => {
            try {
                // Supprimer le dossier entier quand nous avons terminé
                // Mais d'abord attendre un peu pour s'assurer que tous les processus ont terminé
                await new Promise(resolve => setTimeout(resolve, 500));
                await fs.rm(tmpDir, { recursive: true, force: true });
                console.log(`Cleaned up temporary directory: ${tmpDir}`);
            } catch (error) {
                console.warn('Failed to cleanup temp directory:', error);
            }
        }
    };
}