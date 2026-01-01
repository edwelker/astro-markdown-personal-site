import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

function getFilesRecursively(dir, baseDir = dir) {
  let results = [];
  if (!fsSync.existsSync(dir)) return [];
  const list = fsSync.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fsSync.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, baseDir));
    } else {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        results.push(path.relative(baseDir, fullPath));
      }
    }
  }
  return results;
}

async function checkCollectionForSlugs(collection) {
  const contentDir = path.join(process.cwd(), 'src', 'content', collection);
  const files = getFilesRecursively(contentDir);
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
