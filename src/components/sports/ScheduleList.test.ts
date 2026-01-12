import { describe, it, expect, vi, afterEach } from 'vitest';

describe('ScheduleList Date Formatting', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('formats server-side dates in Eastern Time', () => {
    // 2023-10-26T00:00:00Z is Oct 25, 8:00 PM EDT
    const date = new Date('2023-10-26T00:00:00Z');
    const formatted = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    });

    expect(formatted).toBe('Oct 25, 8:00 PM');
  });

  it('updates client-side times using local timezone', () => {
    // Mock DOM element
    const mockTimeElement = {
      getAttribute: vi.fn().mockReturnValue('2023-10-26T00:00:00Z'),
      textContent: 'Server Time',
    };

    // Mock document.querySelectorAll
    const mockDocument = {
      querySelectorAll: vi.fn().mockReturnValue([mockTimeElement]),
    };

    // Inject mock document into global scope
    vi.stubGlobal('document', mockDocument);

    // Replicate the script logic from ScheduleList.astro
    function updateTimes() {
      const times = document.querySelectorAll('.game-time');
      times.forEach((time: any) => {
        const datetime = time.getAttribute('datetime');
        if (datetime) {
          const date = new Date(datetime);
          time.textContent = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
        }
      });
    }

    updateTimes();

    // Calculate expected string based on the test runner's local time
    const expected = new Date('2023-10-26T00:00:00Z').toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    expect(mockTimeElement.textContent).toBe(expected);
  });
});
