import rss from '@astrojs/rss';
import { highlights } from '../data/highlights';

export async function GET(context: any) {
  const sortedHighlights = [...highlights].sort((a, b) => {
    return new Date(b.date).valueOf() - new Date(a.date).valueOf();
  });

  return rss({
    title: 'Eddie Welker - Highlights',
    description: 'Significant milestones in cycling, music, and software.',
    site: context.site || 'https://eddiewelker.com',
    items: sortedHighlights.map((item) => ({
      title: item.title,
      pubDate: new Date(item.date),
      description: item.description,
      link: item.url,
      // You can inject the 'thought' field into the description if desired
      content: item.thought ? `<div>${item.thought}</div>` : '',
    })),
  });
}
