import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

import { FileUtils } from '../shared/utils/file'
import { setupPaths } from '../shared/utils/paths';
import { SecurityUtils } from "../shared/utils/security";
import { GenerateSchema } from '../shared/types';
import { VaporwaverProcessor } from './services/vaporwaver-processor';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!SecurityUtils.checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { characterPath, outputPath } = await setupPaths();
  const filesToCleanup = [characterPath, outputPath];

  try {
    const formData = await request.formData();
    const validatedData = GenerateSchema.parse({
      characterPathBase64: formData.get("characterPathBase64"),
      crt: formData.get("crt")?.toString().toLowerCase() === "true",
      misc: formData.get("misc")?.toString(),
      background: formData.get("background")?.toString(),
      characterXPos: Number(formData.get("characterXPos")),
      characterYPos: Number(formData.get("characterYPos")),
      characterScale: Number(formData.get("characterScale")),
      characterRotate: Number(formData.get("characterRotate")),
      miscPosX: Number(formData.get("miscPosX")),
      miscPosY: Number(formData.get("miscPosY")),
      miscScale: Number(formData.get("miscScale")),
      miscRotate: Number(formData.get("miscRotate"))
    });

    const imageBuffer = Buffer.from(validatedData.characterPathBase64, "base64");
    await FileUtils.writeAndValidateFile(characterPath, imageBuffer);

    await VaporwaverProcessor.process({
      characterPath,
      outputPath,
      ...validatedData,
      characterGlitch: 0.1,
      characterGlitchSeed: 0,
      characterGradient: "none",
      characterOnly: false
    });

    if (!existsSync(outputPath)) {
      throw new Error("Output file was not generated");
    }

    const outputBuffer = await readFile(outputPath);

    return new Response(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Security-Policy": "default-src 'self'",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Generate final API error:", error);
    return NextResponse.json({
      error: "Failed to generate final preview",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  } finally {
    await FileUtils.cleanupFiles(filesToCleanup).catch(console.error);
  }
}