import type { Metadata, Site, Socials } from "@types";

export const SITE = {
  TITLE: "eddiewelker.com",
  DESCRIPTION: "Eddie Welker's digital things. Coding, biking, and making things.",
  EMAIL: "no-email-published@example.com",
  NUM_POSTS_ON_HOMEPAGE: 4,
  NUM_HIGHLIGHTS_ON_HOMEPAGE: 3,
};

// todo, all of this crap needs to be streamlined, and made less yuck
export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Programmer, Cyclist, Cellist, Photographer, Cook, Woodworker, MD/NY, USA.  ",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on software engineering, XSLT, Python, food, cycling, and the intersection of technology and hobby.",
};

export const RECIPES: Metadata = {
  TITLE: "Recipes",
  DESCRIPTION: "A collection of my recipes.",
};


export const HIGHLIGHTS = {
  TITLE: "Recent Highlights",
  DESCRIPTION: "Projects, work, or things I'm proud of",
};

export const SOCIALS: Socials = [
  { NAME: "Instagram", HREF: "https://instagram.com/edwelker" },
  { NAME: "GitHub", HREF: "https://github.com/edwelker" },
  { NAME: "LinkedIn", HREF: "https://www.linkedin.com/in/edwardwelker/" },
  { NAME: "Bluesky", HREF: "https://bsky.app/profile/edwelker.bsky.social" },
  { NAME: 'RSS', HREF: '/rss.xml' },
  { NAME: "Spotify", HREF: "https://open.spotify.com/user/edwelker" },
  { NAME: "Strava", HREF: "https://www.strava.com/athletes/43444098" },
  { NAME: "Trakt", HREF: "https://trakt.tv/users/edwelker" },
  { NAME: "Last.fm", HREF: "https://www.last.fm/user/edwelker" },
  { NAME: "Flickr", HREF: "https://www.flickr.com/photos/ed_welker/" },
];
