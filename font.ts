import { Rgb, Lab } from './colors.js';
import { imageDataToLabs } from './image.js';

// const codes: number[] = [176, 177, 178, 219, 220, 221, 222, 223];
const codes: number[] = [];

for (let i = 0; i < 256; i++) {
    if (i == 9 || i == 10 || i == 13 || i == 26) continue;
    codes.push(i);
}

export class Glyph {
    private readonly labs: Lab[];

    constructor(
        public readonly code: number,
        public readonly fg: Rgb,
        public readonly bg: Rgb,
        public readonly imageData: ImageData
    ) {
        this.labs = imageDataToLabs(imageData);
    }

    score(labs: Lab[]): number {
        let score = 0;
        for (const [i, lab] of labs.entries()) {
            const glyphLab = this.labs[i];
            score += lab.distance(glyphLab);
        }
        return score / labs.length;
    }
}

export class Font {
    public readonly width = 8;
    public readonly height: number;

    constructor(private readonly glyphs: Uint8ClampedArray) {
        this.height = glyphs.length / 256;
    }

    getGlyph(index: number): Uint8ClampedArray {
        const glyph = this.glyphs.slice(
            index * this.height,
            (index + 1) * this.height
        );
        return glyph;
    }

    static async load(url: string): Promise<Font> {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const array = new Uint8ClampedArray(buffer);
        return new Font(array);
    }

    createGlyph(code: number, fg: Rgb, bg: Rgb): Glyph {
        const glyph = this.getGlyph(code);
        const imageData = new ImageData(8, this.height);
        for (let i = 0; i < glyph.length; i++) {
            const byte = glyph[i];
            for (let j = 0; j < 8; j++) {
                const bit = byte & (1 << (7 - j));
                const index = (i * 8 + j) * 4;
                if (bit) {
                    imageData.data[index] = fg.r;
                    imageData.data[index + 1] = fg.g;
                    imageData.data[index + 2] = fg.b;
                    imageData.data[index + 3] = 255;
                } else {
                    imageData.data[index] = bg.r;
                    imageData.data[index + 1] = bg.g;
                    imageData.data[index + 2] = bg.b;
                    imageData.data[index + 3] = 255;
                }
            }
        }
        return new Glyph(code, fg, bg, imageData);
    }

    createGlyphs(palette: Rgb[]): Glyph[] {
        const glyphs: Glyph[] = [];
        palette.forEach((bg) => {
            palette.forEach((fg) => {
                codes.forEach((code) => {
                    if (bg != fg) {
                        const glyph = this.createGlyph(code, fg, bg);
                        glyphs.push(glyph);
                    }
                });
            });
        });
        return glyphs;
    }
}
