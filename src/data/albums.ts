// src/data/albums.ts
export interface Album {
  title: string;
  description: string;
  date: Date;
  url: string; // Albums always have external URLs
}

export const ALBUMS: Album[] = [
  {
    title: "LivingByBike's MoCo Tour 2024",
    description: "Photos from LivingByBike's MoCo Tour 2024",
    date: new Date("2025-12-13"),
    url: "https://photos.google.com/share/AF1QipNAUnus_8LqdSZ8u1JZVN9wJTStrYWm7URukGV2y8ozynSglhDErsA2WV0-0izWsg?key=dHBVVXlkS2FVMXhiZXhsbkRKX1VNOW5YbVZxTzBn"
  },
  {
    title: "718 2024 Micro Tour 10",
    description: "Photos from 2024 Micro Tour 10",
    date: new Date("2025-12-13"),
    url: "https://photos.google.com/share/AF1QipMVQd_WRrYB6JwAXFZVypTMudkwPMNXoKsYDs1GxufiyCLbOAcSFLTtN036zhFRgQ?key=OUpJcjVkTC0zS2NmZHdLazVibFdEQXJGRGZWZXBn"
  },
  {
    title: "718 2024 GAP/C&O",
    description: "Photos from 2024 GAP/C&O",
    date: new Date("2025-12-13"),
    url: "https://photos.google.com/share/AF1QipPjln17COSHshcQ8hRndTWSh0Nsrb20Sbia0MUfgEfuUoJnvRo0un_XsdaMcqF5oQ?key=d25XMGE1eWlNWEI2ZlJCMU9jYnJCQjduN1F6MERR"
  },
  {
    title: "718 Erie Canal Tour, 2024",
    description: "Photos from 718 Erie Canal Tour, 2024",
    date: new Date("2025-12-13"),
    url: "https://photos.google.com/share/AF1QipNPjKyC4iaTnLBhj0g-CTrnpXxxGMBf-09YYA-BZ7iWPmA6AyE_odwwHE5TrL__uQ?key=bXNXUGNGMEFveHlSX0lNazhiZmQ2X1FfclRQUGFR"
  }
];
