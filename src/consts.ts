import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "eddiewelker.com",
  DESCRIPTION: "Eddie's personal blog",
  EMAIL: "eddie.welker@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 7,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "eddiewelker.com home",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "Blog: Stuff I care about, enough to write about it",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "Projects: Stuff I did",
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
