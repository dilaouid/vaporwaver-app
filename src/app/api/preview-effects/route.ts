import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from './services/validation';
import { createConfig } from './services/config-generator';
import { ImageProcessor } from './services/image-processing';
import { setupPaths } from '../shared/utils/paths';
import { ResponseHeaders } from './types';
import { getBufferFromBase64 } from './services/validation';
import { SecurityUtils } from "../shared/utils/security";
import { v4 as uuid } from "uuid";
import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!SecurityUtils.checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Générer un ID unique pour cette requête
  const id = uuid();
  const { characterPath, outputPath, tmpDir, cleanup } = await setupPaths(id);

  try {
    console.log(`Processing preview effects with:`);
    console.log(`- Character path: ${characterPath}`);
    console.log(`- Output path: ${outputPath}`);
    console.log(`- Temp directory: ${tmpDir}`);

    // Créer le dossier temporaire s'il n'existe pas
    if (!existsSync(tmpDir)) {
      await fs.mkdir(tmpDir, { recursive: true });
      console.log(`Created temp directory: ${tmpDir}`);
    }

    // Définir les variables d'environnement nécessaires
    process.env.VAPORWAVER_TMP = tmpDir;
    
    // Vérifier si le script Python est accessible
    const vaporwaverPath = path.join(process.cwd(), 'node_modules', 'vaporwaver-ts', 'vaporwaver.py');
    if (existsSync(vaporwaverPath)) {
      console.log(`Found vaporwaver.py at: ${vaporwaverPath}`);
    } else {
      console.warn(`vaporwaver.py not found at expected location: ${vaporwaverPath}`);
    }

    const validatedData = await validateRequest(request);
    const imageBuffer = getBufferFromBase64(validatedData.characterPathBase64);

    console.log(`Received image buffer of size: ${imageBuffer.length} bytes`);

    // Créer la configuration
    const config = await createConfig(validatedData, characterPath, outputPath);

    // Traiter l'image
    const outputBuffer = await ImageProcessor.processImage(config, imageBuffer);

    console.log(`Returning processed image, size: ${outputBuffer.length} bytes`);

    return new Response(outputBuffer, {
      status: 200,
      headers: ResponseHeaders
    });
  } catch (error) {
    console.error("Preview effects API error:", error);

    let detailedMessage = "Unknown error";
    if (error instanceof Error) {
      detailedMessage = error.message;
      if (error.stack) {
        console.error(error.stack);
      }
    }

    // En cas d'erreur, vérifier si l'image d'origine existe
    try {
      if (existsSync(characterPath)) {
        console.log("Returning original image as fallback");
        const originalBuffer = await fs.readFile(characterPath);
        return new Response(originalBuffer, {
          status: 200,
          headers: ResponseHeaders
        });
      }
    } catch (fallbackError) {
      console.error("Failed to serve fallback image:", fallbackError);
    }

    return NextResponse.json(
      {
        error: "Failed to apply effects",
        details: detailedMessage
      },
      { status: 500 }
    );
  } finally {
    // Laisser un peu de temps pour que le traitement soit terminé avant le nettoyage
    setTimeout(async () => {
      try {
        await cleanup();
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
    }, 1000);
  }
}