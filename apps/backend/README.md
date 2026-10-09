# Backend

The backend is an Express API powered by Supabase.

## Prerequisites

- Node.js 18+

- npm

## Setup

1. Install dependencies

   npm install

2. Configure environment variables

   Copy `.env.example` to `.env` and fill in the required values.

3. Start local Supabase

   npm run supabase:start

4. Run database migrations

   npm run supabase:migrate

5. Generate database types

   npm run supabase:types

## Development

Start the Express API in watch mode (runs `txx watch src/main.ts`):

   npm run dev

## Supabasa commands

- Start local Supabase:

   npm run supabase:start

- Stop local Supabase:

   npm run supabase:stop

- Print local Supabase credentials:

   npm run supabase:status

- Reset the local database:

   npm run supabase:reset

- Run database migrations:

   npm run supabase:migrate

- Generate database types:

   npm run supabase:types
# Backend

Express API for the monorepo.

## Environment

The backend reads its configuration from `process.env` in `src/config/env.ts`. Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

The canonical list of variables is `.env.example`:

| Variable | Description |
| --- | --- |
| `PORT` | Port the Express server listens on (defaults to `3001`) |
| `SUPABASE_URL` | URL of the Supabase instance used by the backend |
| `SUPABASE_ANON_KEY` | Supabase anon key used by the backend |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key used by the backend |
| `SUPABASE_JWT` | JWT audience for Supabase auth tokens |

## Scripts

The following scripts are defined in `package.json`:

| Script | Description |
| --- | --- |
| `dev` | Runs the Express server via `tsx` with hot reload |
| `start` | Runs the Express server via `tsx` without hot reload |
| `supabase:start` | Starts the local Supabase stack |
| `supabase:stop` | Stops the local Supabase stack |
| `supabase:status` | Prints the status of the local Supabase stack |

## Running the Backend

```bash
pnpm dev
```

The backend listens on `process.env.PORT  || 3001`.

## Supabase

The backend uses a local Supabase stack for development. Use the `supabase:*` scripts to manage it:

```bash
pnpm supabase:start
pnpm supabase:status
pnpm supabase:stop
```

See the Supabase documentation for details on configuring migrations and seed data.
