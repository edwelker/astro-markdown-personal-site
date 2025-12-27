import { defineCollection } from "astro:content";
import { glob } from 'astro/loaders';
import { BlogSchema } from "./src/schemas/blog";

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: BlogSchema,
});

export const collections = { blog };
