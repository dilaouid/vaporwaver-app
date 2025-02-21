import { join } from "path";
import { FileUtils } from './file';
import { SecurityUtils } from './security';

export async function setupPaths() {
    const uniqueId = FileUtils.generateUniqueFileName();
    const tmpDir = join(process.cwd(), "tmp");
    // Ensure .png extensions are added
    const characterPath = join(tmpDir, SecurityUtils.sanitizeFileName(`char-${uniqueId}`) + '.png');
    const outputPath = join(tmpDir, SecurityUtils.sanitizeFileName(`output-${uniqueId}`) + '.png');
    
    await FileUtils.ensureTempDir(tmpDir);
    
    return { characterPath, outputPath, tmpDir };
  }