import { Contract, NativeContract, xdrTools } from '@stellar/stellar-base';
import { Keypair, TransactionBuilder, Operation, Asset, Address } from '@stellar/stellar-sdk';
import { config } from '../config';
import { pocketContract } from '../contracts';

export interface Pocket {
  id: bigint;
  owner: string;
  df_tokens: bigint;
  token: string;
  balance: bigint;
}

/**
 * Retrieves a pocket from the contract.
 */
export async function getPocket(pocketId: bigint): Promise<Pocket> {
  const contract = new Contract(pocketContract.contractId);
  const result = await contract.call('get_pocket', {
    pocket_id: pocketId,
  });
  return result as unknown as Pocket;
}

/**
 * Converts a df-token amount to the underlying token amount.
 * The conversion ratio is derived from the pocket's current balance and df_tokens.
 */
export function dfTokensToTokenAmount(
  dfTokensAmount: bigint,
  pocket: Pocket,
): bigint {
  if (pocket.df_tokens === 0n) {
    throw new Error('Pocket has no df tokens; cannot convert');
  }
  return (dfTokensAmount * pocket.balance) / pocket.df_tokens;
}

/**
 * Converts a token amount to the equivalent df-token amount.
 */
export function tokenAmountToDfTokens(
  tokenAmount: bigint,
  pocket: Pocket,
): bigint {
  if (pocket.balance === 0n) {
    throw new Error('Pocket has no balance; cannot convert');
  }
  return (tokenAmount * pocket.df_tokens) / pocket.balance;
}

/**
 * Builds a withdraw XDR.
 *
 * The contract's `withdraw` takes a `df_tokens_amount` argument.
 * This function accepts a token amount (e.g. USDC) and converts it to the
 * equivalent df-token amount before building the transaction.
 */
export async function buildWithdrawXDR(
  pocketId: bigint,
  toAddress: string,
  tokenAmount: bigint,
): Promise<string> {
  if (tokenAmount <= 0n) {
    throw new Error('Withdraw amount must be positive');
  }

  const pocket = await getPocket(pocketId);
  const df_tokens_amount = tokenAmountToDfTokens(tokenAmount, pocket);

  if (df_tokens_amount <= 0n) {
    throw new Error('Withdraw amount too small to convert to df tokens');
  }

  const contract = new Contract(pocketContract.contractId);
  const operation = contract.call(
    'withdraw',
    {
      pocket_id: pocketId,
      to: toAddress,
      df_tokens_amount,
    },
  );

  const tx = new TransactionBuilder(config.stellarNetworkPassphrase)
    .addOperation(operation)
    .setTimeout(30)
    .build();

  return tx.toXOR();
}
