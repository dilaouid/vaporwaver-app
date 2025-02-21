import { vaporwaver, IFlag } from "vaporwaver-ts";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";

export class ImageProcessor {
  static async processImage(config: IFlag, imageBuffer: Buffer): Promise<Buffer> {
    await writeFile(config.characterPath, imageBuffer);
    if (!existsSync(config.characterPath)) throw new Error("File write failed");
    
    await vaporwaver(config);
    if (!existsSync(config.outputPath as string)) throw new Error("Processing failed");
    
    return await readFile(config.outputPath as string);
  }
}