import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTeamData } from '../src/lib/sports/team_records_and_data';

// Mock global fetch
const globalFetch = global.fetch;

describe('Sports Schedule Logic', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
        // Mock Date to a fixed point in time so "recent" and "upcoming" are deterministic
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
    });

    afterEach(() => {
        global.fetch = globalFetch;
        vi.useRealTimers();
    });

    it('should correctly identify a recent win', async () => {
        const teamName = 'Red Sox'; // ID: 2, MLB
        const leagueRecords = {}; 

        // Mock responses
        const mockSchedule = {
            events: [
                {
                    date: '2023-10-14T18:00:00Z', // Yesterday
                    id: '123',
                    competitions: [{
                        status: { type: { completed: true } },
                        competitors: [
                            { homeAway: 'home', team: { id: '2' }, score: { displayValue: '5' }, winner: true }, // Red Sox (Home) Win
                            { homeAway: 'away', team: { id: '99', displayName: 'Blue Jays' }, score: { displayValue: '3' }, winner: false }
                        ]
                    }],
                    links: [{ rel: ['boxscore'], href: 'http://boxscore' }]
                }
            ]
        };
        
        const mockTeam = { team: { record: { items: [{ summary: '10-5' }] } } };

        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/schedule')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSchedule) });
            if (url.includes('/teams/2')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTeam) });
            return Promise.resolve({ ok: false });
        });

        const result = await getTeamData(teamName, leagueRecords);
        
        expect(result.schedule).toHaveLength(1);
        const game = result.schedule[0];
        expect(game.completed).toBe(true);
        expect(game.isWin).toBe(true);
        expect(game.score).toBe('5-3');
        expect(game.text).toContain('vs. Blue Jays'); // Home game
    });

    it('should correctly identify a recent loss', async () => {
        const teamName = 'Red Sox';
        const leagueRecords = {}; 

        const mockSchedule = {
            events: [
                {
                    date: '2023-10-14T18:00:00Z',
                    id: '124',
                    competitions: [{
                        status: { type: { completed: true } },
                        competitors: [
                            { homeAway: 'away', team: { id: '2' }, score: { displayValue: '1' }, winner: false }, // Red Sox (Away) Loss
                            { homeAway: 'home', team: { id: '99', displayName: 'Rays' }, score: { displayValue: '4' }, winner: true }
                        ]
                    }],
                    links: [{ rel: ['boxscore'], href: 'http://boxscore' }]
                }
            ]
        };
        
        const mockTeam = { team: { record: { items: [{ summary: '10-6' }] } } };

        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/schedule')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSchedule) });
            if (url.includes('/teams/2')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTeam) });
            return Promise.resolve({ ok: false });
        });

        const result = await getTeamData(teamName, leagueRecords);
        
        expect(result.schedule).toHaveLength(1);
        const game = result.schedule[0];
        expect(game.completed).toBe(true);
        expect(game.isWin).toBe(false);
        expect(game.score).toBe('1-4');
        expect(game.text).toContain('@ Rays'); // Away game
    });

    it('should handle object-style scores and primitive scores', async () => {
         const teamName = 'Red Sox';
         const mockSchedule = {
            events: [
                {
                    date: '2023-10-14T18:00:00Z',
                    id: '125',
                    competitions: [{
                        status: { type: { completed: true } },
                        competitors: [
                            { homeAway: 'home', team: { id: '2' }, score: '10', winner: true },
                            { homeAway: 'away', team: { id: '99', displayName: 'Jays' }, score: 5, winner: false }
                        ]
                    }]
                }
            ]
        };
        const mockTeam = { team: { record: { items: [{ summary: '10-5' }] } } };

        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/schedule')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSchedule) });
            if (url.includes('/teams/2')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTeam) });
            return Promise.resolve({ ok: false });
        });

        const result = await getTeamData(teamName, {});
        expect(result.schedule[0].score).toBe('10-5');
    });

    it('should sort recent games chronologically (older to newer)', async () => {
        const teamName = 'Red Sox';
        // Mock Date is 2023-10-15T12:00:00Z
        
        const gameYesterday = {
            date: '2023-10-14T18:00:00.000Z',
            id: '1',
            competitions: [{ status: { type: { completed: true } }, competitors: [{ homeAway: 'home', team: { id: '2' }, score: '5', winner: true }, { homeAway: 'away', team: { id: '99' }, score: '3' }] }]
        };
        const gameToday = {
            date: '2023-10-15T10:00:00.000Z', // Earlier today
            id: '2',
            competitions: [{ status: { type: { completed: true } }, competitors: [{ homeAway: 'home', team: { id: '2' }, score: '2', winner: false }, { homeAway: 'away', team: { id: '98' }, score: '4' }] }]
        };

        const mockSchedule = {
            events: [gameToday, gameYesterday] // API might return in any order
        };
        
        const mockTeam = { team: { record: { items: [{ summary: '10-5' }] } } };

        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/schedule')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSchedule) });
            if (url.includes('/teams/2')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTeam) });
            return Promise.resolve({ ok: false });
        });

        const result = await getTeamData(teamName, {});
        
        expect(result.schedule).toHaveLength(2);
        // Expect older game (Yesterday) first
        expect(result.schedule[0].date.toISOString()).toBe(gameYesterday.date);
        // Expect newer game (Today) second
        expect(result.schedule[1].date.toISOString()).toBe(gameToday.date);
    });

    it('should correctly identify upcoming games', async () => {
        const teamName = 'Red Sox';
        const now = new Date('2023-10-15T12:00:00Z');
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        const mockSchedule = {
            events: [
                {
                    date: tomorrow.toISOString(),
                    id: '126',
                    competitions: [{
                        status: { type: { completed: false } },
                        competitors: [
                            { homeAway: 'home', team: { id: '2' } },
                            { homeAway: 'away', team: { id: '99', displayName: 'Orioles' } }
                        ]
                    }]
                }
            ]
        };
        
        const mockTeam = { team: { record: { items: [{ summary: '0-0' }] } } };

        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/schedule')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSchedule) });
            if (url.includes('/teams/2')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTeam) });
            return Promise.resolve({ ok: false });
        });

        const result = await getTeamData(teamName, {});
        expect(result.schedule).toHaveLength(1);
        expect(result.schedule[0].completed).toBe(false);
        expect(result.schedule[0].text).toContain('vs. Orioles');
    });
});
