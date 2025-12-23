import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Feeds & Sitemap Physical Integrity", () => {
  // process.cwd() points to your project root
  const distPath = path.join(process.cwd(), "dist");

  test("RSS feed exists", async () => {
    const exists = fs.existsSync(path.join(distPath, "rss.xml"));
    expect(exists, "rss.xml missing from dist").toBeTruthy();
  });

  test("Sitemap index exists", async () => {
    const exists = fs.existsSync(path.join(distPath, "sitemap-index.xml"));
    expect(exists, "sitemap-index.xml missing from dist").toBeTruthy();
  });

  test("Robots.txt exists", async () => {
    const exists = fs.existsSync(path.join(distPath, "robots.txt"));
    expect(exists, "robots.txt missing from dist").toBeTruthy();
  });
});
