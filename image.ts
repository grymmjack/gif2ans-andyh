import { Glyph } from './font.js';
import { Lab, srgbToOkLab } from './colors.js';

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

export function imageDataToLabs(imageData: ImageData): Lab[] {
    const labs: Lab[] = [];
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

function imgToCanvas(img: HTMLImageElement): HTMLCanvasElement {
    const { width, height } = img;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return canvas;
}

class ImageSection {
    constructor(
        public readonly column: number,
        public readonly row: number,
        public readonly labs: Lab[]
    ) {}

    findClosest(glyphs: Glyph[]): Glyph {
        let bestScore = Number.MAX_VALUE;
        let bestIndex = 0;
        for (const [i, glyph] of glyphs.entries()) {
            if (!glyph) continue;
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
    public readonly width: number;
    public readonly height: number;
    private readonly labs: Lab[];

    constructor(canvas: HTMLCanvasElement) {
        this.width = canvas.width;
        this.height = canvas.height;
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.labs = imageDataToLabs(imageData);
    }

    static async load(url: string): Promise<SourceImage> {
        const img = await loadImage(url);
        const canvas = imgToCanvas(img);
        return new SourceImage(canvas);
    }

    getSections(
        columns: number,
        rows: number,
        width: number,
        height: number
    ): ImageSection[] {
        const sections: ImageSection[] = [];
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const labs: Lab[] = [];
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
