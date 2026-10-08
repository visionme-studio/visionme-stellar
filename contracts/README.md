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
