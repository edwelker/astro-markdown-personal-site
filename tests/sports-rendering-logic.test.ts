import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime } from '../src/lib/utils';

describe('Sports Page Rendering Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Mimic the logic from src/pages/sports.astro for "All News"
  const renderAllNewsMetadata = (item: any) => {
    // Logic: <span>{formatRelativeTime(item.date)}</span>
    return formatRelativeTime(item.date);
  };

  // Mimic the logic from src/pages/sports.astro for "MLB" and "NBA" panels
  const renderLeagueNewsMetadata = (item: any) => {
    // Logic: <span>{formatRelativeTime(item.date)}</span> <span ...>•</span> <span>{item.source}</span>
    // We simulate the text content result
    return `${formatRelativeTime(item.date)} • ${item.source}`;
  };

  it('renders "All News" metadata with only relative date', () => {
    const item = {
      date: new Date('2024-01-01T10:00:00Z'), // Today
      source: 'ESPN',
      url: 'http://espn.com/news',
    };

    const output = renderAllNewsMetadata(item);

    expect(output).toBe('Today');
    expect(output).not.toContain('ESPN');
    expect(output).not.toContain('•');
    expect(output).not.toContain('espn.com');
  });

  it('renders "League News" (MLB/NBA) metadata with date and source, but no domain', () => {
    const item = {
      date: new Date('2024-01-01T10:00:00Z'), // Today
      source: 'MLB Trade Rumors',
      url: 'http://mlbtraderumors.com/article',
    };

    const output = renderLeagueNewsMetadata(item);

    expect(output).toBe('Today • MLB Trade Rumors');
    // Ensure no trailing bullet or domain
    expect(output.split('•').length).toBe(2); // Only one separator
    expect(output).not.toContain('mlbtraderumors.com');
  });

  it('handles "Yesterday" correctly', () => {
    const item = {
      date: new Date('2023-12-31T10:00:00Z'), // Yesterday
      source: 'Source',
    };
    expect(renderAllNewsMetadata(item)).toBe('Yesterday');
  });
});
