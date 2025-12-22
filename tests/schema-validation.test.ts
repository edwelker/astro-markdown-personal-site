import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { BlogSchema } from "../src/schemas/blog";

const BLOG_PATH = path.resolve(process.cwd(), "src/content/blog");
const files = fs.readdirSync(BLOG_PATH).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));

function getSuggestedSlug(file: string, dateStr: any) {
  const date = new Date(dateStr);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const fileName = path.parse(file).name;
  return `${y}/${m}/${d}/${fileName}`;
}

describe("Frontmatter Zod Validation", () => {
  it.each(files)("Check: %s", (file) => {
    const raw = fs.readFileSync(path.join(BLOG_PATH, file), "utf-8");
    const { data } = matter(raw);
    
    if (data.draft) return;

    const result = BlogSchema.safeParse(data);
    
    if (!result.success) {
      const isMissingSlug = result.error.issues.some(i => i.path.includes('slug'));
      let suggestion = "";
      
      if (isMissingSlug && data.date) {
        suggestion = `\n    Suggested fix: slug: ${getSuggestedSlug(file, data.date)}`;
      }

      const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(", ");
      throw new Error(`[${file}] ${issues}${suggestion}`);
    }

    expect(result.success).toBe(true);
  });
});
