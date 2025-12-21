import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';

vi.mock('fs');

describe('Flickr Fetcher: fs side effects', () => {
  it('should use regex-safe string matching for JSON output', () => {
    // Arrange
    const writeMock = vi.spyOn(fs, 'writeFileSync');
    const data = [{ id: "101" }];

    // Act
    fs.writeFileSync('test.json', JSON.stringify(data));

    // Assert
    expect(writeMock).toHaveBeenCalledWith(
      'test.json',
      expect.stringMatching(/"id":\s?"101"/)
    );
  });
});
