import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import crypto from "crypto";
import path from "path";

import { FileUtils } from '../shared/utils/file'
import { setupPaths } from '../shared/utils/paths';
import { SecurityUtils } from "../shared/utils/security";
import { GenerateSchema } from '../shared/types';
import { VaporwaverProcessor } from './services/vaporwaver-processor';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const { characterPath, outputPath, tmpDir, cleanup } = await setupPaths(uniqueId);

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!SecurityUtils.checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    // console.log(`Processing generate request in temporary directory: ${tmpDir}`);
    
    const formData = await request.formData();
    
    // Log tous les champs pour le débogage
    // console.log("Form data fields:", [...formData.entries()].map(([k, v]) => `${k}: ${typeof v === 'string' ? v : 'File/Blob'}`));
    
    // Valider les données
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
      miscRotate: Number(formData.get("miscRotate")),
      miscAboveCharacter: formData.get("miscAboveCharacter")?.toString().toLowerCase() === "true"
    });

    const imageBuffer = Buffer.from(validatedData.characterPathBase64, "base64");
    await FileUtils.writeAndValidateFile(characterPath, imageBuffer);

    await FileUtils.ensureTempDir(tmpDir);

    // S'assurer que tous les paramètres sont correctement passés à VaporwaverProcessor
    await VaporwaverProcessor.process({
      characterPath,
      outputPath,
      tmpDir,
      background: validatedData.background || "default",
      misc: validatedData.misc || "none",
      characterXPos: validatedData.characterXPos,
      characterYPos: validatedData.characterYPos,
      characterScale: validatedData.characterScale,
      characterRotate: validatedData.characterRotate,
      characterGlitch: 0.1,
      characterGlitchSeed: 0,
      characterGradient: "none",
      miscPosX: validatedData.miscPosX,
      miscPosY: validatedData.miscPosY,
      miscScale: validatedData.miscScale,
      miscRotate: validatedData.miscRotate,
      crt: validatedData.crt,
      miscAboveCharacter: validatedData.miscAboveCharacter,
      characterOnly: false
    });

    // Vérifier et retourner le fichier de sortie
    if (existsSync(outputPath)) {
      console.log(`Output file found at: ${outputPath}`);
      const outputBuffer = await readFile(outputPath);
      
      // Définir une réponse avec des en-têtes appropriés
      const response = new Response(outputBuffer, {
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
      
      return response;
    }
    
    // Si le fichier de sortie n'est pas trouvé, rechercher des alternatives
    console.error(`Output file not found at: ${outputPath}`);
    
    // Lister les fichiers dans le dossier temporaire
    const files = FileUtils.listTempFiles(tmpDir);
    console.error(`Temp directory contents: ${files.join(', ')}`);
    
    // Chercher un fichier qui pourrait être le résultat
    const potentialOutputFile = files.find(file => 
      file !== path.basename(characterPath) && 
      (file.startsWith('output') || file.startsWith('char-output') || file.endsWith('_output.png'))
    );
    
    if (potentialOutputFile) {
      const alternativePath = path.join(tmpDir, potentialOutputFile);
      console.log(`Found alternative output file: ${alternativePath}`);
      const alternativeBuffer = await readFile(alternativePath);
      
      return new Response(alternativeBuffer, {
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
    }
    
    throw new Error("Output file was not generated");
  } catch (error) {
    console.error("Generate final API error:", error);
    
    return NextResponse.json({
      error: "Failed to generate final preview",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  } finally {
    // Nettoyer les fichiers temporaires après un délai
    setTimeout(async () => {
      try {
        await cleanup();
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
    }, 2000);
  }
}