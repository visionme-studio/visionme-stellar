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
IyBQb2NrZXQKCkEgc21hcnQgY29udHJhY3QgcG9ja2V0IGZvciBkZXBvc2l0aW5nIGFuZCB3aXRoZHJhd2luZyBmdW5kcy4KCiMjIENvbnRyYWN0IEFQSSAoYGNvbnRyYWN0cy9jb250cmFjdHMvcG9ja2V0L3NyYy9saWIucnMpCgpUaGUgdGhpcmQgcGFyYW1ldGVyIG9mIGB3aXRoZHJhdyBpcyBleHByZXNzZWQgaW4gKipkZlRva2VucyoqICh2YXVsdCBzaGFyZXMpLiBUaGlzIGlzIHRoZSBzaW5nbGUgZG9jdW1lbnRlZCBtZWFuaW5nIGV2ZXJ5d2hlcmUgdGhlIGZ1bmN0aW9uIGFwcGVhcnMuCgpgYGBydXN0CnB1YiBmbiB3aXRoZHJhdyhlbnY6IEVudiwgcG9ja2V0X2lkOiBpMTI4LCB0bzogQWRkcmVzcywgZGZfdG9rZW5zX2Ftb3VudDogaTEyOCkKYGBgCgotIGBwb2NrZXRfaWRgIOKAlCB0aGUgcG9ja2V0IHRvIHdpdGhkcmF3IGZyb20uCi0gYHRvYCDigJQgdGhlIGFkZHJlc3MgcmVjZWl2aW5nIHRoZSB1bmRlcmx5aW5nIHRva2Vucy4KLSBgZGZfdG9rZW5zX2Ftb3VudGAg4oCUIHRoZSBudW1iZXIgb2YgZGZU b2tlbnMgKHZhdWx0IHNoYXJlcykgdG8gYnVybi4gVGhlIGNvbnRyYWN0IHZhbGlkYXRlcyB0aGlzIGFnYWluc3QgdGhlIHBvY2tldCdzIGBkZl90b2tlbnNgIGJhbGFuY2UuCgojIyBCYWNrZW5kIEFQSSAoYGFwcHMvYmFja2VuZC9zcmMvc2VydmljZXMvcG9ja2V0U2VydmljZS50c2ApCgpgYnVpbGRXaXRoZHJhd1hEUihwb2NrZXRJZCwgdG9BZGRyZXNzLCBhbW91bnQpYCB0YWtlcyBhICoqdG9rZW4gYW1vdW50KiogKGUuZy4gVVNEQykgYXMgaXRzIHRoaXJkIGFyZ3VtZW50LiBUaGUgc2VydmljZSBjb252ZXJ0cyB0aGF0IHRva2VuIGFtb3VudCBpbnRvIHRoZSBjb3JyZXNwb25kaW5nIG51bWJlciBvZiBkZlRva2VucyBiZWZvcmUgYnVpbGRpbmcgdGhlIFhEUiB0aGF0IGNhbGxzIHRoZSBjb250cmFjdCdzIGB3aXRoZHJhdy4KCiMjIFVuaXRzCgp8IExheWVyIHwgVGhpcmQgcGFyYW1ldGVyIG1lYW5pbmcgfAp8IC0tLSB8IC0tLSB8CnwgQ29udHJhY3QgYHdpdGhkcmF3YCB8IGBkZl90b2tlbnNfYW1vdW50YCDigJQgdmF1bHQgc2hhcmVzIHRvIGJ1cm4gfAp8IEJhY2tlbmQgYGJ1aWxkV2l0aGRyYXdYRFJgIHwgYGFtb3VudGAg4oCUIHVuZGVybHlpbmcgdG9rZW4gYW1vdW50IHRvIHJlZGVlbSB8CgpUaGUgYmFja2VuZCBpcyByZXNwb25zaWJsZSBmb3IgY29udmVydGluZyB0aGUgdG9rZW4gYW1vdW50IGludG8gZGZU b2tlbnMgd2hlbiB0aGUgdHdvIGRpZmZlci4KCiMjIFRlc3RzCgotIENvbnRyYWN0OiBgY2FyZ28gdGVzdGAgaW4gYGNvbnRyYWN0cy9jb250cmFjdHMvcG9ja2V0YC4gVGhlIGNvbnRyYWN0IHRlc3RzIGluIGBjb250cmFjdHMvY29udHJhY3RzL3BvY2tldC10ZXN0L3BvY2tldC10ZXN0LnRzYCB1c2UgdGhlIGBkZl90b2tlbnNfYW1vdW50YCBzZW1hbnRpY3MuCi0gQmFja2VuZDogYG5wbSB0ZXN0YCBpbiBgYXBwcy9iYWNrZW5kYC4K