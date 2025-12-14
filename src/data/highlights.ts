// src/data/highlights.ts

export interface Highlight {
  title: string;
  description: string;
  url: string;
  date: string;
  // This is the new field for your personal take
  thought?: string;
}

export const highlights: Highlight[] = [
  {
    title: "Personal Website",
    description: "This site. Work in progress, but Wordpress to Hugo to Astro.",
    url: "https://github.com/edwelker/website/tree/astro",
    date: "2025-10-15", // Update to current if you want
    thought: "Wordpress to Hugo to Astro. Thoughts later."
  },
  {
    title: "LivingByBike's MoCo Tour 2024",
    description: "Photos from LivingByBike's MoCo Tour 2024",
    date: "2024-12-13",
    url: "https://photos.google.com/share/AF1QipNAUnus_8LqdSZ8u1JZVN9wJTStrYWm7URukGV2y8ozynSglhDErsA2WV0-0izWsg?key=dHBVVXlkS2FVMXhiZXhsbkRKX1VNOW5YbVZxTzBn",
    thought: "<a href='https://www.instagram.com/livingbybike/'>Claire/LivingByBike</a> hosted an awesome (but COLD) trip in Montgomery County, MD, November 2024."
  },
  {
    title: "718 2024 Micro Tour 10",
    description: "Photos from 2024 Micro Tour 10",
    date: "2024-12-13",
    url: "https://photos.google.com/share/AF1QipMVQd_WRrYB6JwAXFZVypTMudkwPMNXoKsYDs1GxufiyCLbOAcSFLTtN036zhFRgQ?key=OUpJcjVkTC0zS2NmZHdLazVibFdEQXJGRGZWZXBn",
    thought: "<a href='https://718outdoors.com/'>Joe's 718 Outdoors</a> Micro-tour 10, Labor Day 2024",
  },
  {
    title: "718 2024 GAP/C&O",
    description: "Photos from 2024 GAP/C&O",
    date: "2024-12-13",
    url: "https://photos.google.com/share/AF1QipPjln17COSHshcQ8hRndTWSh0Nsrb20Sbia0MUfgEfuUoJnvRo0un_XsdaMcqF5oQ?key=d25XMGE1eWlNWEI2ZlJCMU9jYnJCQjduN1F6MERR",
    thought: "<a href='https://718outdoors.com/'>Joe's 718 Outdoors</a> 2024 GAP/C&O tour",
  },
  {
    title: "718 Erie Canal Tour, 2024",
    description: "Photos from 718 Erie Canal Tour, 2024",
    date: "2024-12-13",
    url: "https://photos.google.com/share/AF1QipNPjKyC4iaTnLBhj0g-CTrnpXxxGMBf-09YYA-BZ7iWPmA6AyE_odwwHE5TrL__uQ?key=bXNXUGNGMEFveHlSX0lNazhiZmQ2X1FfclRQUGFR",
    thought: "<a href='https://718outdoors.com/'>Joe's 718 Outdoors</a> 2024 Erie Canal Tour",
  },
  {
    title: "718 2023 GAP/C&O",
    description: "Photos from 718 GAP/C&O Tour, 2023",
    date: "2023-12-13",
    url: "https://photos.google.com/share/AF1QipO2GSgLiAA6j3h05MbfFuHCH-Os1-i6rMw0cPHmU9RBCV2pJzlIeUykqw8Yqnmsxg?key=MnFESC13ejJvSU5QN1NYMDVwSjFOY1dyTzRjRFBR"
  },
];
