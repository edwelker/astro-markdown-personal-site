export interface Highlight {
  title: string;
  description: string;
  url: string;
  date: string;
  thought?: string;
  type?: 'code' | 'photos' | 'video' | 'music';
}

export const highlights: Highlight[] = [
  {
    title: "Personal Website Github Repo",
    description: "This site's github. Work in progress, but Wordpress to Hugo to Astro/Typescript.",
    url: "https://github.com/edwelker/astro-markdown-personal-site/tree/astro",
    date: "2025-12-20",
    thought: "Migration from Wordpress through Hugo to Astro/Typescript for better performance and a different experience.",
    type: "code"
  },
  {
    title: "LivingByBike's MoCo Tour 2024",
    description: "Photos from LivingByBike's MoCo Tour 2024",
    date: "2024-12-30",
    url: "https://photos.google.com/share/AF1QipNAUnus_8LqdSZ8u1JZVN9wJTStrYWm7URukGV2y8ozynSglhDErsA2WV0-0izWsg?key=dHBVVXlkS2FVMXhiZXhsbkRKX1VNOW5YbVZxTzBn",
    thought: "<a href='https://www.instagram.com/livingbybike/'>Claire/LivingByBike</a> hosted an awesome (but COLD) trip in Montgomery County, MD, November 2024.",
    type: "photos"
  },
  {
    title: "718 2024 Micro Tour 10",
    description: "Photos from 2024 Micro Tour 10",
    date: "2024-12-01",
    url: "https://photos.google.com/share/AF1QipMVQd_WRrYB6JwAXFZVypTMudkwPMNXoKsYDs1GxufiyCLbOAcSFLTtN036zhFRgQ?key=OUpJcjVkTC0zS2NmZHdLazVibFdEQXJGRGZWZXBn",
    thought: "<a href='https://718outdoors.com/'>Joe's 718 Outdoors</a> Micro-tour 10, Labor Day 2024",
    type: "photos"
  },
  {
    title: "718 2024 GAP/C&O",
    description: "Photos from 2024 GAP/C&O",
    date: "2024-12-01",
    url: "https://photos.google.com/share/AF1QipPjln17COSHshcQ8hRndTWSh0Nsrb20Sbia0MUfgEfuUoJnvRo0un_XsdaMcqF5oQ?key=d25XMGE1eWlNWEI2ZlJCMU9jYnJCQjduN1F6MERR",
    thought: "<a href='https://718outdoors.com/'>Joe's 718 Outdoors</a> 2024 GAP/C&O tour",
    type: "photos"
  },
  {
    title: "718 Erie Canal Tour, 2024",
    description: "Photos from 718 Erie Canal Tour, 2024",
    date: "2024-12-01",
    url: "https://photos.google.com/share/AF1QipNPjKyC4iaTnLBhj0g-CTrnpXxxGMBf-09YYA-BZ7iWPmA6AyE_odwwHE5TrL__uQ?key=bXNXUGNGMEFveHlSX0lNazhiZmQ2X1FfclRQUGFR",
    thought: "<a href='https://718outdoors.com/'>Joe's 718 Outdoors</a> 2024 Erie Canal Tour",
    type: "photos"
  },
  {
    title: "718 2023 GAP/C&O",
    description: "Photos from 718 GAP/C&O Tour, 2023",
    date: "2023-12-13",
    url: "https://photos.google.com/share/AF1QipO2GSgLiAA6j3h05MbfFuHCH-Os1-i6rMw0cPHmU9RBCV2pJzlIeUykqw8Yqnmsxg?key=MnFESC13ejJvSU5QN1NYMDVwSjFOY1dyTzRjRFBR",
    thought: "The 2023 GAP/C&O tour with <a href='https://718outdoors.com/'>718 Outdoors</a>.",
    type: "photos"
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
