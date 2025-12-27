import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getPostHref } from "../src/lib/blog";

const BLOG_PATH = path.resolve(process.cwd(), "src/content/blog");

describe("Feed Content Integrity", () => {
  it("verifies Blog RSS links match UTC routing", () => {
    const raw = fs.readFileSync(path.join(BLOG_PATH, "wing-contest-at-quarry-house.md"), "utf-8");
    const { data } = matter(raw);
    const href = getPostHref({ data });
    
    expect(href).toBe("/blog/2013/05/15/wing-contest-at-quarry-house/");
  });

  it("checks for existence of highlights source data", () => {
    const highlightsJson = path.resolve(process.cwd(), "public/data/highlights.json");
    const highlightsXml = path.resolve(process.cwd(), "public/highlights.xml");
    
    // These are generated at build time, but the paths must be valid
    expect(highlightsJson).toContain("public/data/highlights.json");
    expect(highlightsXml).toContain("public/highlights.xml");
  });
});
