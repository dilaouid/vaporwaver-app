import { NextRequest, NextResponse } from "next/server";
import { vaporwaver, GradientType, IFlag } from "vaporwaver-ts";
import { join } from "path";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { existsSync } from "fs";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

// Helper to generate unique filenames to avoid race conditions
const generateUniqueFileName = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Cleanup function to avoid file system clutter
const cleanupFiles = async (files: string[]) => {
  for (const file of files) {
    try {
      if (existsSync(file)) {
        await unlink(file);
      }
    } catch (error) {
      console.warn(`Failed to cleanup file ${file}:`, error);
    }
  }
};

export async function POST(request: NextRequest) {
  const uniqueId = generateUniqueFileName();
  const tmpDir = join(process.cwd(), "tmp");
  const characterPath = join(tmpDir, `char-${uniqueId}.png`);
  const outputPath = join(tmpDir, `output-${uniqueId}.png`);
  const filesToCleanup = [characterPath, outputPath];

  try {
    // Ensure temp directory exists
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    const formData = await request.formData();
    
    // Extract key parameters
    const characterGlitch = Number(formData.get("characterGlitch") || 0.1);
    const characterGlitchSeed = Number(formData.get("characterGlitchSeed") || 0);
    const characterGradient = (formData.get("characterGradient") || "none") as GradientType;
    const characterBase64 = formData.get("characterPathBase64") as string;

    if (!characterBase64) {
      return NextResponse.json(
        { error: "No character image data provided" },
        { status: 400 }
      );
    }

    // Convert base64 to image file
    try {
      const buffer = Buffer.from(characterBase64, "base64");
      await writeFile(characterPath, buffer);
      
      // Verify file was written
      if (!existsSync(characterPath)) {
        throw new Error("Failed to write character file");
      }
    } catch (error) {
      console.error("File writing error:", error);
      return NextResponse.json(
        { error: "Failed to process image data" },
        { status: 500 }
      );
    }

    // Configure vaporwaver to process only character effects
    const config: IFlag = {
      characterPath,
      characterGlitch,
      characterGlitchSeed,
      characterGradient,
      outputPath,
      characterOnly: true,
    };

    // Process image with vaporwaver
    await vaporwaver(config);

    // Verify output file exists
    if (!existsSync(outputPath)) {
      throw new Error("Output file was not generated");
    }

    // Read the output file
    const outputBuffer = await readFile(outputPath);

    // Clean up temporary files
    cleanupFiles(filesToCleanup).catch(console.error);

    // Return the processed image
    return new Response(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    // Clean up any files that might have been created
    cleanupFiles(filesToCleanup).catch(console.error);

    console.error("Preview effects API error:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error processing effects";
      
    return NextResponse.json(
      { 
        error: "Failed to apply effects", 
        details: errorMessage
      },
      { status: 500 }
    );
  }
}