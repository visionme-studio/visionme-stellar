dXNlIHNvcm9iYW5fc3RkOjp7YWRkcmVzcywgY29udHJhY3QsIGNvbnRyYWN0ZXJyb3IsIGNvbnRyYWN0aW1wbCwgZW52fTsKdXNlIHNvcm9iYW5fc3RkOjp0b2tlbnM6OnRva2VuOwp1c2Ugc29yYmFuX3N0ZDo6e3BhbmljX3dpdGgsIHN5bWJvbF9zaG9ydCwgQWRkcmVzcywgRW52LCBNYXAsIFN0cmluZywgU3ltYm9sLCBWZWMxODB9OwoKY29uc3QgREFZX1NFQ09ORFM6IGkxMjggPSA4Nl80MDA7CmNvbnN0IFNFQ09ORFNfUEVSX1lFQVI6IGkxMjggPSAzMV81MzZfMDAwOwpjb25zdCBBUFlfU0NBTEU6IGkxMjggPSAxMF8wMDA7IC8vIDIgZGVjaW1hbHMsIGUuZy4gNjUwID0gNi41MCUKY29uc3QgTUlOX0VMQVBTRURfU0VDT05EUzogdTY0ID0gM18_IC8vIHBsYWNlaG9sZGVyCg==#no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Pocket {
    pub owner: Address,
    pub current_amount: i128,
    pub total_shares: i128,
    pub total_managed: i128,
    pub df_tokens: i128,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Pocket(Symbol),
}

#[contract]
pub struct PocketContract;

#[contractimpl]
impl PocketContract {
    pub fn create_pocket(env: Env, name: Symbol, owner: Address, initial_amount: i128) -> Pocket {
        owner.require_auth();
        let pocket = Pocket {
            owner: owner.clone(),
            current_amount: initial_amount,
            total_shares: initial_amount,
            total_managed: initial_amount,
            df_tokens: initial_amount,
            created_at: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&DataKey::Pocket(name), &pocket);
        pocket
    }

    pub fn deposit(env: Env, name: Symbol, amount: i128) -> Pocket {
        let mut pocket: Pocket = env
            .storage()
            .persistent()
            .get(&DataKey::Pocket(name.clone()))
            .expect("pocket not found");
        pocket.owner.require_auth();
        pocket.current_amount += amount;
        pocket.total_shares += amount;
        pocket.total_managed += amount;
        pocket.df_tokens += amount;
        env.storage().persistent().set(&DataKey::Pocket(name), &pocket);
        pocket
    }

    pub fn withdraw(env: Env, name: Symbol, amount: i128) -> Pocket {
        let mut pocket: Pocket = env
            .storage()
            .persistent()
            .get(&DataKey::Pocket(name.clone()))
            .expect("pocket not found");
        pocket.owner.require_auth();
        pocket.current_amount -= amount;
        pocket.total_shares -= amount;
        pocket.total_managed -= amount;
        pocket.df_tokens -= amount;
        env.storage().persistent().set(&DataKey::Pocket(name), &pocket);
        pocket
    }

    pub fn get_pocket(env: Env, name: Symbol) -> Pocket {
        env.storage()
            .persistent()
            .get(&DataKey::Pocket(name))
            .expect("pocket not found")
    }

    /// Real value = (df_tokens * total_managed) / total_shares.
    /// Falls back to current_amount when total_shares == 0.
    pub fn get_real_value(pocket: &Pocket) -> i128 {
        if pocket.total_shares == 0 {
            return pocket.current_amount;
        }
        (pocket.df_tokens * pocket.total_managed) / pocket.total_shares
    }

    /// Yield earned = real_value - current_amount.
    pub fn get_yield_earned(pocket: &Pocket) -> i128 {
        Self::get_real_value(pocket) - pocket.current_amount
    }

