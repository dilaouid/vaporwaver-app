import { existsSync, readdirSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import crypto from "crypto";

export class FileUtils {
  static generateUniqueFileName(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  static async cleanupFiles(files: string[]): Promise<void> {
    await Promise.all(files.map(async (file) => {
      try {
        if (existsSync(file)) {
          await unlink(file);
        }
      } catch (error) {
        console.warn(`Failed to cleanup file ${file}:`, error);
      }
    }));
  }

  static async ensureTempDir(tmpDir: string): Promise<void> {
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }
  }

  static async writeAndValidateFile(path: string, buffer: Buffer): Promise<void> {
    await writeFile(path, buffer);
    if (!existsSync(path)) {
      throw new Error("Failed to write file");
    }
  }

  static listTempFiles(tmpDir: string): string[] {
    try {
      return readdirSync(tmpDir);
    } catch {
      return [];
    }
  }
}
