import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NAXA_BACKEND_URL ?? process.env.BACKEND_URL ?? 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const authorization = req.headers.get('authorization');
  if (!authorization) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/user`, {
      headers: { Authorization: authorization },
      cache: 'no-store',
    });

    const text = await backendResponse.text();
    const data = text ? (JSON.parse(text) as unknown) : null;

    if (!backendResponse.ok) {
      return NextResponse.json(
        (data as { error?: string } | null) ?? { error: 'Failed to load user' },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(data ?? {}, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unable to reach auth backend' },
      { status: 502 },
    );
  }
}
