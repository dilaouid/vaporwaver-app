import { NextRequest } from "next/server";
import { RequestSchema, RequestData } from '../types';
import { SecurityUtils } from '../../shared/utils/security';
import { MAX_FILE_SIZE } from '../config';

export async function validateRequest(request: NextRequest): Promise<RequestData> {
    const formData = await request.formData();

    const formValues = {
        characterGlitch: Number(formData.get("characterGlitch") ?? 0),
        characterGlitchSeed: Number(formData.get("characterGlitchSeed") ?? 0),
        characterGradient: formData.get("characterGradient") ?? '',
        characterPathBase64: formData.get("characterPathBase64")?.toString() ?? ''
    };

    const validatedData = RequestSchema.parse(formValues);

    if (!SecurityUtils.validateBase64(validatedData.characterPathBase64)) {
        throw new Error("Invalid image data format");
    }

    const buffer = getBufferFromBase64(validatedData.characterPathBase64);

    if (buffer.length > MAX_FILE_SIZE) {
        throw new Error("File too large");
    }

    if (!(await SecurityUtils.validateImage(buffer))) {
        throw new Error("Invalid image type");
    }

    return validatedData;
}

export function getBufferFromBase64(base64Data: string): Buffer {
    const base64Content = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data;
    return Buffer.from(base64Content, "base64");
}