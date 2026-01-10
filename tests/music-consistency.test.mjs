import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

describe('Music Data Consistency', () => {
  it('should have matching periods in fetch script and UI components', () => {
    // 1. Get periods from fetch script
    const fetchScript = fs.readFileSync('scripts/music-fetch.mjs', 'utf-8');
    const periodsMatch = fetchScript.match(/const periods = \[(.*?)\]/s);
    if (!periodsMatch) throw new Error('Could not find periods in music-fetch.mjs');
    
    const periods = periodsMatch[1]
      .split(',')
      .map(p => p.trim().replace(/['"]/g, ''))
      .filter(Boolean);

    // Define expected headers based on periods
    const periodToHeader = {
      '7day': 'Last 7 Days',
      '1month': 'Last Month',
      '3month': 'Last 3 Months',
      '12month': 'Last 12 Months',
      'overall': 'All Time'
    };

    // 2. Check MusicStats.astro (shows first two periods)
    const musicStats = fs.readFileSync('src/components/MusicStats.astro', 'utf-8');
    
    const firstPeriod = periods[0];
    const secondPeriod = periods[1];

    expect(musicStats).toContain(periodToHeader[firstPeriod]);
    expect(musicStats).toContain(periodToHeader[secondPeriod]);

    // 3. Check music.astro (shows all periods)
    const musicPage = fs.readFileSync('src/pages/music.astro', 'utf-8');
    
    periods.forEach(period => {
      const expectedHeader = periodToHeader[period];
      if (!expectedHeader) throw new Error(`No header mapping for period: ${period}`);
      expect(musicPage).toContain(expectedHeader);
    });
  });
});
