import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getPostHref } from "../src/lib/blog";

const BLOG_PATH = path.resolve(process.cwd(), "src/content/blog");
const files = fs.readdirSync(BLOG_PATH).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));

describe("Blog Routing Engine", () => {
  it("forces UTC dates regardless of local timezone", () => {
    const dangerDate = new Date("2013-05-16T00:00:00Z");
    const href = getPostHref("wing-contest-at-quarry-house.md", dangerDate);
    expect(href).toBe("/blog/2013/05/16/wing-contest-at-quarry-house/");
  });

  it("handles modern files like panda_gourmet with full date paths", () => {
    const date = new Date("2025-03-22T00:00:00Z");
    const href = getPostHref("panda_gourmet_mar_2025.md", date);
    expect(href).toBe("/blog/2025/03/22/panda_gourmet_mar_2025/");
  });

  it("verifies legacy sub-folder slugs (YYYY/...) remain stable", () => {
    const href = getPostHref("2024/01/01/old-post.md", new Date());
    expect(href).toBe("/blog/2024/01/01/old-post/");
  });

  describe("Bulk Integrity Check", () => {
    it.each(files)("validating generated URL for: %s", (file) => {
      const raw = fs.readFileSync(path.join(BLOG_PATH, file), "utf-8");
      const { data } = matter(raw);
      
      const date = new Date(data.date);
      expect(!isNaN(date.getTime()), `Invalid date in ${file}`).toBe(true);

      const href = getPostHref(file, date);
      
      // Strict format check: must start with /blog/, end with /, and have a year
      expect(href).toMatch(/^\/blog\/\d{4}\//);
      expect(href.endsWith("/")).toBe(true);
      
      // Ensure no double slashes (other than the leading one)
      expect(href.substring(1)).not.toContain("//");
    });
  });
});
