import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { BlogSchema } from './schemas/blog';
import { RecipeSchema } from './schemas/recipe';

const generateSlugId = ({ entry, data }: { entry: string; data: Record<string, unknown> }) => {
  if (typeof data.slug === 'string' && data.slug.trim()) {
    return data.slug.trim();
  }
  return entry.replace(/\.(md|mdx)$/i, '');
};

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
    generateId: generateSlugId,
  }),
  schema: BlogSchema,
});

const recipes = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/recipes',
    generateId: generateSlugId,
  }),
  schema: RecipeSchema,
});

export const collections = { blog, recipes };
