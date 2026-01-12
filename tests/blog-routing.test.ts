import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getPostHref } from '../src/lib/blog';

const BLOG_PATH = path.resolve(process.cwd(), 'src/content/blog');

describe('Blog Routing Engine', () => {
  it("generates a URL directly from the post's slug frontmatter", () => {
    const raw = fs.readFileSync(path.join(BLOG_PATH, 'wing-contest-at-quarry-house.md'), 'utf-8');
    const { data } = matter(raw);
    const href = getPostHref({ data });

    // The URL should be exactly the slug from the file, prefixed with /blog/ and suffixed with /
    expect(href).toBe(`/blog/${data.slug}/`);
    expect(href).toBe('/blog/2013/05/15/wing-contest-at-quarry-house/');
  });
});
