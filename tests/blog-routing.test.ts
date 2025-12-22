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
    const href = getPostHref("test-post.md", dangerDate);
    expect(href).toContain("/2013/05/16/");
  });

  it("handles legacy sub-folder slugs (YYYY/...) correctly", () => {
    const href = getPostHref("2024/01/01/post.md", new Date());
    expect(href).toBe("/blog/2024/01/01/post/");
  });

  it.each(files)("validating generated URL for: %s", (file) => {
    const raw = fs.readFileSync(path.join(BLOG_PATH, file), "utf-8");
    const { data } = matter(raw);
    const href = getPostHref(file, new Date(data.date));
    
    // Ensure every file generates a valid, deterministic URL
    expect(href).toMatch(/^\/blog\/\d{4}\/\d{2}\/\d{2}\/|^ \/blog\/\d{4}\//);
    expect(href.endsWith("/")).toBe(true);
  });

  it("specifically protects wing-contest-at-quarry-house path", () => {
    const date = new Date("2013-05-16T00:00:00Z");
    const href = getPostHref("wing-contest-at-quarry-house.md", date);
    expect(href).toBe("/blog/2013/05/16/wing-contest-at-quarry-house/");
  });
});
