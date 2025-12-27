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

describe("Strict Master Blog Schema Audit", () => {
  it.each(files)("Audit: %s", (file) => {
    const filePath = path.join(BLOG_PATH, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    
    let data;
    try {
      // Use gray-matter with explicit JS-YAML configuration
      const parsed = matter(raw);
      data = parsed.data;
    } catch (e: any) {
      // Catch specific YAML parsing errors (like unquoted colons or percent signs)
      throw new Error(
        `[YAML PARSE FAILURE] ${file}\n` +
        `Reason: ${e.reason || e.message}\n` +
        `Line: ${e.mark?.line || 'unknown'}\n` +
        `Column: ${e.mark?.column || 'unknown'}`
      );
    }
    
    if (data.draft === true) return;

    // Validate against the Zod schema
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const errorDetails = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(", ");
      throw new Error(`[SCHEMA MISMATCH] ${file}\nDetails: ${errorDetails}`);
    }

    // Basic slug format check
    expect(result.data.slug).toMatch(/^\d{4}\/\d{2}\/\d{2}\//);
  });
});
