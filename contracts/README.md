# Contracts

Capability-based smart contracts for VisionMe.

## Contracts in this folder

- **increment** - Minimal counter contract used as a smoke test for the build toolchain.
- **events-increment** - Counter contract that emits events on every increment.
- **fungible-token** - Reference fungible token (ERC-20-like) contract.
- **non-fungible-token** - Reference non-fungible token (ERC-721-like) contract.
- **hello-world** - Minimal greeting contract for getting started.
- **starter** - Starter template for new contracts.
- **pocket** - VisionMe's savings pocket contract. It builds against the Defindex vault by using `contractimport!("../../wasms/defindex_vault.wasm")`, so `contracts/wasms/defindex_vault.wasm` must exist before `pocket` will build.
- **sbt** - VisionMe's soulbound token contract for achievements.
- **pocket-test** - TypeScript integration script that exercises the `pocket` contract (an integration test, not a Rust crate).
# Soroban Contracts

This directory contains the Soroban smart contracts and the tooling used to build, optimize and deploy them.

## Prerequisites

- [Stellar CLI v23+](https://github.com/stellar/stellar-cli)
- Rust toolchain with the WASM target installed:

  ```sh
  rustup target add wasm32-unknown-unknown
  ```

## Build

Build all contracts from the contracts directory:

```sh
npm run build
```

Or build a single crate with the Stellar CLI:

```sh
stellar contract build
--package hello-world
```

WASM output is placed under `target/wasm32-unknown-unknown/release/<crate_name>.wasm`.

## Optimize

Optimize the built WASM binaries:

```sh
npm run optimize
```

This reads the glob `target/wasm32-unknown-unknown/release/*.wasm` and writes the optimized artifacts to `target/wasm32-unknown-unknown/release/optimized/`.

## Deploy

Deploy to testnet:

```sh
env STEPLAR_SECRET_KEY=... npm run deploy:testnet
```

The deploy script reads the optimized glob `target/wasm32-unknown-unknown/release/optimized/*.wasm`.

## Target Triple

All build and deploy tooling in this directory uses the `wasm32-unknown-unknown` target triple. Install it with:

```sh
rustup target add wasm32-unknown-unknown
```
