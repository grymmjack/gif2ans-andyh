import { srgbToOkLab } from './colors.js';
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
export function imageDataToLabs(imageData) {
    const labs = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const srgb = { r, g, b };
        const lab = srgbToOkLab(srgb);
        labs.push(lab);
    }
    return labs;
}
function imgToCanvas(img) {
    const { width, height } = img;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
}
class ImageSection {
    column;
    row;
    labs;
    constructor(column, row, labs) {
        this.column = column;
        this.row = row;
        this.labs = labs;
    }
    findClosest(glyphs) {
        let bestScore = Number.MAX_VALUE;
        let bestIndex = 0;
        for (const [i, glyph] of glyphs.entries()) {
            if (!glyph)
                continue;
            const score = glyph.score(this.labs);
            if (score < bestScore) {
                bestScore = score;
                bestIndex = i;
            }
        }
        return glyphs[bestIndex];
    }
}
export class SourceImage {
    width;
    height;
    labs;
    constructor(canvas) {
        this.width = canvas.width;
        this.height = canvas.height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.labs = imageDataToLabs(imageData);
    }
    static async load(url) {
        const img = await loadImage(url);
        const canvas = imgToCanvas(img);
        return new SourceImage(canvas);
    }
    getSections(columns, rows, width, height) {
        const sections = [];
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const labs = [];
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const sourceX = column * width + x;
                        const sourceY = row * height + y;
                        const fx = sourceX / (columns * width);
                        const fy = sourceY / (rows * height);
                        const px = Math.floor(fx * this.width);
                        const py = Math.floor(fy * this.height);
                        const index = py * this.width + px;
                        labs.push(this.labs[index]);
                    }
                }
                const section = new ImageSection(column, row, labs);
                sections.push(section);
            }
        }
        return sections;
    }
}
