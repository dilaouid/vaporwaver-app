import { IFlag, GradientType } from "vaporwaver-ts";
import { RequestData } from '../types';

export function createConfig(data: RequestData, characterPath: string, outputPath: string): IFlag {
    return {
        characterPath,
        characterGlitch: data.characterGlitch,
        characterGlitchSeed: data.characterGlitchSeed,
        characterGradient: data.characterGradient as GradientType,
        outputPath,
        characterOnly: true,
    };
}