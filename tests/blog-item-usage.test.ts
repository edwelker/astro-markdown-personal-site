import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const FILES_TO_CHECK = [
  'src/pages/blog/index.astro',
  'src/pages/tags/[tag].astro',
  'src/components/TeaserBlogList.astro',
];

describe('BlogItem Usage Consistency', () => {
  FILES_TO_CHECK.forEach((filePath) => {
    it(`${filePath} should import and use BlogItem`, () => {
      const fullPath = path.resolve(process.cwd(), filePath);

      if (!fs.existsSync(fullPath)) {
        // Skip if file doesn't exist in the current environment
        return;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');

      // 1. Check for the import statement
      // Matches: import BlogItem from "@components/BlogItem.astro";
      const importRegex = /import\s+BlogItem\s+from\s+["']@components\/BlogItem\.astro["']/;
      const hasImport = importRegex.test(content);

      // 2. Check for the component usage in the template
      // Matches: <BlogItem ... />
      const usageRegex = /<BlogItem/;
      const hasUsage = usageRegex.test(content);

      expect(hasImport, `${filePath} is missing import of BlogItem`).toBe(true);
      expect(hasUsage, `${filePath} is not using <BlogItem /> component`).toBe(true);
    });
  });
});
