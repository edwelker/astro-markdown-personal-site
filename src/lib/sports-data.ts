import { getMyTeamsNews, getAllLeagueNews, MY_TEAMS } from './sports';

const TEAM_IDS: Record<string, { id: string; league: string }> = {
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

// Helper to timeout fetches
const fetchWithTimeout = (promise: Promise<any>, ms = 8000) => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
};

async function getLeagueRecords(sport: 'basketball' | 'baseball', league: 'nba' | 'mlb') {
    try {
        const res = await fetch(`https://site.api.espn.com/apis/v2/sports/${sport}/${league}/standings`);
        if (!res.ok) return {};
        const data = await res.json();
        
        const records: Record<string, string> = {};
        
        const traverse = (node: any) => {
            if (node.standings && node.standings.entries) {
                node.standings.entries.forEach((entry: any) => {
                    if (entry.team && entry.team.id && entry.stats) {
                        const stat = entry.stats.find((s: any) => s.name === 'overall' || s.type === 'total' || s.name === 'record');
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
    const standingsLink = info.league === 'MLB' ? 'https://www.mlb.com/standings' : 'https://www.nba.com/standings';
    
    // Construct official schedule link (approximate based on team name slug)
    const teamSlug = teamName.toLowerCase().split(' ').pop(); // e.g., 'knicks', 'sox' (might need adjustment for multi-word cities/names if strict)
    // Better slug generation:
    let officialSlug = teamName.toLowerCase().replace(/\s+/g, '-');
    // MLB/NBA sites usually use just the team name part or specific slugs, but linking to main schedule page is safer if slug is tricky
    // For now, let's link to the league schedule page or team specific if easy.
    // ESPN team page is reliable with ID.
    const scheduleLink = `https://www.espn.com/${league}/team/schedule/_/name/${info.league === 'MLB' ? teamSlug?.substring(0,3) : teamSlug}/${officialSlug}`; 
    // Actually, let's use the league sites as requested:
    // NBA: https://www.nba.com/team/1610612752/schedule (requires NBA ID, not ESPN ID)
    // MLB: https://www.mlb.com/redsox/schedule
    
    // Simplified approach for official sites:
    let officialScheduleLink = '';
    if (info.league === 'MLB') {
        // MLB uses team name in url usually: mlb.com/redsox/schedule
        // Need to handle "white sox" -> "whitesox", "red sox" -> "redsox"
        const mlbSlug = teamName.split(' ').slice(-1)[0].toLowerCase() === 'sox' 
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
            fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${info.id}/schedule`),
            fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${info.id}`)
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
                return gameDate < now && gameDate >= twoDaysAgo && e.competitions?.[0]?.status?.type?.completed;
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
                    boxScoreLink
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
                    const nationalBroadcasters = ['Peacock', 'ESPN', 'ABC', 'TNT', 'Prime Video', 'Amazon Prime'];
                    const stations = competition.broadcasts
                        .map((b: any) => b.media?.shortName)
                        .filter((name: string) => {
                            // Check for exact match or if the station name contains one of the keywords (e.g. "ESPN2")
                            return nationalBroadcasters.some(nb => name.includes(nb));
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
                    completed: false
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
            scheduleLink: officialScheduleLink
        };

    } catch (e) {
        console.error(`Error fetching data for ${teamName}`, e);
        return { schedule: [], record: '', rank: '', standingsLink: '', scheduleLink: '' };
    }
}

async function fetchAllTeamData(teams: any[]) {
    if (!teams || !Array.isArray(teams)) return {};
    
    // Fetch standings for both leagues to populate opponent records
    const [nbaRecords, mlbRecords] = await Promise.all([
        getLeagueRecords('basketball', 'nba'),
        getLeagueRecords('baseball', 'mlb')
    ]);
    
    const data: Record<string, any> = {};
    await Promise.all(teams.map(async (team: any) => {
        const info = TEAM_IDS[team.name];
        // Pass the specific league records to avoid ID collisions
        const records = info.league === 'MLB' ? mlbRecords : nbaRecords;
        data[team.name] = await getTeamData(team.name, records);
    }));
    return data;
}

async function fetchHoopsRumorsNews(slug: string, teamName: string) {
    try {
        const res = await fetch(`https://www.hoopsrumors.com/${slug}/feed`);
        if (!res.ok) return [];
        const text = await res.text();
        
        const items: any[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        
        while ((match = itemRegex.exec(text)) !== null) {
            const itemContent = match[1];
            const titleMatch = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/.exec(itemContent);
            const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);
            const dateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemContent);
            
            if (titleMatch && linkMatch && dateMatch) {
                items.push({
                    title: titleMatch[1],
                    link: linkMatch[1],
                    date: dateMatch[1],
                    source: teamName
                });
            }
        }
        return items;
    } catch (e) {
        console.error(`Error fetching news for ${teamName}`, e);
        return [];
    }
}

export async function getSportsPageData() {
    let myTeamsNews: any[] = [];
    let allLeagueNews: any[] = [];
    let teamsExtraData: Record<string, any> = {};
    let fetchError = null;
    let teamData: any[] = [];

    // Manually inject teams that might be missing from MY_TEAMS config
    const EXTRA_TEAMS = [
        { name: 'San Antonio Spurs', league: 'NBA', slug: 'san-antonio-spurs' },
        { name: 'Chicago Bulls', league: 'NBA', slug: 'chicago-bulls' }
    ];

    // Combine MY_TEAMS with EXTRA_TEAMS, avoiding duplicates
    const combinedTeams = [...(Array.isArray(MY_TEAMS) ? MY_TEAMS : [])];
    EXTRA_TEAMS.forEach(extra => {
        if (!combinedTeams.find(t => t.name === extra.name)) {
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
                ...EXTRA_TEAMS.map(t => fetchHoopsRumorsNews(t.slug, t.name).catch(err => {
                    console.error(`[Sports] Error fetching news for ${t.name}:`, err);
                    return [];
                }))
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
        console.log(`[Sports] Items fetched: Teams=${myTeamsNews?.length}, League=${allLeagueNews?.length}`);

        teamData = combinedTeams.map((team: any) => {
            const allItems = Array.isArray(myTeamsNews) ? myTeamsNews.filter(i => i.source === team.name) : [];

            allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // Hardcoded limit as per previous request
            const limit = 10;

            const items = allItems.filter(item => {
                if (!item || !item.date) return false;
                const d = new Date(item.date);
                return !isNaN(d.getTime());
            }).slice(0, limit);

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

            const extra = teamsExtraData[team.name] || { schedule: [], record: '', rank: '', standingsLink: '', scheduleLink: '' };

            return {
                ...team,
                recentItems,
                olderItems,
                schedule: extra.schedule,
                record: extra.record,
                rank: extra.rank,
                standingsLink: extra.standingsLink,
                scheduleLink: extra.scheduleLink
            };
        }).filter(t => (t.recentItems.length > 0 || t.olderItems.length > 0) || t.schedule.length > 0);

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
        fetchError
    };
}
