import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NAXA_BACKEND_URL ?? process.env.BACKEND_URL ?? 'http://localhost:3001';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const token = (body as { token?: string } | null)?.token;
  if (!token) {
    return NextResponse.json({ error: 'Missing Crossmint token' }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const text = await backendResponse.text();
    const data = text ? (JSON.parse(text) as unknown) : null;

    if (!backendResponse.ok) {
      return NextResponse.json(
        (data as { error?: string } | null) ?? { error: 'Auth callback failed' },
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
