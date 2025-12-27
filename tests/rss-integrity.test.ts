import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getPostHref } from "../src/lib/blog";

const BLOG_PATH = path.resolve(process.cwd(), "src/content/blog");

import { glob } from "glob";

describe("RSS Feed Content Integrity", () => {
  it("ensures RSS item links match our UTC routing engine", () => {
    const files = glob.sync("**/*.{md,mdx}", { cwd: BLOG_PATH });
    
    files.forEach(file => {
      const { data } = matter(fs.readFileSync(path.join(BLOG_PATH, file), "utf-8"));
      if (data.draft) return;

      const generatedHref = getPostHref({ data });
      
      // The RSS feed MUST NOT contain the 16th for this post
      if (file.includes("wing-contest")) {
        expect(generatedHref).toContain("/05/15/");
        expect(generatedHref).not.toContain("/05/16/");
      }

      // General format check
      expect(generatedHref).toMatch(/^\/blog\/\d{4}\/\d{2}\/\d{2}\//);
    });
  });
});
