import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@consts';

export async function GET(context) {
  const blog = await getCollection('blog', ({ data }) => {
    return data.draft !== true;
  });

  blog.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || '',
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
