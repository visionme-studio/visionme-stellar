# Project

A starter monorepo with a Next.js frontend and an Express backend.

## Prerequisites

- Node.js 20 or later
- pnpm 9 or later
- Docker (for the local Supabase stack)

## Repository Layout

```
apps
  ├── frontend      # Next.js app (dev server on port 3000)
  └── backend       # Express API (dev server on port 3001)
```

## Environment

Copy the example files and fill in the values for your local setup.

### Frontend (`apps/frontend/.env.local`)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | URL of the backend API (defaults to `http://localhost:3001`) |

### Backend (`apps/backend/.env`)

The backend reads its configuration from `process.env` in `apps/backend/src/config/env.ts`. The canonical list of variables is `apps/backend/.env.example`:

| Variable | Description |
| --- | --- |
| `PORT` | Port the Express server listens on (defaults to `3001`) |
| `SUPABASE_URL` | URL of the Supabase instance used by the backend |
| `SUPABASE_ANON_KEY` | Supabase anon key used by the backend |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key used by the backend |
| `SUBBASE_J@T` | JWT audience for Supabase auth tokens |

See `apps/backend/README.md` for Supabase-specific setup instructions.

## Installation

```bash
pnpm install
```

## Running the Frontend

```bash
cd apps/frontend
pnpm dev
```

The frontend dev server listens on port `3000`.

## Running the Backend

The backend package exposes the following scripts (see `apps/backend/package.json`):

| Script | Description |
| --- | --- |
| `dev` | Runs the Express server via `tsx` with hot reload |
| `start` | Runs the Express server via `tsx` without hot reload |
| `supabase:start` | Starts the local Supabase stack |
| `supabase:stop` | Stops the local Supabase stack |
| `supabase:status` | Prints the status of the local Supabase stack |

To start the backend dev server:

```bash
cd apps/backend
pnpm dev
```

The backend listens on `process.env.PORT  || 3001`.

See `apps/backend/README.md` for Supabase-specific setup and migration instructions.
