import { getCollection } from 'astro:content';

export async function getAllActivity() {
  const blog = await getCollection('blog', ({ data }) => {
    return data.draft !== true;
  });

  const recipes = await getCollection('recipes', ({ data }) => {
    return data.draft !== true;
  });

  let photos = [];
  try {
    photos = await getCollection('photos', ({ data }) => {
      return data.draft !== true;
    });
  } catch (e) {
    // Collection might not exist
  }

  const allItems = [
    ...blog.map((post) => ({ ...post, type: 'blog' })),
    ...recipes.map((recipe) => ({ ...recipe, type: 'recipes' })),
    ...photos.map((photo) => ({ ...photo, type: 'photos' })),
  ];

  allItems.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return allItems;
}
