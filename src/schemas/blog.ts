import { z } from "astro/zod";

export const BlogSchema = ({ image }) => z.object({
  title: z.string(),
  date: z.coerce.date(),
  pubDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  categories: z.array(z.string()).optional(),
  description: z.string().optional(),
  draft: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  
  // Strictly use coverImage
  coverImage: z.union([image(), z.string()]).optional(),
  coverImageAlt: z.string().optional(),
  
  layout: z.string().optional(),
  ignore_links: z.array(z.string()).optional(),
  slug: z.string().optional(),
});
