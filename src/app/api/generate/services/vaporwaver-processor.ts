import { IFlag, vaporwaver } from "vaporwaver-ts";

export class VaporwaverProcessor {
    static async process(config: IFlag): Promise<void> {
        try {
            await vaporwaver(config);
        } catch (error) {
            console.error("Full composition failed, trying with default background", error);
            try {
                await vaporwaver({ ...config, background: "default" });
            } catch (secondError) {
                console.error("Default background failed too, falling back to character-only", secondError);
                await vaporwaver({
                    characterPath: config.characterPath,
                    outputPath: config.outputPath,
                    characterGlitch: 0.1,
                    characterGlitchSeed: 0,
                    characterGradient: "none",
                    characterOnly: true
                });
            }
        }
    }
}