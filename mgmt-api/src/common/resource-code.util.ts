const CODE_PATTERN = /^[a-z]+(?:-[a-z]+)*$/;

export function isValidResourceCode(value: string | null | undefined): boolean {
  return !!value && CODE_PATTERN.test(String(value).trim());
}

export function alphaFromInt(value: number): string {
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

export function slugifyLetters(value: string | null | undefined, fallback: string): string {
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

export function buildResourceCode(prefix: string, preferred: string | null | undefined, entityId: number): string {
  return `${slugifyLetters(preferred, prefix)}-${alphaFromInt(entityId)}`;
}
