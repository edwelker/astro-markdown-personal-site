import { describe, it, expect } from 'vitest';
import { RecipeSchema } from '../src/schemas/recipe';

describe('Recipe Schema', () => {
  it('validates a correct recipe', () => {
    const validRecipe = {
      title: 'Test Recipe',
      description: 'A tasty test',
      date: new Date(),
      recipeIngredient: ['Ingredient 1', 'Ingredient 2'],
      recipeInstructions: ['Step 1', 'Step 2'],
    };

    const result = RecipeSchema.safeParse(validRecipe);
    expect(result.success).toBe(true);
  });

  it('validates a full recipe with optional fields', () => {
    const fullRecipe = {
      title: 'Full Recipe',
      slug: 'full-recipe',
      description: 'Everything included',
      date: new Date(),
      coverPhoto: 'https://example.com/photo.jpg',
      prepTime: '10m',
      cookTime: '20m',
      totalTime: '30m',
      recipeYield: '4 servings',
      recipeCategory: 'Dinner',
      recipeCuisine: 'American',
      keywords: ['tasty', 'food'],
      recipeIngredient: ['Item'],
      recipeInstructions: ['Do it'],
      draft: false,
    };

    const result = RecipeSchema.safeParse(fullRecipe);
    expect(result.success).toBe(true);
  });

  it('fails on missing required fields', () => {
    const invalidRecipe = {
      title: 'Bad Recipe',
      // missing description, date, ingredients, instructions
    };

    const result = RecipeSchema.safeParse(invalidRecipe);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.description).toBeDefined();
      expect(errors.date).toBeDefined();
      expect(errors.recipeIngredient).toBeDefined();
      expect(errors.recipeInstructions).toBeDefined();
    }
  });

  it('validates coverPhoto format', () => {
    const badUrl = {
      title: 'Test',
      description: 'Desc',
      date: new Date(),
      recipeIngredient: ['a'],
      recipeInstructions: ['b'],
      coverPhoto: 'not-a-url-or-path',
    };

    const result = RecipeSchema.safeParse(badUrl);
    expect(result.success).toBe(false);
  });

  it('allows relative path for coverPhoto', () => {
    const relativePhoto = {
      title: 'Test',
      description: 'Desc',
      date: new Date(),
      recipeIngredient: ['a'],
      recipeInstructions: ['b'],
      coverPhoto: '/images/recipe.jpg',
    };

    const result = RecipeSchema.safeParse(relativePhoto);
    expect(result.success).toBe(true);
  });
});
