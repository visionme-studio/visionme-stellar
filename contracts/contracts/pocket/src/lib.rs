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