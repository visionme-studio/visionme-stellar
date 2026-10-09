import { ENV } from '../config/env';
import { crosmintAuth } from '../lib/crossmintAuth';

export interface CrossmintUser {
  userId: string;
  email?: string;
  walletAddress?: string;
  [walletAddress: string]: unknown;
}

export interface VerifyTokenResponse {
  userId: string;
  email?: string;
  walletAddress?: string;
  [key: string]: unknown;
}

export class CrossmintServiceError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'CrossmintServiceError';
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const crossmintService = {
  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    if (!token || typeof token !== 'string') {
      throw new CrossmintServiceError('verifyToken: token must be a non-empty string');
    }

    const response = await fetch(`${ENV.CROSSMINT_API_URL}/api/v1/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new CrossmintServiceError(
        `verifyToken failed with status ${response.status}${errorBody ? `: ${errorBody}` : ''}`,
        { cause: { status: response.status, body: errorBody } },
      );
    }

    const json = await response.json().catch((cause) => {
      throw new CrossmintServiceError('verifyToken: response body was not valid JSON', { cause });
    });

    if (!isPlainObject(json)) {
      throw new CrossmintServiceError('verifyToken: response body was not an object');
    }

    if (typeof json.userId !== 'string' || json.userId.length === 0) {
      throw new CrossmintServiceError('verifyToken: response is missing a valid userId');
    }

    return json as VerifyTokenResponse;
  },

  async getUserProfile(userId: string): Promise<CrossmintUser> {
    try {
      const profile = await crossmintAuth.getUser(userId);
      if (!isPlainObject(profile)) {
        throw new CrossmintServiceError('getUserProfile: upstream returned an invalid profile');
      }
      return profile as CrossmintUser;
    } catch (error) {
      const upstreamMessage = error instanceof Error ? error.message : String(error);
      throw new CrossmintServiceError(
        `getUserProfile failed for user ${userId}: ${upstreamMessage}`,
        { cause: error },
      );
    }
  },
};

export default crossmintService;
