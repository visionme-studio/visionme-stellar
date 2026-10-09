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
