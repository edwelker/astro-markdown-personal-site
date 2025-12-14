import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@consts'; // Import your site constants

// This function is required by Astro to generate the feed.
export async function GET(context) {
  // Fetch all published blog posts (excluding drafts)
  const blog = await getCollection('blog', ({ data }) => {
    return data.draft !== true;
  });

  return rss({
    // Basics for the channel element
    title: SITE.TITLE, // Used for the <title> tag in the feed
    description: SITE.DESCRIPTION,
    site: context.site, // Uses the URL defined in your astro.config.mjs

    // Map your blog posts to the RSS item format
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date, // Make sure your blog schema includes a 'date' field
      description: post.data.description || 'No description available.',
      link: `/blog/${post.slug}`, // The full path to the post
    })),

    // Optional: Add custom data like the Atom feed link
    customData: `<language>en-us</language>`,
  });
}
