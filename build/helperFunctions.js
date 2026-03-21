export const remap = (x, min1, max1, min2, max2) => {
    return ((x - min1) / (max1 - min1)) * (max2 - min2) + min2;
};
export const radians = (degrees) => {
    return (degrees * Math.PI) / 180;
};
export const degrees = (radians) => {
    return (radians * 180) / Math.PI;
};
export const round = (value, decimalPlaces) => {
    return Math.round(value * (10 ** decimalPlaces)) / (10 ** decimalPlaces);
};
export const clamp = (x, min, max) => {
    return Math.min(Math.max(x, min), max);
};
export const getAngleFromCosRule = (a, b, c) => {
    return degrees(Math.acos(clamp((c * c - a * a - b * b) / (-2 * a * b), -1, 1)));
};
const componentToHex = (c) => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};
export const rgbToHex = (r, g, b) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};
export const hexToRGB = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
export const hexToRGBA = (hex) => {
    if (hex == "0") {
        return {
            r: 0,
            g: 0,
            b: 0,
            a: 0
        };
    }
    return {
        r: parseInt(hex.slice(2, 4), 16),
        g: parseInt(hex.slice(4, 6), 16),
        b: parseInt(hex.slice(6, 8), 16),
        a: parseInt(hex.slice(0, 2), 16)
    };
};
export const lerp = (a, b, t) => {
    return a * (1 - t) + b * t;
};
export const loadStylesheet = (url) => {
    var css = document.createElement("link");
    css.href = url;
    css.type = "text/css";
    css.rel = "stylesheet";
    document.head.appendChild(css);
};
export const camelCase = (str) => {
    return str
        .split('-')
        .reduce((a, b) => a + b.charAt(0).toUpperCase() + b.slice(1));
};
