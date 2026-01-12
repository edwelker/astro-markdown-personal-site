import { describe, it, expect, afterEach } from 'vitest';
import { validateEnv } from '../scripts/lib-credentials.mjs';

describe('Credentials Library', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return credentials when all environment variables are present', () => {
    process.env = {
      ...originalEnv,
      TEST_CLIENT_ID: 'abc',
      TEST_SECRET: '123',
    };

    const result = validateEnv(
      {
        clientId: 'TEST_CLIENT_ID',
        secret: 'TEST_SECRET',
      },
      'TestService'
    );

    expect(result).toEqual({
      clientId: 'abc',
      secret: '123',
    });
  });

  it('should throw a human-readable error when credentials are missing', () => {
    process.env = {
      ...originalEnv,
      TEST_CLIENT_ID: 'abc',
      // TEST_SECRET is missing
    };

    expect(() => {
      validateEnv(
        {
          clientId: 'TEST_CLIENT_ID',
          secret: 'TEST_SECRET',
        },
        'TestService'
      );
    }).toThrow(
      'TestService credentials are missing. Please check your environment variables: TEST_SECRET'
    );
  });

  it('should list all missing variables in the error message', () => {
    process.env = { ...originalEnv };
    // Both missing

    expect(() => {
      validateEnv(
        {
          clientId: 'TEST_CLIENT_ID',
          secret: 'TEST_SECRET',
        },
        'TestService'
      );
    }).toThrow(
      'TestService credentials are missing. Please check your environment variables: TEST_CLIENT_ID, TEST_SECRET'
    );
  });
});
