export interface Highlight {
  title: string;
  description: string;
  url: string;
  date: string;
  thought?: string;
  type?: 'code' | 'photos' | 'video' | 'music';
  /**
   * Optional: Manually provide an image URL.
   * If provided, the automatic Google Photos scraper will be skipped.
   */
  image?: string;
}

export const highlights: Highlight[] = [
  {
    title: "Personal Website Github Repo",
    description: "This site's github repo. My website and sandbox for to play around in. After butting heads with other clunky platforms, I found Astro, a tool that I quite like. It works more-or-less the way I think (except it's in JavaScript, not Python). ",
    url: "https://github.com/edwelker/astro-markdown-personal-site/tree/astro",
    date: "2025-12-20",
    thought: "This is my Astro 5 / Typescript playground.. <a href='/blog/2026/01/06/wordpress-to-hugo-to-astro/'>Read the full migration story.</a>",
    type: "code"
  },
  {
    title: "LivingByBike's MoCo Tour 2024",
    description: "Photos from LivingByBike's MoCo Tour 2024",
    date: "2024-12-30",
    url: "https://photos.google.com/share/AF1QipNAUnus_8LqdSZ8u1JZVN9wJTStrYWm7URukGV2y8ozynSglhDErsA2WV0-0izWsg?key=dHBVVXlkS2FVMXhiZXhsbkRKX1VNOW5YbVZxTzBn",
    thought: "<a href='https://www.instagram.com/livingbybike/'>Claire/LivingByBike</a> hosted an awesome (but COLD) trip in Montgomery County, MD, November 2024.",
    type: "photos",
      image: "https://lh3.googleusercontent.com/pw/AP1GczPbA2i14en8ZLs4IPORBIb_K_BFUt6CUzkgekI3cw1kRrK9CDPbhRtRnAHEbjiTDWylaoNkuj3rTiHO7uzsTv9aqFI0q78sKZpHUL7MKMy67OgKyuDJkaKkxO1mnEENDYNSbeJyDXRg9appOmIdvdcJ9Q=w1158-h674-s-no?authuser=0"
  },
  {
    title: "718 2024 Micro Tour 10",
    description: "Photos from 2024 Micro Tour 10",
    date: "2024-12-01",
    url: "https://photos.google.com/share/AF1QipMVQd_WRrYB6JwAXFZVypTMudkwPMNXoKsYDs1GxufiyCLbOAcSFLTtN036zhFRgQ?key=OUpJcjVkTC0zS2NmZHdLazVibFdEQXJGRGZWZXBn",
    thought: "<a href='https://718outdoors.com/'>Joe's 718 Outdoors</a> Micro-tour 10, Labor Day 2024",
    type: "photos",
      image: "https://lh3.googleusercontent.com/pw/AP1GczM8KUevAUq-G0KxMYkIWlLAxC4AKpeY1PiZm05YjXVwgEFqQ78ZrY0kYtoexa9PftO0P1_B-yPNLsLVEDbIF9FIcV3wKG7eIIEW8KlsJkhc5ov1oMwWWQGo_8SwmJvA5Nilc3qWtBjOcROMevKxO-CTwQ=w1158-h709-s-no?authuser=0"
  },
  {
    title: "718 2024 GAP/C&O",
    description: "Photos from 2024 GAP/C&O",
    date: "2024-12-01",
    url: "https://photos.google.com/share/AF1QipPjln17COSHshcQ8hRndTWSh0Nsrb20Sbia0MUfgEfuUoJnvRo0un_XsdaMcqF5oQ?key=d25XMGE1eWlNWEI2ZlJCMU9jYnJCQjduN1F6MERR",
    thought: "<a href='https://718outdoors.com/'>Joe's 718 Outdoors</a> 2024 GAP/C&O tour",
    type: "photos",
      image: "https://lh3.googleusercontent.com/pw/AP1GczNEF9t32AJ3PmlRIMTW6kP0I1zuakUZDglTod7TSq11m5NDyH1zp9jQnI76CnJwDoSs7P1DAmYFmDM1goHM8QjSrp2MsD1Al80KP9_lB9vOcib1c-oyINJjZKPXayLnV6UcX4i0w-hulXl5pg-8pNo8Tg=w1158-h770-s-no?authuser=0"
  },
  {
    title: "718 Erie Canal Tour, 2024",
    description: "Photos from 718 Erie Canal Tour, 2024",
    date: "2024-12-01",
    url: "https://photos.google.com/share/AF1QipNPjKyC4iaTnLBhj0g-CTrnpXxxGMBf-09YYA-BZ7iWPmA6AyE_odwwHE5TrL__uQ?key=bXNXUGNGMEFveHlSX0lNazhiZmQ2X1FfclRQUGFR",
    thought: "<a href='https://718outdoors.com/'>Joe's 718 Outdoors</a> 2024 Erie Canal Tour",
    type: "photos",
      image: "https://lh3.googleusercontent.com/pw/AP1GczNDCwGQDQW7Gt-ZWDOuDmAqHilstB0NFb2ki4w5lfy7JClyhYJ6EpGI1Hd5YJfxIL7Len2ZViogSA7XDzBa4tp0sFByvjCH1evjsdfv8TJvB5hkDmFQlrOiUWIJ0-zhX9RIk05uuzrPcsOIZE9FC9GeGA=w1158-h640-s-no?authuser=0"
  },
  {
    title: "718 2023 GAP/C&O",
    description: "Photos from 718 GAP/C&O Tour, 2023",
    date: "2023-12-13",
    url: "https://photos.google.com/share/AF1QipO2GSgLiAA6j3h05MbfFuHCH-Os1-i6rMw0cPHmU9RBCV2pJzlIeUykqw8Yqnmsxg?key=MnFESC13ejJvSU5QN1NYMDVwSjFOY1dyTzRjRFBR",
    thought: "The 2023 GAP/C&O tour with <a href='https://718outdoors.com/'>718 Outdoors</a>.",
    type: "photos",
      image: "https://lh3.googleusercontent.com/pw/AP1GczPNrRQUR15ZdCLDz2HqNGhg2q4h2i-jSnyZrQsmskmLvVwr_5ei1Ne5r4Sj08GtlXwZSxowQLayACbi1dinNjdoenj8ARDLwjrr9lzBGijgV7f4ITTm_mTaIRR9x6gA3Yo3YvNcynIxymfOFAFTsQPuQg=w1158-h771-s-no?authuser=0"
  },
];

