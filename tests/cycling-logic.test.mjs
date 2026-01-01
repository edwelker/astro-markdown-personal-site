import { describe, it, expect } from 'vitest';
import { transformStravaData } from '../scripts/cycling-logic.mjs';

describe('Cycling Logic', () => {
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
        type: 'Ride',
        visibility: 'everyone'
      }
    ];

    const result = transformStravaData(activities, mockNow);

    // Year stats (2025) should be empty
    expect(result.year.count).toBe(0);
    expect(result.year.distance).toBe("0");

    // Month stats should fall back to December
    expect(result.month.name).toBe('December');
    expect(result.month.distance).toBe(10); // 10 miles
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
        type: 'Ride',
        visibility: 'everyone'
      }
    ];

    const result = transformStravaData(activities, mockNow);

    expect(result.year.count).toBe(1);
    expect(result.year.distance).toBe("10");
    expect(result.month.name).toBe('January');
    expect(result.month.distance).toBe(10);
  });
});
