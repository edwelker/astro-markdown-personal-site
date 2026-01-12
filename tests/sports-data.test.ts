import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSportsPageData } from '../src/lib/sports/index';
import { getTeamData } from '../src/lib/sports/team_records_and_data';
import { fetchHoopsRumorsNews } from '../src/lib/sports/rss_news_logic';
import * as rssNewsLogic from '../src/lib/sports/rss_news_logic';

// Mock the constants
vi.mock('../src/lib/sports/constants', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    MY_TEAMS: [
      { league: 'MLB', name: 'Red Sox', url: 'http://test.com' },
      { league: 'NBA', name: 'Celtics', url: 'http://test.com' },
    ],
  };
});

// Mock the RSS logic
vi.mock('../src/lib/sports/rss_news_logic', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    getMyTeamsNews: vi.fn(),
    getAllLeagueNews: vi.fn(),
  };
});

describe('Sports Data Logic', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getTeamData', () => {
    it('returns default data for unknown team', async () => {
      const data = await getTeamData('Unknown Team', {});
      expect(data.schedule).toEqual([]);
      expect(data.record).toBe('');
    });

    it('fetches and parses team data correctly', async () => {
      const mockSchedule = {
        events: [
          {
            date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            competitions: [
              {
                competitors: [
                  { homeAway: 'home', team: { id: '2', shortDisplayName: 'Celtics' } },
                  { homeAway: 'away', team: { id: '3', shortDisplayName: 'Lakers' } },
                ],
                broadcasts: [{ media: { shortName: 'ESPN' } }],
              },
            ],
          },
        ],
      };

      const mockTeam = {
        team: {
          record: { items: [{ summary: '10-5' }] },
          standingSummary: '1st in East',
        },
      };

      (fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => mockSchedule })
        .mockResolvedValueOnce({ ok: true, json: async () => mockTeam });

      const data = await getTeamData('Celtics', { '3': '5-10' });

      expect(data.record).toBe('10-5');
      expect(data.rank).toBe('1st in East');
      expect(data.schedule).toHaveLength(1);
      expect(data.schedule[0].opponentRecord).toBe('5-10');
      expect(data.schedule[0].tv).toBe('ESPN');
    });

    it('handles fetch errors gracefully', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));
      const data = await getTeamData('Celtics', {});
      expect(data.schedule).toEqual([]);
    });
  });

  describe('fetchHoopsRumorsNews', () => {
    it('fetches and parses news correctly', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        text: async () => `
                <rss>
                    <channel>
                        <item>
                            <title>News Title</title>
                            <link>http://news.com</link>
                            <pubDate>${new Date().toUTCString()}</pubDate>
                            <description>Desc</description>
                        </item>
                    </channel>
                </rss>
              `,
      });

      const news = await fetchHoopsRumorsNews('slug', 'Team');
      expect(news).toHaveLength(1);
      expect(news[0].title).toBe('News Title');
      expect(news[0].url).toBe('http://news.com');
    });

    it('handles fetch errors', async () => {
      (fetch as any).mockRejectedValue(new Error('Fail'));
      const news = await fetchHoopsRumorsNews('slug', 'Team');
      expect(news).toEqual([]);
    });
  });

  describe('getSportsPageData', () => {
    it('aggregates data from all sources', async () => {
      // Mock sports lib responses
      (rssNewsLogic.getMyTeamsNews as any).mockResolvedValue([
        { source: 'Red Sox', title: 'Sox Win', date: new Date(), url: 'http://sox.com' },
      ]);
      (rssNewsLogic.getAllLeagueNews as any).mockResolvedValue([
        { title: 'League News', date: new Date(), url: 'http://league.com' },
      ]);

      // Mock fetch for standings, team data, and extra news
      (fetch as any).mockImplementation(async (url: string) => {
        if (url.includes('standings')) {
          return { ok: true, json: async () => ({ standings: { entries: [] } }) };
        }
        if (url.includes('schedule')) {
          return { ok: true, json: async () => ({ events: [] }) };
        }
        if (url.includes('teams')) {
          return {
            ok: true,
            json: async () => ({ team: { record: { items: [{ summary: '0-0' }] } } }),
          };
        }
        if (url.includes('hoopsrumors.com') && url.includes('feed')) {
          return {
            ok: true,
            text: async () => `
                    <rss>
                        <channel>
                            <item>
                                <title>Spurs News</title>
                                <link>http://spurs.com</link>
                                <pubDate>${new Date().toUTCString()}</pubDate>
                            </item>
                        </channel>
                    </rss>
                 `,
          };
        }
        return { ok: false };
      });

      const result = await getSportsPageData();

      expect(result.allLeagueNews).toHaveLength(1);
      expect(result.teamData).toBeDefined();

      // Red Sox (from MY_TEAMS)
      const redSox = result.teamData.find((t: any) => t.name === 'Red Sox');
      expect(redSox).toBeDefined();
      expect(redSox.recentItems).toHaveLength(1);

      // Spurs (from EXTRA_TEAMS)
      const spurs = result.teamData.find((t: any) => t.name === 'San Antonio Spurs');
      expect(spurs).toBeDefined();
      expect(spurs.recentItems).toHaveLength(1);
      expect(spurs.recentItems[0].title).toBe('Spurs News');
      // Ensure url is present and link is not
      expect(spurs.recentItems[0].url).toBe('http://spurs.com');
      expect(spurs.recentItems[0].link).toBeUndefined();
    });

    it('handles partial failures', async () => {
      (rssNewsLogic.getMyTeamsNews as any).mockRejectedValue(new Error('Fail'));
      (rssNewsLogic.getAllLeagueNews as any).mockResolvedValue([]);

      // Mock fetch to fail
      (fetch as any).mockRejectedValue(new Error('Fetch Fail'));

      const result = await getSportsPageData();

      // Should still return structure, just empty
      expect(result.teamData).toEqual([]);
      expect(result.allLeagueNews).toEqual([]);
    });

    it('handles timeout', async () => {
      vi.useFakeTimers();
      (rssNewsLogic.getMyTeamsNews as any).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return [];
      });
      (rssNewsLogic.getAllLeagueNews as any).mockResolvedValue([]);

      const promise = getSportsPageData();
      vi.advanceTimersByTime(9500);

      const result = await promise;
      expect(result.fetchError).toBeDefined();
      expect(result.fetchError.message).toMatch(/timed out/);

      vi.useRealTimers();
    });
  });
});
