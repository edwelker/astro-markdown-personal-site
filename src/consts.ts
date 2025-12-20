import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "eddiewelker.com",
  DESCRIPTION: "Eddie Welker's digital garden. A collection of thoughts on coding, biking, and making things.",
  EMAIL: "no-email-published@example.com",
  NUM_POSTS_ON_HOMEPAGE: 7,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Programmer, Cyclist, Cellist, Photographer, Cook, Woodworker. Senior Software Architect building big, important things and leading teams.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on software engineering, XSLT, Python, food, cycling, and the intersection of technology and hobby.",
};

export const PROJECTS: Metadata = {
  TITLE: "Highlights",
  DESCRIPTION:
    "A curated list of my cycling achievements, technical projects, and other creative highlights.",
};

export const SOCIALS: Socials = [
  {
    NAME: "Instagram",
    HREF: "https://instagram.com/edwelker",
  },
  {
    NAME: "GitHub",
    HREF: "https://github.com/edwelker",
  },
  {
    NAME: "LinkedIn",
    HREF: "https://www.linkedin.com/in/edwardwelker/",
  },
  {
    NAME: 'RSS',
    HREF: '/rss.xml', // Relative path to your feed endpoint
  },
  {
    NAME: "Spotify",
    HREF: "https://open.spotify.com/user/edwelker", // Copied your link exactly
  },
  {
    NAME: "Strava",
    HREF: "https://www.strava.com/athletes/43444098",
  },
  {
    NAME: "Trakt",
    HREF: "https://trakt.tv/users/edwelker",
  },
  {
    NAME: "Last.fm",
    HREF: "https://www.last.fm/user/edwelker",
  },
  {
    NAME: "Flickr",
    HREF: "https://www.flickr.com/photos/ed_welker/",
  },
];
