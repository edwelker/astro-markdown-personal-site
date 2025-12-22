export function getPostHref(id: string, date: Date) {
  const slug = id.replace(/\.[^/.]+$/, "");
  
  // If the filename already contains the year/path, use it directly
  if (slug.match(/^\d{4}\//)) {
    return `/blog/${slug}/`;
  }

  // Otherwise, generate the legacy path using UTC to avoid timezone drift
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  
  return `/blog/${y}/${m}/${d}/${slug}/`;
}
