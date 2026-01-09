export const MY_TEAMS = [
  { league: 'MLB', name: 'Red Sox', url: 'https://www.mlbtraderumors.com/boston-red-sox/feed/atom' },
  { league: 'NBA', name: 'Knicks', url: 'https://www.hoopsrumors.com/newyorkknicks.xml' },
  { league: 'NBA', name: 'Celtics', url: 'https://www.hoopsrumors.com/bostonceltics.xml' },
  { league: 'MLB', name: 'Orioles', url: 'https://www.mlbtraderumors.com/baltimore-orioles/feed/atom' },
  { league: 'NBA', name: 'Pistons', url: 'https://www.hoopsrumors.com/detroitpistons.xml' },
  { league: 'NBA', name: 'Wizards', url: 'https://www.hoopsrumors.com/washingtonwizards.xml' },
  { league: 'MLB', name: 'White Sox', url: 'https://www.mlbtraderumors.com/chicago-white-sox/feed/atom' },
] as const;

export const LEAGUES = [
    { league: 'MLB', name: 'MLB Trade Rumors', url: 'https://www.mlbtraderumors.com/feed' },
    { league: 'MLB', name: 'FanGraphs', url: 'https://blogs.fangraphs.com/feed/' },
    { league: 'MLB', name: 'CBS Sports', url: 'https://www.cbssports.com/rss/headlines/mlb/' },
    { league: 'NBA', name: 'Hoops Rumors', url: 'https://www.hoopsrumors.com/feed' },
    { league: 'NBA', name: 'RealGM', url: 'https://basketball.realgm.com/rss/wiretap/0/0.xml' },
    { league: 'NBA', name: 'CBS Sports', url: 'https://www.cbssports.com/rss/headlines/nba/' }
] as const;

export const TEAM_IDS: Record<string, { id: string; league: string }> = {
    'Red Sox': { id: '2', league: 'MLB' },
    'Boston Red Sox': { id: '2', league: 'MLB' },
    'Knicks': { id: '18', league: 'NBA' },
    'New York Knicks': { id: '18', league: 'NBA' },
    'Celtics': { id: '2', league: 'NBA' },
    'Boston Celtics': { id: '2', league: 'NBA' },
    'Orioles': { id: '1', league: 'MLB' },
    'Baltimore Orioles': { id: '1', league: 'MLB' },
    'Pistons': { id: '8', league: 'NBA' },
    'Detroit Pistons': { id: '8', league: 'NBA' },
    'White Sox': { id: '4', league: 'MLB' },
    'Chicago White Sox': { id: '4', league: 'MLB' },
    'Spurs': { id: '24', league: 'NBA' },
    'San Antonio Spurs': { id: '24', league: 'NBA' },
    'Bulls': { id: '4', league: 'NBA' },
    'Chicago Bulls': { id: '4', league: 'NBA' },
    'Wizards': { id: '27', league: 'NBA' },
    'Washington Wizards': { id: '27', league: 'NBA' }
};

export const TEAM_LOGOS: Record<string, string> = {
    'Red Sox': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/bos.png&w=40&h=40',
    'Boston Red Sox': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/bos.png&w=40&h=40',
    'Knicks': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/nyk.png&w=40&h=40',
    'New York Knicks': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/nyk.png&w=40&h=40',
    'Celtics': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bos.png&w=40&h=40',
    'Boston Celtics': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bos.png&w=40&h=40',
    'Orioles': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/bal.png&w=40&h=40',
    'Baltimore Orioles': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/bal.png&w=40&h=40',
    'Pistons': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/det.png&w=40&h=40',
    'Detroit Pistons': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/det.png&w=40&h=40',
    'White Sox': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/chw.png&w=40&h=40',
    'Chicago White Sox': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/chw.png&w=40&h=40',
    'Spurs': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/sas.png&w=40&h=40',
    'San Antonio Spurs': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/sas.png&w=40&h=40',
    'Bulls': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/chi.png&w=40&h=40',
    'Chicago Bulls': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/chi.png&w=40&h=40',
    'Wizards': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/wsh.png&w=40&h=40',
    'Washington Wizards': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/wsh.png&w=40&h=40'
};

export const LEAGUE_ICONS: Record<string, string> = {
    'MLB': '⚾',
    'NBA': '🏀'
};
