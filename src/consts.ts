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
  DESCRIPTION: "Stuff I care about",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "Stuff I did",
};

export const SOCIALS: Socials = [
  {
    NAME: "LinkedIn",
    HREF: "https://www.linkedin.com/in/edwardwelker/",
  },
  {
    NAME: "GitHub",
    HREF: "https://github.com/edwelker",
  },
  {
    NAME: "Website",
    HREF: "https://eddiewelker.com",
  },
];
