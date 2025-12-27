import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "astro/zod";
import { BlogSchema } from "../src/schemas/blog";

const BLOG_PATH = path.resolve(process.cwd(), "src/content/blog");
const files = fs.readdirSync(BLOG_PATH).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));

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