export function getHighlightIcon(type: string) {
  switch (type) {
    case 'code':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
    case 'photos':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
    default:
      return null;
  }
}

export async function enrichHighlightsWithImages(items: Highlight[]): Promise<Highlight[]> {
  return Promise.all(items.map(async (item) => {
    // Only scrape if it's a Google Photos link AND no manual image is provided
    if (item.type === 'photos' && item.url.includes('photos.google.com') && !item.image) {
      try {
        const response = await fetch(item.url);
        if (response.ok) {
          const html = await response.text();

          // Try to find random images first
          // Look for standard google content URLs (lh3.googleusercontent.com etc)
          // We filter for reasonably long URLs to avoid icons
          const regex = /(https:\/\/lh[0-9]+\.googleusercontent\.com\/[a-zA-Z0-9_-]+)/g;
          const matches = html.match(regex);

          if (matches) {
            // Filter out short matches (likely icons or garbage) and duplicates
            const uniqueUrls = [...new Set(matches.filter(url => url.length > 50))];

            if (uniqueUrls.length > 0) {
              const randomUrl = uniqueUrls[Math.floor(Math.random() * uniqueUrls.length)];
              // Append size param to ensure we get a valid image response
              return { ...item, image: `${randomUrl}=w1024` };
            }
          }

          // Fallback to OG image if no random images found
          const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
          if (ogMatch && ogMatch[1]) {
            return { ...item, image: ogMatch[1] };
          }
        }
      } catch (e) {
        console.error(`Failed to fetch images for ${item.title}`, e);
      }
    }
    return item;
  }));
}
