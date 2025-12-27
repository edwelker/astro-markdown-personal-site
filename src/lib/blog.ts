export function getPostHref(post: string | { slug?: string; data?: { slug?: string } }) {
  if (typeof post === "string") {
    return `/blog/${post}/`;
  }
  const slug = post.slug || post.data?.slug;
  if (!slug) {
    throw new Error(`Post has no slug: ${JSON.stringify(post)}`);
  }
  return `/blog/${slug}/`;
}
