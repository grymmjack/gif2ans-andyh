import { C64Palette, CGAPalette } from './colors.js';
import { Font } from './font.js';
import { SourceImage } from './image.js';

// const font = await Font.load('./PETSCII_unshifted.F08');
// const glyphs = font.createGlyphs(C64Palette);

const font = await Font.load('./CP437.F08');
const glyphs = font.createGlyphs(CGAPalette);

const source = await SourceImage.load('./Gnoll.gif');
const columns = 33;
const rows = Math.floor(
    source.height / (font.height / font.width) / (source.width / columns)
);
const sections = source.getSections(columns, rows, font.width, font.height);

const output = document.createElement('canvas');
output.width = columns * font.width;
output.height = rows * font.height;
document.body.appendChild(output);
const ctx = output.getContext('2d')!;

for (const section of sections) {
    const glyph = section.findClosest(glyphs);
    ctx.putImageData(
        glyph.imageData,
        section.column * font.width,
        section.row * font.height
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

function saveCanvas(canvas: HTMLCanvasElement, name: string) {
    const link = document.createElement('a');
    link.download = name;
    link.href = canvas.toDataURL();
    link.click();
}

saveCanvas(output, 'output.png');
