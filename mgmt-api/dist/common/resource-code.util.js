"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidResourceCode = isValidResourceCode;
exports.alphaFromInt = alphaFromInt;
exports.slugifyLetters = slugifyLetters;
exports.buildResourceCode = buildResourceCode;
const CODE_PATTERN = /^[a-z]+(?:-[a-z]+)*$/;
function isValidResourceCode(value) {
    return !!value && CODE_PATTERN.test(String(value).trim());
}
function alphaFromInt(value) {
    if (!Number.isFinite(value) || value <= 0) {
        return 'a';
    }
    let current = Math.floor(value);
    let result = '';
    while (current > 0) {
        current -= 1;
        const remainder = current % 26;
        result = String.fromCharCode(97 + remainder) + result;
        current = Math.floor(current / 26);
    }
    return result;
}
function slugifyLetters(value, fallback) {
    const normalized = (value || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-');
    const fallbackValue = String(fallback || 'resource')
        .toLowerCase()
        .replace(/[^a-z]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-') || 'resource';
    return normalized || fallbackValue;
}
function buildResourceCode(prefix, preferred, entityId) {
    return `${slugifyLetters(preferred, prefix)}-${alphaFromInt(entityId)}`;
}
//# sourceMappingURL=resource-code.util.js.map