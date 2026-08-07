export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? '';

  const lastDot = base.lastIndexOf('.');
  const hasExt = lastDot > 0 && lastDot < base.length - 1;
  const name = hasExt ? base.slice(0, lastDot) : base;
  const ext = hasExt ? base.slice(lastDot + 1) : '';

  const cleanName = name
    .normalize('NFC')
    .replace(/[\p{Cc}\p{Cf}]+/gu, '')
    .replace(/[^\p{L}\p{N}._ -]+/gu, '-')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .replace(/^[-.\s]+|[-.\s]+$/g, '')
    .trim();

  const cleanExt = ext
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .toLowerCase();

  const safeName = cleanName || 'file';
  const truncated = safeName.slice(0, 100);

  return cleanExt ? `${truncated}.${cleanExt}` : truncated;
}
