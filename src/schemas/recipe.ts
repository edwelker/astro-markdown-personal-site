import { z } from 'zod';

export const RecipeSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  description: z.string(),
  date: z.date(),
  coverPhoto: z.string().url().or(z.string().startsWith('/')).optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  totalTime: z.string().optional(),
  recipeYield: z.string().optional(),
  recipeCategory: z.string().optional(),
  recipeCuisine: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  recipeIngredient: z.array(z.string()),
  recipeInstructions: z.array(z.string()),
  draft: z.boolean().optional(),
});
