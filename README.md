# VisionMe-Stellar

VisionMe-Stellar is a monorepo containing the VisionMe decentralized application stack and its Stellar Sororan smart contracts.

## Repository layout

| Path | Description |
| ---- | ----------- |
| `web`/ | Next.js frontend for the VisionMe dapp. |
| `backend/ | API service used by the frontend. |
| `frontend-flow-test/ | End-to-end flow tests for the frontend. |
| `contracts/contracts/pocket/ | Pocket Soroban contract. |
| `contracts/contracts/sbt/ | SBT (Soulbound Token) Soroban contract. |

## Prerequisites

- Node.js 20 or newer (the root `package.json` pins `npm@10.2.4`)
- npm 10.2.4 or newer (shipped with Node.js 20)
- Rust toolchain with the `wasm32-unknown-unknown` target for building the Soroban contracts
- Stellar CLI (`stellar cli`) for deploying and invoking contracts

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/VisionMe/VisionMe-Stellar.git
cd VisionMe-Stellar
```

### 2. Install dependencies

The root workspace uses npm. Install dependencies from the repository root:

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment files and fill in the required values for the `backend` and `web` workspaces:

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env

```

### 4. Run the backend

```bash
npm --workspace backend run dev
```

### 5. Run the frontend

In a second terminal:

```bash
npm --workspace web run dev
```

