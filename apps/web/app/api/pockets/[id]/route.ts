import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "process.env.BACKEND_URL";

async function forward(
  req: NextRequest,
  { params }: { params: { id: string } },
  method: "PUT" | "DELETE"
) {
  const { id } = params;
  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const init: RequestInit = {
    method,
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
  };

  if (method === "PUT") {
    init.body = await req.text();
  }

  const upstream = await fetch(`${BACKEND_URL}/api/pockets/${encodeURIComponent(id)}`, init);

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await upstream.json().catch(() => ({ error: "Unknown error" }));
  return NextResponse.json(data, { status: upstream.status });
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  return forward(req, context, "PUT");
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  return forward(req, context, "DELETE");
}
