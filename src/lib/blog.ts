export function getPostHref(slug: string, date: Date) {
  // Ensure we don't have a file extension in the URL
  const cleanSlug = (slug || "").replace(/\.md$/, '');

  // If the slug already contains the year/path, use it directly
  if (cleanSlug.match(/^\d{4}\//)) {
    return `/blog/${cleanSlug}/`;
  }

  // Otherwise, generate the legacy path using UTC to avoid timezone drift
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  
  return `/blog/${y}/${m}/${d}/${cleanSlug}/`;
}
