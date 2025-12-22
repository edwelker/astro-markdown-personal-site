import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getPostHref } from "../src/lib/blog";

const BLOG_PATH = path.resolve(process.cwd(), "src/content/blog");

describe("RSS Feed Content Integrity", () => {
  it("ensures RSS item links match our UTC routing engine", () => {
    const files = fs.readdirSync(BLOG_PATH).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));
    
    files.forEach(file => {
      const { data } = matter(fs.readFileSync(path.join(BLOG_PATH, file), "utf-8"));
      if (data.draft) return;

      const date = new Date(data.date);
      const generatedHref = getPostHref(file, date);
      
      // The RSS feed MUST NOT contain the 15th for posts that drift to the 16th
      if (file.includes("wing-contest")) {
        expect(generatedHref).toContain("/05/16/");
        expect(generatedHref).not.toContain("/05/15/");
      }

      // General format check
      expect(generatedHref).toMatch(/^\/blog\/\d{4}\/\d{2}\/\d{2}\//);
    });
  });
});
