import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "astro/zod";
import { BlogSchema } from "../src/schemas/blog";

const BLOG_PATH = path.resolve(process.cwd(), "src/content/blog");
const SRC_PATH = path.resolve(process.cwd(), "src");

function getFilesRecursively(dir: string, filter: (file: string) => boolean, baseDir: string = dir): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, filter, baseDir));
    } else {
      if (filter(file)) {
        results.push(path.relative(baseDir, fullPath));
      }
    }
  }
  return results;
}

const blogFiles = getFilesRecursively(BLOG_PATH, (file) => file.endsWith('.md') || file.endsWith('.mdx'));
const srcFiles = getFilesRecursively(SRC_PATH, (file) => /\.(astro|md|mdx|ts|tsx|js|jsx)$/.test(file));

// Mock the image helper function required by the schema factory
const mockImage = () => z.any();
// Instantiate the schema
const schema = BlogSchema({ image: mockImage });

describe("Schema Compliance Audit", () => {
  it.each(blogFiles)("validating frontmatter: %s", (file) => {
    const raw = fs.readFileSync(path.join(BLOG_PATH, file), "utf-8");
    const { data } = matter(raw);
    
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const errors = result.error.format();
      console.error(`\n❌ Error in ${file}:`, JSON.stringify(errors, null, 2));
    }
    
    expect(result.success, `File ${file} does not match the schema.`).toBe(true);
  });
});

describe("Pagefind Safety Audit", () => {
  it.each(srcFiles)("ensuring no data-pagefind-body in %s", (file) => {
    const content = fs.readFileSync(path.join(SRC_PATH, file), "utf-8");
    const forbidden = "data-pagefind-body";
    
    expect(content, `Found "${forbidden}" in ${file}. Pagefind should index the whole page by default.`).not.toContain(forbidden);
  });
});
