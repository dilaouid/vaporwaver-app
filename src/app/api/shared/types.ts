import { z } from 'zod';

export const BaseImageSchema = z.object({
    characterPathBase64: z.string()
});

export const GenerateSchema = BaseImageSchema.extend({
    crt: z.boolean().optional(),
    misc: z.string().default('none'),
    background: z.string().default('default'),
    characterXPos: z.number().default(0),
    characterYPos: z.number().default(0),
    characterScale: z.number().default(100),
    characterRotate: z.number().default(0),
    miscPosX: z.number().default(0),
    miscPosY: z.number().default(0),
    miscScale: z.number().default(100),
    miscRotate: z.number().default(0),
    miscAboveCharacter: z.boolean().default(false)
});