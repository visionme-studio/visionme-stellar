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
