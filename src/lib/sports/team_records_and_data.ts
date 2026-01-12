import { TEAM_IDS } from './constants';

async function getLeagueRecords(sport: 'basketball' | 'baseball', league: 'nba' | 'mlb') {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/v2/sports/${sport}/${league}/standings`
    );
    if (!res.ok) return {};
    const data = await res.json();

    const records: Record<string, string> = {};

    const traverse = (node: any) => {
      if (node.standings && node.standings.entries) {
        node.standings.entries.forEach((entry: any) => {
          if (entry.team && entry.team.id && entry.stats) {
            const stat = entry.stats.find(
              (s: any) => s.name === 'overall' || s.type === 'total' || s.name === 'record'
            );
            if (stat) {
              records[String(entry.team.id)] = stat.displayValue || stat.summary;
            }
          }
        });
      }
      if (node.children) {
        node.children.forEach((child: any) => traverse(child));
      }
    };

    traverse(data);
    return records;
  } catch (e) {
    console.error(`Error fetching ${league} standings`, e);
    return {};
  }
}

export async function getTeamData(teamName: string, leagueRecords: Record<string, string>) {
  const info = TEAM_IDS[teamName];
  if (!info) return { schedule: [], record: '', rank: '', standingsLink: '', scheduleLink: '' };

  const sport = info.league === 'MLB' ? 'baseball' : 'basketball';
  const league = info.league.toLowerCase();
  const standingsLink =
    info.league === 'MLB' ? 'https://www.mlb.com/standings' : 'https://www.nba.com/standings';

  // Construct official schedule link (approximate based on team name slug)
  // Better slug generation:
  let officialSlug = teamName.toLowerCase().replace(/\s+/g, '-');

  // Simplified approach for official sites:
  let officialScheduleLink = '';
  if (info.league === 'MLB') {
    // MLB uses team name in url usually: mlb.com/redsox/schedule
    // Need to handle "white sox" -> "whitesox", "red sox" -> "redsox"
    const mlbSlug =
      teamName.split(' ').slice(-1)[0].toLowerCase() === 'sox'
        ? teamName.split(' ').slice(-2).join('').toLowerCase()
        : teamName.split(' ').pop()?.toLowerCase();
    officialScheduleLink = `https://www.mlb.com/${mlbSlug}/schedule`;
  } else {
    // NBA uses team slugs: nba.com/knicks/schedule
    const nbaSlug = teamName.split(' ').pop()?.toLowerCase();
    officialScheduleLink = `https://www.nba.com/${nbaSlug}/schedule`;
  }

  try {
    const [scheduleRes, teamRes] = await Promise.all([
      fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${info.id}/schedule`
      ),
      fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${info.id}`),
    ]);

    const scheduleData = scheduleRes.ok ? await scheduleRes.json() : {};
    const teamData = teamRes.ok ? await teamRes.json() : {};

    const events = scheduleData.events || [];
    const now = new Date();

    // Recent games (last 2 days)
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);

    const recentGames = events
      .filter((e: any) => {
        const gameDate = new Date(e.date);
        return (
          gameDate < now && gameDate >= twoDaysAgo && e.competitions?.[0]?.status?.type?.completed
        );
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e: any) => {
        const competition = e.competitions[0];
        const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
        const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');

        const isHome = String(homeTeam.team.id) === String(info.id);
        const myTeam = isHome ? homeTeam : awayTeam;
        const opponent = isHome ? awayTeam : homeTeam;
        const opponentName = opponent.team.shortDisplayName || opponent.team.displayName;
        const vsText = isHome ? `vs. ${opponentName}` : `@ ${opponentName}`;

        const isWin = !!myTeam.winner;

        const getScoreVal = (s: any) => {
          if (s && typeof s === 'object') {
            return s.displayValue || s.value || '';
          }
          return s;
        };

        const score = `${getScoreVal(myTeam.score)}-${getScoreVal(opponent.score)}`;

        let boxScoreLink = '';
        const link = e.links?.find((l: any) => l.rel?.includes('boxscore'));
        if (link) boxScoreLink = link.href;
        else boxScoreLink = `https://www.espn.com/${league}/boxscore/_/gameId/${e.id}`;

        return {
          date: new Date(e.date),
          text: vsText,
          completed: true,
          isWin,
          score,
          boxScoreLink,
        };
      });

    // Determine limit based on league
    const scheduleLimit = info.league === 'MLB' ? 4 : 5;

    const upcomingGames = events
      .filter((e: any) => new Date(e.date) > now)
      .slice(0, scheduleLimit)
      .map((e: any) => {
        const gameDate = new Date(e.date);
        const competition = e.competitions[0];
        const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
        const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');

        const isHome = String(homeTeam.team.id) === String(info.id);
        const opponent = isHome ? awayTeam : homeTeam;
        const opponentName = opponent.team.shortDisplayName || opponent.team.displayName;
        const vsText = isHome ? `vs. ${opponentName}` : `@ ${opponentName}`;

        // Look up opponent record from the passed league records
        let opponentRecord = '';
        if (opponent.team && opponent.team.id) {
          opponentRecord = leagueRecords[String(opponent.team.id)] || '';
        }

        // Extract TV info for NBA
        let tv = '';
        if (info.league === 'NBA' && competition.broadcasts) {
          // Filter for specific national broadcasters
          const nationalBroadcasters = [
            'Peacock',
            'ESPN',
            'ABC',
            'TNT',
            'Prime Video',
            'Amazon Prime',
          ];
          const stations = competition.broadcasts
            .map((b: any) => b.media?.shortName)
            .filter((name: string) => {
              // Check for exact match or if the station name contains one of the keywords (e.g. "ESPN2")
              return nationalBroadcasters.some((nb) => name.includes(nb));
            });

          if (stations.length > 0) {
            tv = stations.join(', ');
          }
        }

        return {
          date: gameDate,
          text: vsText,
          opponentRecord,
          standingsLink,
          tv,
          completed: false,
        };
      });

    const schedule = [...recentGames, ...upcomingGames];

    const team = teamData.team || {};
    const record = team.record?.items?.[0]?.summary || '';
    const rank = team.standingSummary || '';

    return {
      schedule,
      record,
      rank,
      standingsLink,
      scheduleLink: officialScheduleLink,
    };
  } catch (e) {
    console.error(`Error fetching data for ${teamName}`, e);
    return { schedule: [], record: '', rank: '', standingsLink: '', scheduleLink: '' };
  }
}

export async function fetchAllTeamData(teams: any[]) {
  if (!teams || !Array.isArray(teams)) return {};

  // Fetch standings for both leagues to populate opponent records
  const [nbaRecords, mlbRecords] = await Promise.all([
    getLeagueRecords('basketball', 'nba'),
    getLeagueRecords('baseball', 'mlb'),
  ]);

  const data: Record<string, any> = {};
  await Promise.all(
    teams.map(async (team: any) => {
      const info = TEAM_IDS[team.name];
      // Pass the specific league records to avoid ID collisions
      const records = info.league === 'MLB' ? mlbRecords : nbaRecords;
      data[team.name] = await getTeamData(team.name, records);
    })
  );
  return data;
}
