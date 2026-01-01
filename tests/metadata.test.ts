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

describe("SEO Metadata Readiness", () => {
  it.each(files)("checking metadata for: %s", (file) => {
    const { data, content } = matter(fs.readFileSync(path.join(BLOG_PATH, file), "utf-8"));
    
    // Fallback Logic: Frontmatter description OR first 100 chars of body
    const description = data.description || content.replace(/[#*`\[\]]/g, '').trim().slice(0, 160);
    
    expect(description, `File ${file} has no description and no body content.`).toBeDefined();
    expect(description.length).toBeGreaterThan(10);
  });
});
