import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getPostHref } from "../src/lib/blog";

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

describe("RSS Feed Content Integrity", () => {
  it("ensures RSS item links match our UTC routing engine", () => {
    const files = getFilesRecursively(BLOG_PATH);
    
    files.forEach(file => {
      const { data } = matter(fs.readFileSync(path.join(BLOG_PATH, file), "utf-8"));
      if (data.draft) return;

      const generatedHref = getPostHref({ data });
      
      // The RSS feed MUST NOT contain the 16th for this post
      if (file.includes("wing-contest")) {
        expect(generatedHref).toContain("/05/15/");
        expect(generatedHref).not.toContain("/05/16/");
      }

      // General format check
      expect(generatedHref).toMatch(/^\/blog\/\d{4}\/\d{2}\/\d{2}\//);
    });
  });
});
