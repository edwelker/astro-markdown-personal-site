import { getMyTeamsNews, getAllLeagueNews, fetchHoopsRumorsNews } from './rss_news_logic';
import { fetchAllTeamData } from './team_records_and_data';
import { MY_TEAMS, TEAM_IDS } from './constants';

// Helper to timeout fetches
const fetchWithTimeout = (promise: Promise<any>, ms = 8000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

export async function getSportsPageData() {
  let myTeamsNews: any[] = [];
  let allLeagueNews: any[] = [];
  let teamsExtraData: Record<string, any> = {};
  let fetchError = null;
  let teamData: any[] = [];

  // Manually inject teams that might be missing from MY_TEAMS config
  const EXTRA_TEAMS = [
    { name: 'San Antonio Spurs', league: 'NBA', slug: 'san-antonio-spurs' },
    { name: 'Chicago Bulls', league: 'NBA', slug: 'chicago-bulls' },
  ];

  // Combine MY_TEAMS with EXTRA_TEAMS, avoiding duplicates
  const combinedTeams = [...(Array.isArray(MY_TEAMS) ? MY_TEAMS : [])];
  EXTRA_TEAMS.forEach((extra) => {
    if (!combinedTeams.find((t) => t.name === extra.name)) {
      combinedTeams.push(extra);
    }
  });

  try {
    console.log('[Sports] Starting data fetch...');
    const startTime = Date.now();

    const results = await fetchWithTimeout(
      Promise.all([
        getMyTeamsNews().catch((err: any) => {
          console.error('[Sports] Error fetching team news:', err);
          return [];
        }),
        getAllLeagueNews().catch((err: any) => {
          console.error('[Sports] Error fetching league news:', err);
          return [];
        }),
        fetchAllTeamData(combinedTeams).catch((err: any) => {
          console.error('[Sports] Error fetching team data:', err);
          return {};
        }),
        ...EXTRA_TEAMS.map((t) =>
          fetchHoopsRumorsNews(t.slug, t.name).catch((err) => {
            console.error(`[Sports] Error fetching news for ${t.name}:`, err);
            return [];
          })
        ),
      ]),
      9000
    );

    myTeamsNews = results[0] as any[];
    allLeagueNews = results[1] as any[];
    teamsExtraData = results[2] as any;

    // Merge extra news
    for (let i = 3; i < results.length; i++) {
      if (Array.isArray(results[i])) {
        myTeamsNews = [...myTeamsNews, ...results[i]];
      }
    }

    console.log(`[Sports] Data fetch completed in ${Date.now() - startTime}ms`);
    console.log(
      `[Sports] Items fetched: Teams=${myTeamsNews?.length}, League=${allLeagueNews?.length}`
    );

    teamData = combinedTeams
      .map((team: any) => {
        const allItems = Array.isArray(myTeamsNews)
          ? myTeamsNews.filter((i) => i.source === team.name)
          : [];

        allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Hardcoded limit as per previous request
        const limit = 10;

        const items = allItems
          .filter((item) => {
            if (!item || !item.date) return false;
            const d = new Date(item.date);
            return !isNaN(d.getTime());
          })
          .slice(0, limit);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentItems: any[] = [];
        const olderItems: any[] = [];

        items.forEach((item) => {
          const isRecent = new Date(item.date) >= sevenDaysAgo;

          if (isRecent && recentItems.length < 5) {
            recentItems.push(item);
          } else {
            olderItems.push(item);
          }
        });

        const extra = teamsExtraData[team.name] || {
          schedule: [],
          record: '',
          rank: '',
          standingsLink: '',
          scheduleLink: '',
        };

        return {
          ...team,
          recentItems,
          olderItems,
          schedule: extra.schedule,
          record: extra.record,
          rank: extra.rank,
          standingsLink: extra.standingsLink,
          scheduleLink: extra.scheduleLink,
        };
      })
      .filter((t) => t.recentItems.length > 0 || t.olderItems.length > 0 || t.schedule.length > 0);

    // Sort teamData based on TEAM_IDS definition order
    const definedOrder = Object.keys(TEAM_IDS);
    teamData.sort((a, b) => {
      const indexA = definedOrder.indexOf(a.name);
      const indexB = definedOrder.indexOf(b.name);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return 0;
    });
  } catch (error) {
    console.error('[Sports] Critical error during data fetch:', error);
    fetchError = error;
  }

  return {
    teamData,
    allLeagueNews,
    fetchError,
  };
}
