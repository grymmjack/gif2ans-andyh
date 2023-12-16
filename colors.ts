export interface Rgb {
    r: number;
    g: number;
    b: number;
}

export class Lab {
    constructor(
        public readonly l: number,
        public readonly a: number,
        public readonly b: number
    ) {}

    distance(other: Lab): number {
        const dl = this.l - other.l;
        const da = this.a - other.a;
        const db = this.b - other.b;
        return Math.sqrt(dl * dl + da * da + db * db);
    }
}

function toLinearRGB(srgb: Rgb): Rgb {
    function linearTransform(value: number): number {
        if (value >= 0.04045) {
            return Math.pow((value + 0.055) / (1.0 + 0.055), 2.4);
        } else {
            return value / 12.92;
        }
    }
    const r = linearTransform(srgb.r / 255.0);
    const g = linearTransform(srgb.g / 255.0);
    const b = linearTransform(srgb.b / 255.0);
    return { r, g, b };
}

function toOkLab(lrgb: Rgb): Lab {
    const l = Math.cbrt(
        0.4122214708 * lrgb.r + 0.5363325363 * lrgb.g + 0.0514459929 * lrgb.b
    );
    const m = Math.cbrt(
        0.2119034982 * lrgb.r + 0.6806995451 * lrgb.g + 0.1073969566 * lrgb.b
    );
    const s = Math.cbrt(
        0.0883024619 * lrgb.r + 0.2817188376 * lrgb.g + 0.6299787005 * lrgb.b
    );
    return new Lab(
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    );
}

function okLabtoLrgb(lab: Lab): Rgb {
    const l = Math.pow(
        lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b,
        3.0
    );
    const m = Math.pow(
        lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b,
        3.0
    );
    const s = Math.pow(lab.l - 0.0894841775 * lab.a - 1.291485548 * lab.b, 3.0);
    return {
        r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    };
}

function linearRgbToSrgb(lrgb: Rgb): Rgb {
    function transferFunction(value: number): number {
        if (value >= 0.0031308) {
            return 1.055 * Math.pow(value, 1.0 / 2.4) - 0.055;
        } else {
            return 12.92 * value;
        }
    }
    const r = Math.round(transferFunction(lrgb.r) * 255.0);
    const g = Math.round(transferFunction(lrgb.g) * 255.0);
    const b = Math.round(transferFunction(lrgb.b) * 255.0);
    return { r, g, b };
}

export function srgbToOkLab(srgb: Rgb): Lab {
    return toOkLab(toLinearRGB(srgb));
}

export function okLabtoSrgb(lab: Lab): Rgb {
    return linearRgbToSrgb(okLabtoLrgb(lab));
}

export const C64Palette: Rgb[] = [
    { r: 0, g: 0, b: 0 },
    { r: 255, g: 255, b: 255 },
    { r: 136, g: 0, b: 0 },
    { r: 170, g: 255, b: 238 },
    { r: 204, g: 68, b: 204 },
    { r: 0, g: 204, b: 85 },
    { r: 0, g: 0, b: 170 },
    { r: 238, g: 238, b: 119 },
    { r: 221, g: 136, b: 85 },
    { r: 102, g: 68, b: 0 },
    { r: 255, g: 119, b: 119 },
    { r: 51, g: 51, b: 51 },
    { r: 119, g: 119, b: 119 },
    { r: 170, g: 255, b: 102 },
    { r: 0, g: 136, b: 255 },
    { r: 187, g: 187, b: 187 },
];

export const CGAPalette: Rgb[] = [
    { r: 0, g: 0, b: 0 },
    { r: 0, g: 0, b: 170 },
    { r: 0, g: 170, b: 0 },
    { r: 0, g: 170, b: 170 },
    { r: 170, g: 0, b: 0 },
    { r: 170, g: 0, b: 170 },
    { r: 170, g: 85, b: 0 },
    { r: 170, g: 170, b: 170 },
    { r: 85, g: 85, b: 85 },
    { r: 85, g: 85, b: 255 },
    { r: 85, g: 255, b: 85 },
    { r: 85, g: 255, b: 255 },
    { r: 255, g: 85, b: 85 },
    { r: 255, g: 85, b: 255 },
    { r: 255, g: 255, b: 85 },
    { r: 255, g: 255, b: 255 },
];
