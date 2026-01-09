import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { record, FIXTURE_DIR, DATA_DIR, FILES_TO_RECORD } from '../scripts/record-fixtures.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

// Mock fs/promises
vi.mock('node:fs/promises', () => ({
  default: {
    mkdir: vi.fn(),
    copyFile: vi.fn(),
  }
}));

describe('Record Fixtures Script', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('console', {
      log: vi.fn(),
      warn: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create the fixture directory', async () => {
    await record();
    expect(fs.mkdir).toHaveBeenCalledWith(FIXTURE_DIR, { recursive: true });
  });

  it('should attempt to copy all defined files', async () => {
    await record();
    // Should attempt to copy each file in the list
    expect(fs.copyFile).toHaveBeenCalledTimes(FILES_TO_RECORD.length);
    
    const firstFile = FILES_TO_RECORD[0];
    const expectedSrc = path.join(DATA_DIR, firstFile);
    const expectedDest = path.join(FIXTURE_DIR, `sample-${firstFile}`);
    
    expect(fs.copyFile).toHaveBeenCalledWith(expectedSrc, expectedDest);
  });

  it('should log success when copy succeeds', async () => {
    fs.copyFile.mockResolvedValue(undefined);
    await record();
    
    expect(console.log).toHaveBeenCalledTimes(FILES_TO_RECORD.length);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Recorded:'));
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should log warning when copy fails (file not found)', async () => {
    fs.copyFile.mockRejectedValue(new Error('File not found'));
    await record();
    
    expect(console.warn).toHaveBeenCalledTimes(FILES_TO_RECORD.length);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Skip:'));
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should handle mixed success and failure', async () => {
    // Fail the first one, succeed the rest
    fs.copyFile.mockImplementation(async (src) => {
      if (src.includes(FILES_TO_RECORD[0])) {
        throw new Error('Missing');
      }
      return;
    });

    await record();

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(FILES_TO_RECORD[0]));
    
    expect(console.log).toHaveBeenCalledTimes(FILES_TO_RECORD.length - 1);
  });
});
