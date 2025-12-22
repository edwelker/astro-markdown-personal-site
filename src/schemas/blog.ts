import { z } from "zod";

export const BlogSchema = z.object({
  title: z.string(),
  pubDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  categories: z.array(z.string()).optional(),
  description: z.string().optional(),
  date: z.coerce.date(),
  draft: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  layout: z.string().optional(),
  ignore_links: z.array(z.string()).optional(),
});

export type BlogFrontmatter = z.infer<typeof BlogSchema>;
