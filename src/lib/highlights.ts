// src/lib/highlights.ts
import { getCollection } from "astro:content";
import { ALBUMS } from "../data/albums";

// Define a unified shape for the frontend
export interface HighlightItem {
  title: string;
  description: string;
  date: Date;
  url: string;        // External link (if album) OR internal path (if story)
  isExternal: boolean; // Helper for target="_blank"
}

export async function getAllHighlights(): Promise<HighlightItem[]> {
  // 1. Fetch Markdown Stories
  const stories = await getCollection("highlights");

  const formattedStories: HighlightItem[] = stories
    .filter(item => !item.data.draft)
    .map(item => ({
      title: item.data.title,
      description: item.data.description,
      date: item.data.date,
      // Use explicit URL if provided in frontmatter, otherwise generate internal slug
      url: item.data.url || `/highlights/${item.id}/`,
      isExternal: !!item.data.url
    }));

  // 2. Fetch JSON Albums
  const formattedAlbums: HighlightItem[] = ALBUMS.map(album => ({
    ...album,
    isExternal: true
  }));

  // 3. Merge and Sort
  const allItems = [...formattedStories, ...formattedAlbums];

  return allItems.sort((a, b) => b.date.valueOf() - a.date.valueOf());
}
