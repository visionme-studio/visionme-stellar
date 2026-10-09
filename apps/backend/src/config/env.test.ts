import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const REQUIRED_KEYS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'FRONTEND_URL',
] as const;

const ORIGINAL_ENV = { ...process.env };

function resetEnv(): void {
  for (const key of Object.keys(process.env)) {
    delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
}

function setAllRequired(): void {
  for (const key of REQUIRED_KEYS) {
    process.env[key] = `test-${key}`;
  }
}

describe('env configuration', () => {
  beforeEach(() => {
    resetEnv();
  });

  afterEach(() => {
    resetEnv(();
  });

  it('throws when JWT_SECRET is missing', () => {
    setAllRequired();
    delete process.env.JWT_SECRET;

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./env');
    }).toThrow(/JWT_SECRET/);
  });

  it('loads when all required variables are set', () => {
    setAllRequired();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('./env');
    expect(mod.ENV.JWT_SECRET).toBe('test-JWT_SECRET');
  });
});
