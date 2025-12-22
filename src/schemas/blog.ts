import { z } from "zod";

export const BlogSchema = z.object({
  title: z.string(),
  slug: z.string().regex(/^\d{4}\/\d{2}\/\d{2}\//, {
    message: "Slug must be hardcoded in YYYY/MM/DD/slug format to prevent UTC drift."
  }).optional(),
  date: z.coerce.date(),
  pubDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  categories: z.array(z.string()).optional(),
  description: z.string().optional(),
  draft: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  layout: z.string().optional(),
  ignore_links: z.array(z.string()).optional(),
});

export type BlogFrontmatter = z.infer<typeof BlogSchema>;
