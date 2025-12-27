import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Build Artifact Integrity", () => {
  const distPath = path.join(process.cwd(), "dist");

  it("should have generated the RSS feed", () => {
    expect(fs.existsSync(path.join(distPath, "rss.xml"))).toBe(true);
  });

  it("should have generated the Sitemap index", () => {
    expect(fs.existsSync(path.join(distPath, "sitemap-index.xml"))).toBe(true);
  });

  it("should have generated robots.txt", () => {
    expect(fs.existsSync(path.join(distPath, "robots.txt"))).toBe(true);
  });

  it("should have generated music.json", () => {
    expect(fs.existsSync(path.join(distPath, "data/music.json"))).toBe(true);
  });

  it("should have generated trakt.json", () => {
    expect(fs.existsSync(path.join(distPath, "data/trakt.json"))).toBe(true);
  });

  it("should have generated cycling.json", () => {
    expect(fs.existsSync(path.join(distPath, "data/cycling.json"))).toBe(true);
  });

  it("should have generated flickr-photos.json", () => {
    expect(fs.existsSync(path.join(distPath, "data/flickr-photos.json"))).toBe(true);
  });
});
