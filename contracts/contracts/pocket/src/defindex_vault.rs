/// Client binding for the DeFindex vault contract.
/// This type alias is re-exported for use by the Pocket contract and is
/// kept public even though it is not referenced in this crate directly.
#[allow_dead_code)]
pub type DeFindexVaultClient<'a> = soroban_sdk::ContractClient<'a>;
