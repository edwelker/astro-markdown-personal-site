import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const distPath = path.join(process.cwd(), "dist");
const distExists = fs.existsSync(distPath);

// Only run these tests if the build output exists
describe.skipIf(!distExists)("Build Artifact Integrity", () => {

  it("should have generated the RSS feed", () => {
    expect(fs.existsSync(path.join(distPath, "rss.xml"))).toBe(true);
  });

  it("should have generated the Sitemap index", () => {
    expect(fs.existsSync(path.join(distPath, "sitemap-index.xml"))).toBe(true);
  });

  it("should have generated robots.txt", () => {
    expect(fs.existsSync(path.join(distPath, "robots.txt"))).toBe(true);
  });

  const dataFiles = ["music.json", "trakt.json", "cycling.json", "flickr-photos.json"];
  for (const file of dataFiles) {
    it(`should have generated ${file}`, () => {
      expect(fs.existsSync(path.join(distPath, "data", file))).toBe(true);
    });
  }
});
