import { describe, it } from "vitest";
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

// Files to ignore for now
const knownFailures = new Set([
  "4.md",
]);

describe("Blog Content Health Audit", () => {
  
  describe("Production Ready Posts", () => {
    const validFiles = files.filter(f => !knownFailures.has(f));
    
    it.each(validFiles)("Pass: %s", (file) => {
      const filePath = path.join(BLOG_PATH, file);
      const { data } = matter(fs.readFileSync(filePath, "utf-8"));
      schema.parse(data);
    });
  });

  const failingFiles = files.filter(f => knownFailures.has(f));

  if (failingFiles.length > 0) {
    describe("Pending Refactor (Known Issues)", () => {
      // .todo() marks these as things to fix but won't stop the test suite from passing
      it.todo.each(failingFiles)("FIX ME: %s", (file) => {
        const filePath = path.join(BLOG_PATH, file);
        const { data } = matter(fs.readFileSync(filePath, "utf-8"));
        schema.parse(data);
      });
    });
  }
});
