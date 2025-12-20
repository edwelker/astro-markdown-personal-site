import rss from '@astrojs/rss';
import { highlights, type Highlight } from '../data/highlights';

export async function GET(context: any) {
  // Sort the highlights by date: latest first
  const sortedHighlights = [...highlights].sort((a, b) => {
    return new Date(b.date).valueOf() - new Date(a.date).valueOf();
  });

  return rss({
    title: 'Eddie Welker - Highlights',
    description: 'Significant milestones in cycling, music, and software.',
    site: context.site || 'https://eddiewelker.com',
    items: sortedHighlights.map((item: Highlight) => ({
      title: item.title,
      pubDate: new Date(item.date),
      description: item.description,
      link: item.url,
    })),
  });
}
