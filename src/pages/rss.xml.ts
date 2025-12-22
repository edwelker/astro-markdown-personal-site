import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@consts';
import { getPostHref } from '@lib/blog';

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
      link: getPostHref(post.id, post.data.date),
    })),
    customData: `<language>en-us</language>`,
  });
}
