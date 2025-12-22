import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { BlogSchema } from "../src/schemas/blog";

const BLOG_PATH = path.resolve(process.cwd(), "src/content/blog");
const files = fs.readdirSync(BLOG_PATH).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));

describe("Master Blog Schema Audit", () => {
  it.each(files)("Audit: %s", (file) => {
    const filePath = path.join(BLOG_PATH, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    
    if (data.draft) return;

    // 1. Zod Validation
    const result = BlogSchema.safeParse(data);
    if (!result.success) {
      const errorDetails = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(", ");
      throw new Error(`[Schema Mismatch] ${errorDetails}`);
    }

    // Use the parsed data from Zod (which coerces the date correctly)
    const validatedData = result.data;
    const dateObj = new Date(validatedData.date);
    
    // 2. Slug-to-Date Consistency Check (UTC based)
    const y = dateObj.getUTCFullYear();
    const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getUTCDate()).padStart(2, '0');
    const expectedPrefix = `${y}/${m}/${d}/`;

    if (!validatedData.slug.startsWith(expectedPrefix)) {
      throw new Error(
        `[Slug Drift] Slug "${validatedData.slug}" mismatch.\n` +
        `Date evaluates to: ${expectedPrefix}\n` +
        `Required Frontmatter: slug: "${expectedPrefix}${path.parse(file).name}"`
      );
    }

    // 3. Title Check
    expect(validatedData.title.length).toBeGreaterThan(0);
  });
});
