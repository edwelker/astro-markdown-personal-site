import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const highlights = defineCollection({
  // We point the loader to the new 'highlights' folder
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/highlights" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    // The new field for linking directly to Google Photos/GitHub
    url: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, highlights };
