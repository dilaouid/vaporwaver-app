import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from './services/validation';
import { createConfig } from './services/config-generator';
import { ImageProcessor } from './services/image-processing';
import { setupPaths } from '../shared/utils/paths';
import { ResponseHeaders } from './types';
import { getBufferFromBase64 } from './services/validation';
import { FileUtils } from "../shared/utils/file";
import { SecurityUtils } from "../shared/utils/security";

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
    const validatedData = await validateRequest(request);
    const imageBuffer = getBufferFromBase64(validatedData.characterPathBase64);
    const config = createConfig(validatedData, characterPath, outputPath);
    
    const outputBuffer = await ImageProcessor.processImage(config, imageBuffer);

    return new Response(outputBuffer, { 
      status: 200,
      headers: ResponseHeaders 
    });
  } catch (error) {
    console.error("Preview effects API error:");
    console.error(error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error processing effects";
      
    return NextResponse.json(
      { error: "Failed to apply effects", details: errorMessage },
      { status: 500 }
    );
  } finally {
    await FileUtils.cleanupFiles(filesToCleanup).catch(console.error);
  }
}