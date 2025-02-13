import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

interface ImageAsset {
    id: string;
    name: string;
    thumbnail: string;
}

export async function GET() {
    try {
        // Read backgrounds
        const backgroundsDir = join(process.cwd(), 'public', 'backgrounds');
        const backgroundFiles = await readdir(backgroundsDir);
        const backgrounds: ImageAsset[] = backgroundFiles
            .filter(file => file.endsWith('.png'))
            .map(file => ({
                id: file.replace('.png', ''),
                name: file.replace('.png', '').split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                thumbnail: `/backgrounds/${file}`
            }));

        // Read miscs
        const miscsDir = join(process.cwd(), 'public', 'miscs');
        const miscFiles = await readdir(miscsDir);
        const miscs: ImageAsset[] = miscFiles
            .filter(file => file.endsWith('.png'))
            .map(file => ({
                id: file.replace('.png', ''),
                name: file.replace('.png', '').split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                thumbnail: `/miscs/${file}`
            }));

        return NextResponse.json({ backgrounds, miscs });
    } catch (error) {
        console.error('Error reading assets:', error);
        return NextResponse.json(
            { error: 'Failed to read assets' },
            { status: 500 }
        );
    }
}
