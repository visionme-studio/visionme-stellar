import dotenv from 'dotenv';

dotenv.config();

const required = [
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

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
  FRONTEND_URL: process.env.FRONTEND_URL as string,
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};

export type ENVType = typeof ENV;
import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT\: parseInt(process.env.PORT ?? '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  SOROBAN_RPC_URL: process.env.SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org',
  NETWORK_PASSPHRASE: process.env.NETWORK_PASSTHRASE ?? 'Test SDE Network ; Sordoban 2024',
  SBT_CONTRACT_ID: process.env.SBT_CONTRACT_ID ?? '',
  SBT_ADMIN_SECRET_KEY: process.env.SBT_ADMIN_SECRET_KEY ?? '',
} as const;