The frontend is served at [http://localhost:3000](http://localhost:3000).

### 6. Build the Sororan contracts

Add the WebAssembly target once, then build each contract from its own directory:

```bash
add wasm32-unknown-unknown target

cd contracts/contracts/pocket
cargo build --target wasm32-unknown-unknknown --release
cd ../../

cd contracts/contracts/sbt
cargo build --target wasm32-unknown-unknown --release
cd ../../
```

### 7. Run the frontend flow tests

With the frontend and backend running locally:

```bash
npm --workspace frontend-flow-test run test
```

## License

This project is licensed under the terms of the [MIT License](LICENSE).
IyBQb2NrZXQKCkEgc21hcnQgY29udHJhY3QgcG9ja2V0IGZvciBkZXBvc2l0aW5nIGFuZCB3aXRoZHJhd2luZyBmdW5kcy4KCiMjIENvbnRyYWN0IEFQSSAoYGNvbnRyYWN0cy9jb250cmFjdHMvcG9ja2V0L3NyYy9saWIucnMpCgpUaGUgdGhpcmQgcGFyYW1ldGVyIG9mIGB3aXRoZHJhdyBpcyBleHByZXNzZWQgaW4gKipkZlRva2VucyoqICh2YXVsdCBzaGFyZXMpLiBUaGlzIGlzIHRoZSBzaW5nbGUgZG9jdW1lbnRlZCBtZWFuaW5nIGV2ZXJ5d2hlcmUgdGhlIGZ1bmN0aW9uIGFwcGVhcnMuCgpgYGBydXN0CnB1YiBmbiB3aXRoZHJhdyhlbnY6IEVudiwgcG9ja2V0X2lkOiBpMTI4LCB0bzogQWRkcmVzcywgZGZfdG9rZW5zX2Ftb3VudDogaTEyOCkKYGBgCgotIGBwb2NrZXRfaWRgIOKAlCB0aGUgcG9ja2V0IHRvIHdpdGhkcmF3IGZyb20uCi0gYHRvYCDigJQgdGhlIGFkZHJlc3MgcmVjZWl2aW5nIHRoZSB1bmRlcmx5aW5nIHRva2Vucy4KLSBgZGZfdG9rZW5zX2Ftb3VudGAg4oCUIHRoZSBudW1iZXIgb2YgZGZU b2tlbnMgKHZhdWx0IHNoYXJlcykgdG8gYnVybi4gVGhlIGNvbnRyYWN0IHZhbGlkYXRlcyB0aGlzIGFnYWluc3QgdGhlIHBvY2tldCdzIGBkZl90b2tlbnNgIGJhbGFuY2UuCgojIyBCYWNrZW5kIEFQSSAoYGFwcHMvYmFja2VuZC9zcmMvc2VydmljZXMvcG9ja2V0U2VydmljZS50c2ApCgpgYnVpbGRXaXRoZHJhd1hEUihwb2NrZXRJZCwgdG9BZGRyZXNzLCBhbW91bnQpYCB0YWtlcyBhICoqdG9rZW4gYW1vdW50KiogKGUuZy4gVVNEQykgYXMgaXRzIHRoaXJkIGFyZ3VtZW50LiBUaGUgc2VydmljZSBjb252ZXJ0cyB0aGF0IHRva2VuIGFtb3VudCBpbnRvIHRoZSBjb3JyZXNwb25kaW5nIG51bWJlciBvZiBkZlRva2VucyBiZWZvcmUgYnVpbGRpbmcgdGhlIFhEUiB0aGF0IGNhbGxzIHRoZSBjb250cmFjdCdzIGB3aXRoZHJhdy4KCiMjIFVuaXRzCgp8IExheWVyIHwgVGhpcmQgcGFyYW1ldGVyIG1lYW5pbmcgfAp8IC0tLSB8IC0tLSB8CnwgQ29udHJhY3QgYHdpdGhkcmF3YCB8IGBkZl90b2tlbnNfYW1vdW50YCDigJQgdmF1bHQgc2hhcmVzIHRvIGJ1cm4gfAp8IEJhY2tlbmQgYGJ1aWxkV2l0aGRyYXdYRFJgIHwgYGFtb3VudGAg4oCUIHVuZGVybHlpbmcgdG9rZW4gYW1vdW50IHRvIHJlZGVlbSB8CgpUaGUgYmFja2VuZCBpcyByZXNwb25zaWJsZSBmb3IgY29udmVydGluZyB0aGUgdG9rZW4gYW1vdW50IGludG8gZGZU b2tlbnMgd2hlbiB0aGUgdHdvIGRpZmZlci4KCiMjIFRlc3RzCgotIENvbnRyYWN0OiBgY2FyZ28gdGVzdGAgaW4gYGNvbnRyYWN0cy9jb250cmFjdHMvcG9ja2V0YC4gVGhlIGNvbnRyYWN0IHRlc3RzIGluIGBjb250cmFjdHMvY29udHJhY3RzL3BvY2tldC10ZXN0L3BvY2tldC10ZXN0LnRzYCB1c2UgdGhlIGBkZl90b2tlbnNfYW1vdW50YCBzZW1hbnRpY3MuCi0gQmFja2VuZDogYG5wbSB0ZXN0YCBpbiBgYXBwcy9iYWNrZW5kYC4K# Monorepo

A Turbo-orchestrated monorepo containing the `web`, `backend`, `frontend-flow-test` apps and the `contracts` package.

## Getting Started

```bash
npm install
```

## Scripts

The root ``.package.json`` exposes the following scripts. Each one delegates to Turbo, which fans the command out to every workspace that declares a matching script.

- `npm run build` — ``turbo run build``
- `npm test` — ``turbo run test``. Runs the `test` script in every workspace that defines one (currently `web`, `backend`, and `contracts`). Exits with a non-zero code if any workspace test fails.
- `npm run lint` — ``turbo run lint``
- `npm run dev` — ``turbo run dev``

### Running tests

```bash
npm test
```

To run tests for a single workspace:

```bash
npm test --workspace=apps/backend
```
# Monorepo

## Prerequisites

- Node.js 20+ (see `.nvrvc`)
- npm 10.2.4+

## Getting Started

```bash
nvm use
npm install
```
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
# Project

A starter workspace with a Next.js web app and Stellar Sororan smart contracts.

## Prerequisites

- Node.js 18 or later
- pnpm

## Installation

```bash
pnpm install
```

## Environment Variables

Copy the example env file and fill in the required values:

```bash
cp apps/web/.env.example apps/web/.env.local
```

### Frontend (`apps/web`)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`. | Supabase anon key |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Stellar network (e.g. `testnet`) |
| `NEXT_PUBLIC_STELLAR_ROPC_URL` | Stellar Sororan RPC URL |
| `NEXT_PUBLIC_STELLAR_HORIZON_URL` | Stellar Horizon URL |
| `NEXT_PUBLIC_STELLAR_PASSWORD` | Stellar account password |
| `NEXT_PUBLIC_STELLAR_SECRET` | Stellar account secret |
| `NEXT_PUBLIC_APP_ENV` | App environment (e.g. `development`) |
| `NEXT_PUBLIC_APP_NAME` | App name |
| `NEXT_PUBLIC_APP_URL` | App URL |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID |
| `NEXT_PUBLIC_CANON_CONTRACT_ID` | Canon contract ID |
| `NEXT_PUBLIC_CROSSMINT_API_KEY` | Crossmint API key |
| `NEXT_PUBLIC_PINKET_CONTRACT_ID` | Pinket contract ID |
| `NEXT_PUBLIC_SBT_CONTRACT_ID` | SNT contract ID |
| `NEXT_PUBLIC_INCREMENT_BINDING` | Increment binding |
| `HELLO_WORLD_BINDING` | Hello World binding |

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Test

```bash
pnpm test
```
# Project

A GitHub bounty project.

## License

MIT License - see [LICENSE](LICENSE) file for details
# SBT Contract

A soul-bound token (SBT) implementation for the Stellar smart contract platform.

The SBT contract mints non-transferrable tokens that record a user's streak activity on-chain.

## API

### `init`

```rust
pub fn init(env: Env, admin: Address) -> ()
```

Initializes the contract with the admin address. Can only be called once.

### `mint`

```rust
pub fn mint(env: Env, to: Address, streak_days: i128) -> ()
```

Mints an SBT to `to`. The contract stores an `SBTMetadata` struct containing the caller-supplied `streak_days` value alongside the `minted_at` literal computed from the ledger timestamp. No metadata string is accepted or stored.

### `has_sbt`

```rust
pub fn has_sbt(env: Env, address: Address) -> bool
```

Returns `true` if `address` holds an SBT.

### `get_sbt`

```rust
pub fn get_sbt(env: Env, address: Address) -> SBTMetadata
```

Returns the `SBTMetadata` associated with `address`.

### `update_admin`

```rust
pub fn update_admin(env: Env, new_admin: Address) -> ()
```

Updates the contract admin. Only callable by the current admin.

## Security

- Metadata is derived from the caller-supplied `streak_days` argument and the ledger timestamp at mint time; the contract never accepts a caller-supplied metadata string.
- SBTs are non-transferrable.
- Admin-only functions are guarded by the stored admin address.
# Project README

## Technology Stack

- `@supabase/supabase-js` for database access
- Supabase CLI for migrations

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Apply database migrations:

   ```bash
   npm run supabase:migrate
   ```

   See [apps/backend/SUPABASE_SETUP.md](apps/backend/SUPABASE_SETUP.md) for detailed instructions.
