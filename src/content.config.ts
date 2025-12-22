import { defineCollection } from "astro:content";
import { BlogSchema } from "./schemas/blog";

const blog = defineCollection({
  // Relying on default loader for src/content/blog
  schema: BlogSchema,
});

export const collections = { blog };
