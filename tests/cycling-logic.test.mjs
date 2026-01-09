import { describe, it, expect, vi } from 'vitest';
import { transformStravaData } from '../scripts/cycling-logic.mjs';

// Mock Date for consistent test results
const MOCK_DATE = new Date('2023-08-15T12:00:00Z');
vi.setSystemTime(MOCK_DATE);

describe('Cycling Logic: transformStravaData', () => {
  it('should return default structure for empty or invalid input', () => {
    // With 0 distance in August, it falls back to July
    expect(transformStravaData([])).toEqual({
      year: { distance: '0.0', elevation: '0', count: 0 },
      month: { name: 'July', distance: '0.0' },
      recent: [],
      chart: Array(52).fill(0)
    });
    expect(transformStravaData(null)).toEqual({
      year: { distance: '0.0', elevation: '0', count: 0 },
      month: { name: 'July', distance: '0.0' },
      recent: [],
      chart: Array(52).fill(0)
    });
  });

  it('should correctly transform a list of Strava activities', () => {
    const mockActivities = [
      // YTD Ride (in August) - Public, Outdoor
      {
        id: 1,
        name: 'Morning Ride',
        start_date: '2023-08-10T10:00:00Z',
        distance: 16093.4, // 10 miles
        total_elevation_gain: 304.8, // 1000 feet
        sport_type: 'Ride',
        visibility: 'everyone',
        trainer: false,
      },
      // YTD Ride (in January) - Public, Outdoor
      {
        id: 2,
        name: 'Winter Miles',
        start_date: '2023-01-15T10:00:00Z',
        distance: 32186.9, // 20 miles
        total_elevation_gain: 152.4, // 500 feet
        sport_type: 'Ride',
        visibility: 'everyone',
        trainer: false,
      },
      // Virtual Ride (should be counted for totals, but not in recent)
      {
        id: 3,
        name: 'Zwift Race',
        start_date: '2023-08-01T18:00:00Z',
        distance: 40233.6, // 25 miles
        total_elevation_gain: 0, // 0 feet
        sport_type: 'VirtualRide',
        trainer: true,
      },
      // Private ride (should not appear in recent)
      {
        id: 4,
        name: 'Secret Loop',
        start_date: '2023-08-05T09:00:00Z',
        distance: 8046.72, // 5 miles
        total_elevation_gain: 60.96, // 200 feet
        sport_type: 'Ride',
        visibility: 'only_me',
      },
      // Last year's ride (should be ignored for totals, but included in recent if fetched)
      {
        id: 5,
        name: 'Old Ride',
        start_date: '2022-12-25T10:00:00Z',
        distance: 16093.4, // 10 miles
        total_elevation_gain: 100,
        sport_type: 'Ride',
      }
    ];

    const result = transformStravaData(mockActivities);

    expect(result.year.distance).toBe('60.0');
    expect(result.year.elevation).toBe('1,700');
    expect(result.year.count).toBe(4);
    
    expect(result.month.name).toBe('August');
    expect(result.month.distance).toBe('40.0');
    
    // Recent list now includes previous year rides if they are fetched
    expect(result.recent).toHaveLength(3);
    expect(result.recent[0]).toEqual({
      id: 1,
      name: 'Morning Ride',
      date: 'Aug 10',
      distance: '10.0',
      elevation: '1,000',
    });
    expect(result.recent[1]).toEqual({
      id: 2,
      name: 'Winter Miles',
      date: 'Jan 15',
      distance: '20.0',
      elevation: '500',
    });
    expect(result.recent[2]).toEqual({
      id: 5,
      name: 'Old Ride',
      date: 'Dec 25',
      distance: '10.0',
      elevation: '328',
    });

    expect(result.chart[2]).toBe(20); 
    expect(result.chart[31]).toBe(10); 
    expect(result.chart[30]).toBe(30);
  });

  it('should show previous month stats when current month has 0 distance (Jan 1st scenario)', () => {
    // Mock date: Jan 1st 2025, 10:00 AM EST (UTC-5) -> 15:00 UTC
    const mockNow = new Date('2025-01-01T15:00:00Z'); 
    
    const activities = [
      // Ride in Dec 2024
      {
        id: 1,
        name: 'Dec Ride',
        start_date: '2024-12-15T10:00:00Z',
        distance: 16093.4, // ~10 miles
        total_elevation_gain: 100,
        sport_type: 'Ride',
        visibility: 'everyone'
      }
    ];

    const result = transformStravaData(activities, mockNow);

    // Year stats (2025) should be empty
    expect(result.year.count).toBe(0);
    expect(result.year.distance).toBe("0.0");

    // Month stats should fall back to December
    expect(result.month.name).toBe('December');
    expect(result.month.distance).toBe("10.0"); // 10 miles
  });

  it('should show current month stats when rides exist in current year', () => {
    const mockNow = new Date('2025-01-02T15:00:00Z');
    
    const activities = [
      {
        id: 2,
        name: 'Jan Ride',
        start_date: '2025-01-01T15:00:00Z', // Jan 1st
        distance: 16093.4, // ~10 miles
        total_elevation_gain: 100,
        sport_type: 'Ride',
        visibility: 'everyone'
      }
    ];

    const result = transformStravaData(activities, mockNow);

    expect(result.year.count).toBe(1);
    expect(result.year.distance).toBe("10.0");
    expect(result.month.name).toBe('January');
    expect(result.month.distance).toBe("10.0");
  });
});
