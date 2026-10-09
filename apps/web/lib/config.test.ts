import { ConfigError, getConfig } from "./config";

const ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_STELLAR_HORIZON_URL",
  "NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL",
  "NEXT_PUBLIC_STELLAR_NETWORK",
] as const;

const originalEnv: Record<string, string | undefined> = {};

beforeAll(() => {
  for (const key of ENV_KEYS) {
    originalEnv[key] = process.env[key];
  }
});

afterAll(() => {
  for (const key of ENV_KEYS) {
    const previous = originalEnv[key];
    if (previous === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = previous;
    }
  }
});

beforeEach(() => {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
  {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  }
});

describe("getConfig", () => {
  it("returns the Supabase URL from the environment", () => {
    const config = getConfig();
    expect(config.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
  });

  it("returns the Supabase anon key from the environment", () => {
    const config = getConfig();
    expect(config.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key");
  });

  it("defaults the Horizon URL to the testnet endpoint", () => {
    const config = getConfig();
    expect(config.NEXT_PUBLIC_STELLAR_HORIZON_URL).toBe(
      "https://horizon-testnet.stellar.org",
    );
  });

  it("defaults the Soroban RPC URL to the testnet endpoint", () => {
    const config = getConfig();
    expect(config.NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL).toBe(
      "https://soroban-testnet.stellar.org",
    );
  });

  it("defaults stellarNetwork to testnet when unset", () => {
    const config = getConfig();
    expect(config.stellarNetwork).toBe("testnet");
  });

  it("respects an explicit network override", () => {
    process.env.NEXT_PUBLIC_STELLAR_NETWORK = "mainnet";
    const config = getConfig();
    expect(config.stellarNetwork).toBe("mainnet");
  });

  it("uses explicit Horizon and Soroban URLs when provided", () => {
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL = "https://custom-horizon.example";
    process.env.NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL = "https://custom-soroban.example";
    const config = getConfig();
    expect(config.NEXT_PUBLIC_STELLAR_HORIZON_URL).toBe("https://custom-horizon.example");
    expect(config.NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL).toBe(
      "https://custom-soroban.example",
    );
  });

  it("throws a ConfigError when the Supabase URL is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(() => getConfig()).toThrow(ConfigError);
  });

  it("throws a ConfigError when the Supabase URL is an empty string", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    expect(() => getConfig()).toThrow(ConfigError);
  });

  it("throws a ConfigError when the Supabase anon key is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => getConfig()).toThrow(ConfigError);
  });
});
