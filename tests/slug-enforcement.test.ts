import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_PATH = path.resolve(process.cwd(), "src/content/blog");

function getFilesRecursively(dir: string, baseDir: string = dir): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
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

const files = getFilesRecursively(BLOG_PATH);

describe("Frontmatter Slug Enforcement", () => {
  it("requires a hardcoded slug for posts not using the date-folder naming convention", () => {
    files.forEach(file => {
      const raw = fs.readFileSync(path.join(BLOG_PATH, file), "utf-8");
      const { data } = matter(raw);
      
      if (data.draft) return;

      // Rule: If filename is NOT YYYY/MM/DD/slug.md, it MUST have a frontmatter slug
      const isDatePath = file.match(/^\d{4}\/\d{2}\/\d{2}\//);
      
      if (!isDatePath) {
        expect(data.slug, 
          `FAIL: ${file} is missing a hardcoded slug. Please add 'slug: YYYY/MM/DD/filename' to frontmatter.`
        ).toBeDefined();

        // Ensure the slug matches the required legacy pattern
        expect(data.slug).toMatch(/^\d{4}\/\d{2}\/\d{2}\//);
      }
    });
  });
});
