import { imageDataToLabs } from './image.js';
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
        const glyph = this.glyphs.slice(index * 16, (index + 1) * 16);
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
                    imageData.data[index + 1] = fg.b;
                    imageData.data[index + 2] = fg.g;
                    imageData.data[index + 3] = 255;
                }
                else {
                    imageData.data[index] = bg.r;
                    imageData.data[index + 1] = bg.b;
                    imageData.data[index + 2] = bg.g;
                    imageData.data[index + 3] = 255;
                }
            }
        }
        return new Glyph(code, fg, bg, imageData);
    }
    createGlyphs(palette) {
        const glyphs = [];
        for (let bg = 0; bg < 16; bg++) {
            for (let fg = 0; fg < 16; fg++) {
                for (let code = 0; code < 256; code++) {
                    const fgColor = palette[fg];
                    const bgColor = palette[bg];
                    const glyph = this.createGlyph(code, fgColor, bgColor);
                    glyphs.push(glyph);
                }
            }
        }
        return glyphs;
    }
}
