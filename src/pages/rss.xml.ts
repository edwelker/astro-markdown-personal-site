import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@consts';

export async function GET(context) {
  const blog = await getCollection('blog', ({ data }) => {
    return data.draft !== true;
  });

  const recipes = await getCollection('recipes', ({ data }) => {
    return data.draft !== true;
  });

  const photos = await getCollection('photos', ({ data }) => {
    return data.draft !== true;
  });

  const allItems = [
    ...blog.map((post) => ({ ...post, type: 'blog' })),
    ...recipes.map((recipe) => ({ ...recipe, type: 'recipes' })),
    ...photos.map((photo) => ({ ...photo, type: 'photos' })),
  ];

  allItems.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: context.site,
    items: allItems.map((item) => ({
      title: item.data.title,
      pubDate: item.data.date,
      description: item.data.description || '',
      link: item.type === 'blog' ? `/${item.slug}/` : `/${item.type}/${item.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
