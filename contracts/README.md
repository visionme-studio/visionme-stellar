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