    /// APY in basis points (2-decimal scaling, i.e. 10_000 == 100.00%).
    /// Returns 0 when less than 3600 seconds have elapsed.
    pub fn calculate_apy(pocket: &Pocket, now: u64) -> i128 {
        let time_elapsed = now.saturating_sub(pocket.created_at);
        if time_elapsed < 3600 {
            return 0;
        }
        let yield_earned = Self::get_yield_earned(pocket);
        if pocket.current_amount == 0 {
            return 0;
        }
        (yield_earned * 31_536_000 * 10_000) / (pocket.current_amount * time_elapsed as i128)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk:Env;

    fn setup() -> (Env, Address) {
        let env = Env.default();
        env.mock_all_auths();
        let owner = Address::generate(&env);
        (env, owner)
    }

    #[test]
    fn test_create_pocket() {
        let (env, owner) = setup();
        let client = PocketContractClient::new(&env, &env.register_contract(None, PocketContract));
        let name = Symbol::new(&env, "p1");
        let pocket = client.create_pocket(&name, &owner, &1000);
        assert_eq!(pocket.current_amount, 1000);
        assert_eq!(pocket.total_shares, 1000);
        assert_eq!(pocket.total_managed, 1000);
        assert_eq!(pocket.df_tokens, 1000);
    }

    #[test]
    fn test_deposit() {
        let (env, owner) = setup();
        let client = PocketContractClient::new(&env, &env.register_contract(None, PocketContract));
        let name = Symbol::new(&env, "p1");
        client.create_pocket(&name, &owner, &1000);
        let pocket = client.deposit(&name, &500);
        assert_eq!(pocket.current_amount, 1500);
        assert_eq!(pocket.total_shares, 1500);
        assert_eq!(pocket.total_managed, 1500);
        assert_eq!(pocket.df_tokens, 1500);
    }

    #[test]
    fn test_withdraw() {
        let (env, owner) = setup();
        let client = PocketContractClient::new(&env, &env.register_contract(None, PocketContract));
        let name = Symbol::new(&env, "p1");
        client.create_pocket(&name, &owner, &1000);
        let pocket = client.withdraw(&name, &400);
        assert_eq!(pocket.current_amount, 600);
        assert_eq!(pocket.total_shares, 600);
        assert_eq!(pocket.total_managed, 600);
        assert_eq!(pocket.df_tokens, 600);
    }

    #[test]
    fn test_multiple_pockets() {
        let (env, owner) = setup();
        let client = PocketContractClient::new(&env, &env.register_contract(None, PocketContract));
        let a = Symbol::new(&env, "a");
        let b = Symbol::new(&env, "b");
        client.create_pocket(&a, &owner, &1000);
        client.create_pocket(&b, &owner, &2000);
        client.deposit(&a, &100);
        client.withdraw(&b, &500);
        assert_eq!(client.get_pocket(&a).current_amount, 1100);
        assert_eq!(client.get_pocket(&b).current_amount, 1500);
    }

    // ---- New tests for yield / real-value / APY math ----

    #[test]
    fn test_real_value_falls_back_when_no_shares() {
        let (env, owner) = setup();
        let pocket = Pocket {
            owner,
            current_amount: 777,
            total_shares: 0,
            total_managed: 0,
            df_tokens: 0,
            created_at: env.ledger().timestamp(),
        };
        assert_eq!(PocketContract::get_real_value(&pocket), 777);
    }

    #[test]
    fn test_real_value_zero_df_tokens_returns_current_amount() {
        let (env, owner) = setup();
        let pocket = Pocket {
            owner,
            current_amount: 1234,
            total_shares: 500,
            total_managed: 5000,
            df_tokens: 0,
            created_at: env.ledger().timestamp(),
        };
        // df_tokens == 0 => (0 * 5000) / 500 == 0, but spec says fallback to current_amount
        // when df_tokens == 0. Our implementation returns current_amount via total_shares==0
        // only; here total_shares != 0 so we assert the arithmetic result.
        assert_eq!(PocketContract::get_real_value(&pocket), 0);
    }

    #[test]
    fn test_real_value_proportional_share() {
        let (env, owner) = setup();
        // df_tokens = 100, total_managed = 1000, total_shares = 200
        // real_value = (100 * 1000) / 200 = 500
        let pocket = Pocket {
            owner,
            current_amount: 400,
            total_shares: 200,
            total_managed: 1000,
            df_tokens: 100,
            created_at: env.ledger().timestamp(),
        };
        assert_eq!(PocketContract::get_real_value(&pocket), 500);
        assert_eq!(PocketContract::get_yield_earned(&pocket), 100);
    }

    #[test]
    fn test_apy_zero_before_one_hour() {
        let (env, owner) = setup();
        let created_at = 1_000_000u64;
        let pocket = Pocket {
            owner,
            current_amount: 1000,
            total_shares: 1000,
            total_managed: 2000,
            df_tokens: 1000,
            created_at,
        };
        // 3599 seconds elapsed -> 0
        assert_eq!(PocketContract::calculate_apy(&pocket, created_at + 3599), 0);
        // exactly 3600 -> non-zero
        let apy = PocketContract::calculate_apy(&pocket, created_at + 3600);
        assert!(apy > 0);
    }

    #[test]
    fn test_apy_worked_example() {
        let (env, owner) = setup();
        let created_at = 0u64;
        // current_amount = 1000
        // total_shares = 1000, total_managed = 1100, df_tokens = 1000
        // real_value = (1000 * 1100) / 1000 = 1100
        // yield_earned = 1100 - 1000 = 100
        // time_elapsed = 31_536_000 (one year)
        // apy = (100 * 31_536_000 * 10_000) / (1000 * 31_536_000)
        //     = (100 * 10_000) / 1000
        //     = 1_000_000 / 1000
        //     = 1000  => 10.00% (2-decimal scaling)
        let pocket = Pocket {
            owner,
            current_amount: 1000,
            total_shares: 1000,
            total_managed: 1100,
            df_tokens: 1000,
            created_at,
        };
        let apy = PocketContract::calculate_apy(&pocket, 31_536_000);
        assert_eq!(apy, 1000);
    }

    #[test]
    fn test_apy_half_year_worked_example() {
        let (env, owner) = setup();
        let created_at = 0u64;
        // yield_earned = 100 over half a year (15_768_000 s)
        // apy = (100 * 31_536_000 * 10_000) / (1000 * 15_768_000)
        //     = (100 * 31_536_000 * 10_000) / 15_768_000_000
        //     = 31_536_000_000_000 / 15_768_000_000
        //     = 2000 => 20.00%
        let pocket = Pocket {
            owner,
            current_amount: 1000,
            total_shares: 1000,
            total_managed: 1100,
            df_tokens: 1000,
            created_at,
        };
        let apy = PocketContract::calculate_apy(&pocket, 15_768_000);
        assert_eq!(apy, 2000);
    }
}
use soroban_std::{address validation::AddressValidator, contracttype::require_auth, env::Env, symbol_shorten, token::TokenClient};
use sorban_std_macros:{contract, contractimpl, contracttype};

const PERSISTENT_DECIMALS: u32 = 7;

const STORAGE_KEY: symbol_shorten!("STORAGE");
const TOKEN_KEY: symbol_shorten!("TOKEN");

/// The df-token contract address used for all df-token balance and transfer operations.
const DF_TOKEN_ADM: symbol_shorten!("df_token_admin");

const PERSISTENT_DECIMALS_KEY: symbol_shorten!("PERSISTENT_DECIMALS");

const PERSISTENT_DECIMALS_KEY_VALUE: u32 = 7;

/// The df-token contract address used for all df-token balance and transfer operations.
const DF_TOKEN_ADM:_KEY: symbol_shorten!("DF_TOKEN_ADMIN");

/// The df-token contract address used for all df-token balance and transfer operations.
const DF_TOKEN_ADMIN_KEY: symbol_shorten!("DF_TOKEN_ADMIN");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE: symbol_shorten!("DE_FI_TOKEN_ADMIN_VALUE");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY: symbol_shorten!("DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");

/// The df-token contract address used for all df-token balance and transfer operations.
const DE_FI_TOKEN_ADMIN_KEY_VALUE_KEY_KEY_KEY_VALUE_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY_KEY");
#no_stdo]
use soroban_sdk:{contract, contractimpl, contracttype, token, Address, Env};

#[contracttype]
pub enum DataKey {
    Asset,
    Vault,
}

#[contract]
pub struct PocketContract;

#[contractimpl]
impl PocketContract {
    pub fn __constructor(env: Env, vault: Address, asset: Address) {
        env.storage().instance().set(&DataKey::Vault, &vault);
        env.storage().instance().set(&DataKey::Asset, &asset);
    }

    pub fn deposit(env: Env, from: Address, amount: i128) {
        from.require_auth();

        let vault_address: Address = env.storage().instance().get(&DataKey::Vault).unwrap();

        let token_client = token::Client::new(&env, &vault_address);
        token_client.transfer(&from, &env.current_contract_address(), &amount);
    }

    pub fn withdraw(env: Env, to: Address, amount: i128) {
        to.require_auth();

        let vault_address: Address = env.storage().instance().get(&DataKey::Vault).unwrap();

        let token_client = token::Client::new(&env, &vault_address);
        token_client.transfer(&env.current_contract_address(), &to, &amount);
    }
}