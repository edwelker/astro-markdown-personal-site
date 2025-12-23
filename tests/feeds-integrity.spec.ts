import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Feeds & Sitemap Physical Integrity", () => {
  const distPath = path.join(process.cwd(), "dist");

  test("RSS feed exists", async () => {
    expect(fs.existsSync(path.join(distPath, "rss.xml"))).toBeTruthy();
  });

  test("Sitemap index exists", async () => {
    expect(fs.existsSync(path.join(distPath, "sitemap-index.xml"))).toBeTruthy();
  });

  test("Robots.txt exists", async () => {
    expect(fs.existsSync(path.join(distPath, "robots.txt"))).toBeTruthy();
  });
});
