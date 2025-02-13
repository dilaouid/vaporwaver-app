import { NextRequest, NextResponse } from 'next/server';
import { vaporwaver } from 'vaporwaver-ts';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const outputsDir = join(process.cwd(), 'public', 'outputs');
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(outputsDir, { recursive: true });

    const formData = await request.formData();
    const characterFile = formData.get('characterPath') as File;

    if (!characterFile) {
      return NextResponse.json(
        { error: 'No character image provided' },
        { status: 400 }
      );
    }

    const characterBuffer = Buffer.from(await characterFile.arrayBuffer());
    const characterPath = join(uploadsDir, `char-${Date.now()}.png`);
    await writeFile(characterPath, characterBuffer);

    const settings = {
      characterPath,
      background: (formData.get('background') as string) || 'default',
      misc: (formData.get('misc') as string) || 'none',
      miscPosX: Number(formData.get('miscPosX')) || 0,
      miscPosY: Number(formData.get('miscPosY')) || 0,
      miscScale: Number(formData.get('miscScale')) || 100,
      miscRotate: Number(formData.get('miscRotate')) || 0,
      characterXPos: Number(formData.get('characterXPos')) || 0,
      characterYPos: Number(formData.get('characterYPos')) || 0,
      characterScale: Number(formData.get('characterScale')) || 100,
      characterRotate: Number(formData.get('characterRotate')) || 0,
      characterGlitch: Number(formData.get('characterGlitch')) || 0.1,
      characterGlitchSeed: Number(formData.get('characterGlitchSeed')) || 0,
      characterGradient: (formData.get('characterGradient') as string) || 'none',
      crt: formData.get('crt') === 'true',
      outputPath: join(outputsDir, `preview-${Date.now()}.png`),
    };

    await vaporwaver(settings);

    const previewUrl = `/outputs/preview-${Date.now()}.png`;
    return NextResponse.json({ previewUrl });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}