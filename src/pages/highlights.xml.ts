import rss from '@astrojs/rss';
import highlightsData from '../data/highlights.json';

export async function GET(context: any) {
  // Sort by date: latest first
  const sortedHighlights = highlightsData
    .filter(item => !item.draft)
    .sort((a, b) => {
      const aDate = new Date(a.pubDate).valueOf();
      const bDate = new Date(b.pubDate).valueOf();
      return bDate - aDate;
    });

  return rss({
    title: 'Eddie Welker - Highlights',
    description: 'Recent cycling tours, music milestones, and projects.',
    site: context.site || 'https://eddiewelker.com',
    items: sortedHighlights.map((item) => ({
      title: item.title,
      pubDate: new Date(item.pubDate),
      description: item.description,
      link: `/highlights/${item.slug || item.id}/`,
    })),
  });
}
