import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const highlights = await getCollection('highlights');

  const sortedHighlights = highlights.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: 'Eddie Welker - Highlights',
    description: 'Recent cycling tours, music milestones, and projects.',
    site: context.site,
    items: sortedHighlights.map((item) => ({
      title: item.data.title,
      pubDate: item.data.pubDate,
      description: item.data.description,
      link: `/highlights/${item.slug}/`,
    })),
  });
}
