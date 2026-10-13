import { getCollection } from 'astro:content';

export async function getAllActivity() {
  const blog = await getCollection('blog', ({ data }) => {
    return data.draft !== true;
  });

  const recipes = await getCollection('recipes', ({ data }) => {
    return data.draft !== true;
  });

  const allItems = [
    ...blog.map((post) => ({ ...post, type: 'blog' })),
    ...recipes.map((recipe) => ({ ...recipe, type: 'recipes' })),
  ];

  allItems.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return allItems;
}
