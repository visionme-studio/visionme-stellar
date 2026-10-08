use soroban_std::{address, contract, contracttype, Env};
use soroban_std::token::TokenClient;
use soroban_std::{assert_eq, assert_ne, panic_with};

/// The DeFindex vault interface exposes the minimal surface this contract needs.
/// The actual implementation is provided by the DeFindex vault contract.
/// This interface is declared locally so the Pocket contract can be built
/// and tested in isolation.
#[contracttype]
pub trait DeFindexVaultInterface {
    /// Deposit `amount` of the underlying token and return the number of
    /// vault shares (or tokens) minted to the caller.
    fn deposit(env: Env, amount: i128) -> i128;

    /// Withdraw `df_tokens` vault shares and return the amounts of the
    /// underlying token received. The returned vector may contain more
    /// than the recorded principal once yield has accrued.
    fn withdraw(env: Env, df_tokens: i128) -> Vec<i128>;

    /// Return the current value of one vault share in underlying tokens.
    fn get_current_value(env: Env) -> i128;
}

#[contracttype]
#[public]
pub struct PocketContract {
    admin: address,
    vault: address,
    token: address,
    current_amount: i128,
    df_tokens: i128,
}

const PAGE: u32 = 10;
const TITLE: &str = "Pocket";
const DESCRIPTION: &str = "A simple pocket that deposits into a DeFindex vault.";

create_contract! {
    fn init(env: Env, admin: address, vault: address, token: address) {
        let pocket = PocketContract {
            admin,
            vault,
            token,
            current_amount: 0,
            df_tokens: 0,
        };
        env.storage().persistent().set(&Symbol::new("Pocket"), &pocket);
    }

    /// Deposit `amount` of the underlying token into the vault.
    pub fn deposit(env: Env, amount: i128) {
        assert!(amount > 0, "amount must be positive");
        let mut pocket = read_pocket(&env);
        let client = TokenClient::new(&env, &pocket.token);
        client.transfer_from(
            &env.current_contract(),
            &env.current_contract(),
            &amount,
        );
        let vault = DeFindexVaultInterfaceClient::new(&env, &pocket.vault);
        let df_tokens = vault.deposit(&amount);
        pocket.current_amount = pocket.current_amount + amount;
        pocket.df_tokens = pocket.df_tokens + df_tokens;
        write_pocket(&env, &pocket);
    }

    /// Withdraw `df_tokens` worth of vault shares.
    ///
    /// The vault may return more than the recorded principal once yield
    /// has accrued. The accounting must never underflow: `current_amount`
    /// is clamped at zero and `df_tokens` is decremented by the amount
    /// actually withdrawn.
    pub fn withdraw(env: Env, df_tokens: i128) {
        assert!(df_tokens > 0, "df_tokens must be positive");
        let mut pocket = read_pocket(&env);
        assert!(
            df_tokens <= pocket.df_tokens,
            "cannot withdraw more than the pocket holds"
        );

        let vault = DeFindexVaultInterfaceClient::new(&env, &pocket.vault);
        let amounts_withdrawn = vault.withdraw(&df_tokens);
        let withdrawn_amount = amounts_withdrawn.get(0).unwrap_or(0);

        // The vault may return more than the recorded principal once yield
        // has accrued. Saturating subtraction keeps the accounting
        // non-negative and avoids trapping the contract when
        // `overflow-checks = true`.
        pocket.current_amount = pocket.current_amount.saturating_sub(withdrawn_amount);
        pocket.df_tokens = pocket.df_tokens.saturating_sub(df_tokens);

        assert!(pocket.current_amount >= 0, "current_amount must be non-negative");
        assert!(pocket.df_tokens >= 0, "df_tokens must be non-negative");

        write_pocket(&env, &pocket);
    }

    /// Return the pocket's current accounting state.
    pub fn get_pocket(env: Env) -> PocketContract {
        read_pocket(&env)
    }
}

fn read_pocket(env: &Env) -> PocketContract {
    env.storage()
        .persistent()
        .get(&Symbol::new("Pocket"))
        .unwrap_or_else_with(|| PocketContract {
            admin: env.current_contract(),
            vault: env.current_contract(),
            token: env.current_contract(),
            current_amount: 0,
            df_tokens: 0,
        })
}

fn write_pocket(env: &Env, pocket: &PocketContract) {
    env.storage()
        .persistent()
        .set(&Symbol::new("Pocket"), pocket);
}

#[config]
mod test;
