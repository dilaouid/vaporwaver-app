import { z } from 'zod';
import { gradients } from '@/lib/gradientPreview';
import { GradientType } from 'vaporwaver-ts';

export const RequestSchema = z.object({
  characterGlitch: z.number().min(.1).max(10),
  characterGlitchSeed: z.number().int().min(0).max(100),
  characterGradient: z.custom<GradientType>((val) => gradients.includes(val as string)),
  characterPathBase64: z.string().base64()
});

export const ResponseHeaders = {
  "Content-Type": "image/png",
  "Content-Security-Policy": "default-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
} as const;

export type RequestData = z.infer<typeof RequestSchema>;