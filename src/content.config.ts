import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { BlogSchema } from './schemas/blog';
import { RecipeSchema } from './schemas/recipe';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: BlogSchema,
});

const recipes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/recipes" }),
  schema: RecipeSchema,
});

const photos = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/photos" }),
});

export const collections = { blog, recipes, photos };
