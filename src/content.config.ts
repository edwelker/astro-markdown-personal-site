// src/content/config.ts

import { defineCollection, z } from "astro:content";


const blog = defineCollection({
  // Removed custom loader, relying on Astro's default for src/content/blog
  schema: z.object({
    title: z.string(),

    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    categories: z.array(z.string()).optional(),

    // Existing fields
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),

    layout: z.string().optional(),
  }),
});

const highlights = defineCollection({
  // Removed custom loader, relying on Astro's default for src/content/highlights
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Changed to z.string() to fix the error in highlights.ts if you still use strings there.
    // However, if you are using 'z.coerce.date()' in blog, let's keep it here for consistency:
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    url: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
  }),
});

export const collections = { blog, highlights };
