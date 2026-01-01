import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const distPath = path.join(process.cwd(), "dist");
const distExists = fs.existsSync(distPath);

// Only run these tests if the build output exists
describe.skipIf(!distExists)("Build Artifact Integrity", () => {

  describe("Core SEO Artifacts", () => {
    it("should have generated a valid RSS feed", () => {
      const rssPath = path.join(distPath, "rss.xml");
      expect(fs.existsSync(rssPath)).toBe(true);
      
      const content = fs.readFileSync(rssPath, "utf-8");
      expect(content.trim().startsWith("<?xml")).toBe(true);
      expect(content).toContain("<rss");
      expect(content).toContain("<channel>");
    });

    it("should have generated the Sitemap index", () => {
      expect(fs.existsSync(path.join(distPath, "sitemap-index.xml"))).toBe(true);
    });

    it("should have generated robots.txt", () => {
      expect(fs.existsSync(path.join(distPath, "robots.txt"))).toBe(true);
    });
  });

  describe("Data Routes & API Artifacts", () => {
    it("should have generated highlights.json", () => {
      const filePath = path.join(distPath, "data", "highlights.json");
      expect(fs.existsSync(filePath)).toBe(true);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(Array.isArray(data)).toBe(true);
    });

    it("should have generated highlights.xml", () => {
      const filePath = path.join(distPath, "highlights.xml");
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("<item"); // RSS items
    });

    it("should have generated the API documentation page", () => {
      const filePath = path.join(distPath, "api", "index.html");
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe("JSON Data Integrity", () => {
    it("should have valid music.json", () => {
      const filePath = path.join(distPath, "data", "music.json");
      expect(fs.existsSync(filePath)).toBe(true);
      
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(data).toHaveProperty("user");
      expect(data).toHaveProperty("week");
      expect(Object.keys(data).length).toBeGreaterThan(0);
    });

    it("should have valid trakt.json", () => {
      const filePath = path.join(distPath, "data", "trakt.json");
      expect(fs.existsSync(filePath)).toBe(true);
      
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(data).toHaveProperty("username");
      expect(data).toHaveProperty("allRatings");
      expect(Array.isArray(data.allRatings)).toBe(true);
      expect(data.allRatings.length).toBeGreaterThan(0);
    });

    it("should have valid cycling.json", () => {
      const filePath = path.join(distPath, "data", "cycling.json");
      expect(fs.existsSync(filePath)).toBe(true);
      
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(data).toHaveProperty("year");
      expect(data).toHaveProperty("recent");
      expect(Array.isArray(data.recent)).toBe(true);
    });

    it("should have valid flickr-photos.json", () => {
      const filePath = path.join(distPath, "data", "flickr-photos.json");
      expect(fs.existsSync(filePath)).toBe(true);
      
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(Array.isArray(data)).toBe(true);
    });

    it("should have valid gas.json", () => {
      const filePath = path.join(distPath, "data", "gas.json");
      expect(fs.existsSync(filePath)).toBe(true);
      
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(data).toHaveProperty("md");
      expect(data).toHaveProperty("ny");
      expect(data).toHaveProperty("ma");
      expect(Array.isArray(data.md)).toBe(true);
      expect(Array.isArray(data.ny)).toBe(true);
      expect(Array.isArray(data.ma)).toBe(true);
    });
  });
});
