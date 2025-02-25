import { spawn } from 'child_process';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface CharacterOnlyOptions {
  characterPath: string;
  outputPath: string;
  characterGlitch?: number;
  characterGlitchSeed?: number;
  characterGradient?: string;
  suffix?: string; // Pour aider à la recherche de fichiers temporaires
}

export async function processCharacterOnly(options: CharacterOnlyOptions): Promise<Buffer> {
  const {
    characterPath,
    outputPath,
    characterGlitch = 0.1,
    characterGlitchSeed = 0,
    characterGradient = 'none',
    suffix
  } = options;

  // console.log('Direct character-only processing with options:', options);

  // Vérifier que le script Python existe
  const vaporwaverPath = path.join(process.cwd(), 'node_modules', 'vaporwaver-ts', 'vaporwaver.py');
  if (!existsSync(vaporwaverPath)) {
    console.error(`vaporwaver.py not found at: ${vaporwaverPath}`);
    // Retourner l'image d'origine si le script n'est pas trouvé
    return await fs.readFile(characterPath);
  }

  // Obtenir le dossier temporaire
  const tmpDir = path.dirname(characterPath);
  
  try {
    // Construire les arguments pour Python
    const pythonArgs = [
      vaporwaverPath,
      '--character-only',
      `-c=${characterPath}`,
      `-o=${outputPath}`,
      `-cgd=${characterGradient}`,
      `-cg=${characterGlitch}`,
      `-cgs=${characterGlitchSeed}`
    ];

    // console.log('Executing Python with args:', pythonArgs);

    // Exécuter le script Python
    await new Promise<{ success: boolean; output: string; error: string }>((resolve) => {
      const pythonProcess = spawn('python', pythonArgs, {
        env: {
          ...process.env,
          VAPORWAVER_TMP: tmpDir,
          PYTHONPATH: path.dirname(vaporwaverPath)
        }
      });

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
        // console.log('Python stdout:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.error('Python stderr:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        resolve({
          success: code === 0,
          output: stdoutData,
          error: stderrData
        });
      });
    });

    // console.log('Python execution result:', result);

    // Attendre un moment pour que les fichiers soient bien écrits
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Vérifier si le fichier de sortie existe
    if (existsSync(outputPath)) {
      // console.log(`Output file found at expected path: ${outputPath}`);
      return await fs.readFile(outputPath);
    }

    // Si le fichier de sortie spécifié n'existe pas, chercher des alternatives
    console.log('Checking for alternative output files');
    const tmpFiles = await fs.readdir(tmpDir);
    // console.log('Files in tmp directory:', tmpFiles.join(', '));
    
    // Chercher les fichiers avec le suffixe ou les fichiers modifiés récemment
    let potentialFiles = tmpFiles;
    
    // Si nous avons un suffixe, filtrer par les fichiers qui le contiennent
    if (suffix) {
      potentialFiles = potentialFiles.filter(file => file.includes(suffix));
    }
    
    // Exclure le fichier d'entrée
    potentialFiles = potentialFiles.filter(file => 
      file !== path.basename(characterPath) &&
      // Préférer les fichiers qui commencent par 'char_' ou contiennent 'output'
      (file.startsWith('char_') || file.includes('output'))
    );
    
    // console.log('Potential output files:', potentialFiles);

    // Si nous avons trouvé des fichiers potentiels, prendre le plus récent
    if (potentialFiles.length > 0) {
      // Trier les fichiers par date de modification (du plus récent au plus ancien)
      const fileStats = await Promise.all(
        potentialFiles.map(async file => {
          const filePath = path.join(tmpDir, file);
          const stats = await fs.stat(filePath);
          return { file, path: filePath, mtime: stats.mtime };
        })
      );
      
      fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      
      // Prendre le fichier le plus récent
      const newestFile = fileStats[0];
      // console.log(`Using most recent file: ${newestFile.path} (modified: ${newestFile.mtime})`);
      
      return await fs.readFile(newestFile.path);
    }

    // Si aucun fichier de sortie n'est trouvé, utiliser l'image d'origine
    console.log('No output file found, returning original image');
    return await fs.readFile(characterPath);
  } catch (error) {
    console.error('Error in processCharacterOnly:', error);
    // En cas d'erreur, retourner l'image d'origine
    return await fs.readFile(characterPath);
  }
}