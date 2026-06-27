/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Auto-generate slug from title if slug is empty
 */
export function ensureSlug(slug: string, title: string, isNew: boolean = false): string {
  if (slug && slug.trim()) {
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
    if (cleanSlug) return cleanSlug;
  }
  const generated = generateSlug(title);
  if (!generated) return 'blog-post';
  if (isNew) {
    const timestamp = Date.now().toString(36).slice(-4);
    return `${generated}-${timestamp}`;
  }
  return generated;
}
