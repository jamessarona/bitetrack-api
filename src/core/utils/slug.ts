export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function withUniqueSuffix(baseSlug: string, suffix: string): string {
  const trimmed = baseSlug.length > 0 ? baseSlug : 'business';
  return `${trimmed}-${suffix.slice(0, 8)}`;
}
