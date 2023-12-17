import { imageDataToLabs } from './image.js';
// const codes: number[] = [176, 177, 178, 219, 220, 221, 222, 223];
const codes = [];
for (let i = 0; i < 256; i++) {
    if (i == 9 || i == 10 || i == 13 || i == 26)
        continue;
    codes.push(i);
}
export class Glyph {
    code;
    fg;
    bg;
    imageData;
    labs;
    constructor(code, fg, bg, imageData) {
        this.code = code;
        this.fg = fg;
        this.bg = bg;
        this.imageData = imageData;
        this.labs = imageDataToLabs(imageData);
    }
    score(labs) {
        let score = 0;
        for (const [i, lab] of labs.entries()) {
            const glyphLab = this.labs[i];
            score += lab.distance(glyphLab);
        }
        return score / labs.length;
    }
}
export class Font {
    glyphs;
    width = 8;
    height;
    constructor(glyphs) {
        this.glyphs = glyphs;
        this.height = glyphs.length / 256;
    }
    getGlyph(index) {
        const glyph = this.glyphs.slice(index * this.height, (index + 1) * this.height);
        return glyph;
    }
    static async load(url) {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const array = new Uint8ClampedArray(buffer);
        return new Font(array);
    }
    createGlyph(code, fg, bg) {
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
                }
                else {
                    imageData.data[index] = bg.r;
                    imageData.data[index + 1] = bg.g;
                    imageData.data[index + 2] = bg.b;
                    imageData.data[index + 3] = 255;
                }
            }
        }
        return new Glyph(code, fg, bg, imageData);
    }
    createGlyphs(palette) {
        const glyphs = [];
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
