import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { glob } from "glob";

const BLOG_PATH = path.resolve(process.cwd(), "src/content/blog");
const files = glob.sync("**/*.{md,mdx}", { cwd: BLOG_PATH });

describe("SEO Metadata Readiness", () => {
  it.each(files)("checking metadata for: %s", (file) => {
    const { data, content } = matter(fs.readFileSync(path.join(BLOG_PATH, file), "utf-8"));
    
    // Fallback Logic: Frontmatter description OR first 100 chars of body
    const description = data.description || content.replace(/[#*`\[\]]/g, '').trim().slice(0, 160);
    
    expect(description, `File ${file} has no description and no body content.`).toBeDefined();
    expect(description.length).toBeGreaterThan(10);
  });
});
