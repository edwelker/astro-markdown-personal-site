import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 1. The Default Blog Collection (Keep this, it came with the theme)
const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			date: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
		}).transform((post) => ({
            ...post,
            pubDate: post.date
        })),
});

// 2. YOUR HUGO POSTS COLLECTION
const posts = defineCollection({
    // Point this to your posts folder
    loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),

    schema: z.object({
        // Force the date to be a real Date object so .toDateString() and Sorting works
        date: z.coerce.date(),
    }).passthrough(),
    // ^^^ .passthrough() is the magic. It says "Validate the date, but let
    // all other fields (title, image, tags) pass through without error."
});

// 3. Export BOTH
export const collections = { blog, posts };
