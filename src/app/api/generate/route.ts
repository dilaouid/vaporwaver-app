import { NextRequest, NextResponse } from "next/server";
import { IFlag, vaporwaver } from "vaporwaver-ts";
import { join } from "path";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { existsSync } from "fs";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const generateUniqueFileName = () => {
    return crypto.randomBytes(16).toString("hex");
};

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
        if (!existsSync(tmpDir)) {
            await mkdir(tmpDir, { recursive: true });
        }

        const formData = await request.formData();

        const characterBase64 = formData.get("characterPathBase64") as string;
        if (!characterBase64) {
            return NextResponse.json(
                { error: "No character image data provided" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(characterBase64, "base64");
        await writeFile(characterPath, buffer);
        if (!existsSync(characterPath)) {
            throw new Error("Failed to write character file");
        }
        const crtValue = formData.get("crt")?.toString().toLowerCase() === "true";

        const config: IFlag = {
            characterPath,
            characterXPos: Number(formData.get("characterXPos") || 0),
            characterYPos: Number(formData.get("characterYPos") || 0),
            characterScale: Number(formData.get("characterScale") || 100),
            characterRotate: Number(formData.get("characterRotate") || 0),
            // Forcer : aucun effet de gradient, glitch ou seed
            characterGlitch: 0.1,
            characterGlitchSeed: 0,
            characterGradient: "none",
            outputPath,
            // Options pour background et misc (si nécessaire)
            background: formData.get("background")?.toString() || "default",
            misc: formData.get("misc")?.toString() || "none",
            miscPosX: Number(formData.get("miscPosX") || 0),
            miscPosY: Number(formData.get("miscPosY") || 0),
            miscScale: Number(formData.get("miscScale") || 100),
            miscRotate: Number(formData.get("miscRotate") || 0),
            ...(crtValue ? { crt: true } : {}),
            characterOnly: false,
        };

        await vaporwaver(config);

        if (!existsSync(outputPath)) {
            throw new Error("Output file was not generated");
        }

        const outputBuffer = await readFile(outputPath);
        cleanupFiles(filesToCleanup).catch(console.error);

        return new Response(outputBuffer, {
            status: 200,
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
    } catch (error) {
        cleanupFiles(filesToCleanup).catch(console.error);
        console.error("Generate final API error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate final preview",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
