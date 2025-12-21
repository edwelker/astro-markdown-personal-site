// transformFlickrData: Takes raw JSON, returns clean array.
// This is a "Pure Function" with no side effects.
export function transformFlickrData(apiResponse) {
  // Use optional chaining (?.) and nullish coalescing (??) for safety.
  // This handles cases where the API might return null or an empty structure.
  const rawPhotos = apiResponse?.photos?.photo ?? [];

  // Map each raw photo object into our internal, clean schema.
  return rawPhotos.map(p => ({
    id: p.id,
    // Provide a fallback title if the field is missing.
    title: p.title || 'Untitled Photo',
    // Choose the medium URL first, then large, then empty string.
    src: p.url_m ?? p.url_l ?? '',
    date: p.datetaken ?? '',
    // Convert space-separated string "tag1 tag2" into a proper Array.
    tags: p.tags ? p.tags.split(' ') : []
  }));
}
