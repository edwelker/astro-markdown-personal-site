import rss from '@astrojs/rss';
import { SITE } from '../consts';
import { getAllActivity } from '../lib/activity';

export async function GET(context) {
  const allItems = await getAllActivity();

  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: context.site,
    items: allItems.map((item) => ({
      title: item.data.title,
      pubDate: item.data.date,
      description: item.data.description || '',
      link: item.type === 'blog' ? `/blog/${item.slug}/` : `/${item.type}/${item.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
