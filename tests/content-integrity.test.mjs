import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { glob } from 'glob';

async function checkCollectionForSlugs(collection) {
  const contentDir = path.join(process.cwd(), 'src', 'content', collection);
  const files = await glob('**/*.{md,mdx}', { cwd: contentDir });
  const filesWithoutSlugs = [];

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const { data } = matter(content);

    if (!data.slug) {
      filesWithoutSlugs.push(file);
    }
  }
  return filesWithoutSlugs;
}

describe('Content Integrity', () => {
  it('ensures all blog posts have a slug', async () => {
    const filesWithoutSlugs = await checkCollectionForSlugs('blog');
    const errorMessage = `The following blog posts are missing a "slug" in their frontmatter:\n- ${filesWithoutSlugs.join('\n- ')}`;
    expect(filesWithoutSlugs.length, errorMessage).toBe(0);
  });

});
