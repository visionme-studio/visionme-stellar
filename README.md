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
