import type { Metadata, Site, Socials } from '@types';

export const SITE = {
  TITLE: 'eddiewelker.com',
  DESCRIPTION: "Eddie Welker's digital things. Coding, biking, and making things.",
  EMAIL: 'no-email-published@example.com',
  NUM_POSTS_ON_HOMEPAGE: 4,
  NUM_HIGHLIGHTS_ON_HOMEPAGE: 3,
};

// todo, all of this crap needs to be streamlined, and made less yuck
export const HOME: Metadata = {
  TITLE: 'Home',
  DESCRIPTION:
    'The personal site of Eddie Welker. Software Engineer, Cyclist, Cellist, Photographer, Cook, Woodworker, Laurel, MD, USA.',
};

export const BLOG: Metadata = {
  TITLE: 'Blog',
  DESCRIPTION:
    'Writing about software engineering, cycling tours, and music history. It covers everything from Python and XSLT to bike maintenance and the cello.',
};

export const RECIPES: Metadata = {
  TITLE: 'Recipes',
  DESCRIPTION:
    'A list of what I cook at home. Focus on rustic breads, lentils, and recipes using dried beans instead of the canned stuff.',
};

export const HIGHLIGHTS = {
  TITLE: 'Recent Highlights',
  DESCRIPTION:
    'A collection of significant posts and projects from my archives. Highlighting the work and moments I find most interesting.',
};

export const SOCIALS: Socials = [
  { NAME: 'Instagram', HREF: 'https://instagram.com/edwelker' },
  { NAME: 'GitHub', HREF: 'https://github.com/edwelker' },
  { NAME: 'LinkedIn', HREF: 'https://www.linkedin.com/in/edwardwelker/' },
  { NAME: 'Bluesky', HREF: 'https://bsky.app/profile/edwelker.bsky.social' },
  { NAME: 'RSS', HREF: '/rss.xml' },
  { NAME: 'Spotify', HREF: 'https://open.spotify.com/user/edwelker' },
  { NAME: 'Strava', HREF: 'https://www.strava.com/athletes/43444098' },
  { NAME: 'Trakt', HREF: 'https://trakt.tv/users/edwelker' },
  { NAME: 'Last.fm', HREF: 'https://www.last.fm/user/edwelker' },
  { NAME: 'Flickr', HREF: 'https://www.flickr.com/photos/ed_welker/' },
];
