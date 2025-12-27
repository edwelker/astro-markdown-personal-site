import { defineCollection } from "astro:content";
import { BlogSchema } from "@schemas/blog";
import { RecipeSchema } from "@schemas/recipe";

const blog = defineCollection({
  type: 'content',
  schema: BlogSchema,
});

const recipes = defineCollection({
  type: 'content',
  schema: RecipeSchema,
});

export const collections = { blog, recipes };
