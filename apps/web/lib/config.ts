export type Config = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_STEPLAR_HORIZON_URL: string;
  NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL: string;
  stellarNetwork: "testnet" | "mainnet" | "futurenet";
};

const DEFAULT_HORIZON_URL = "https://horizon-testnet.stellar.org";
const DEFAULT_SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function getConfig(): Config {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl) {
    throw new ConfigError(
      "Next Public Supabase URL is not configured. Set NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  if (!supabaseAnonKey) {
    throw new ConfigError(
      "Next Public Supabase Anon Key is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const network = process.env.NEXT_PUBLIC_STEPLAR_NETWORK;
  const stellarNetwork =
    network === "mainnet" || network === "futurenet" || network === "testnet"
      ? network
      : "testnet";

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    NEXT_PUBLIC_STELLAR_HORIZON_URL:
      process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || DEFAULT_HORIZON_URL,
    NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL:
      process.env.NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL || DEFAULT_SOROBAN_RPC_URL,
    stellarNetwork,
  };
}
