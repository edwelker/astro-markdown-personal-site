import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "astro/zod";
import { BlogSchema } from "../src/schemas/blog";

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

// Mock the image helper function required by the schema factory
const mockImage = () => z.any();
// Instantiate the schema
const schema = BlogSchema({ image: mockImage });

describe("Schema Compliance Audit", () => {
  it.each(files)("validating frontmatter: %s", (file) => {
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
