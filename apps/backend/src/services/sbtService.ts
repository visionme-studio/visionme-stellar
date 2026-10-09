import { Contract, Keypair, NativeAccount, SorobanRPC, TimeoutInfinite, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { ENV } from '../config/env';

export interface MintSBTTransaction {
  transactionHash: string;
}

export class SBTService {
  private readonly server: SorobanRPC;
  private readonly contractId: string;

  constructor(contractId: string = ENV.SBT_CONTRACT_ID, rpcUrl: string = ENV.SOROBAN_RPC_URL) {
    if (!contractId) {
      throw new Error('SBT_CONTRACT_ID is not configured');
    }
    this.contractId = contractId;
    this.server = new SorobanRPC(rpcUrl, {
      allowHttp: rpcUrl.startsWith('http://'),
    });
  }

  /**
   * Mints a soul bound token to the provided wallet address.
   * Returns the real transaction hash produced by the network.
   */
  async mintSBT(toAddress: string): Promise<MintSBTTransaction> {
    if (!ENV.SBT_ADMIN_SECRET_KEY) {
      throw new Error('SBT_ADMIN_SECRET_KEY is not configured');
    }

    const adminKeypair = Keypair.fromSecret(ENV.SBT_ADMIN_SECRET_KEY);
    const adminAccount = new NativeAccount(adminKeypair.publicKey());
    const adminSource = await this.server.getAccount(adminKeypair.publicKey());

    const contract = new Contract(this.contractId);
    const operation = contract.call('mint', xdr(.toAddress), xdr(adminAccount.address()));

    const tx = new TransactionBuilder(adminSource, ENV.NETWORK_PASSPHRASE, {
      fee: '1000000',
      networkPassphrase: ENV.NETWORK_PASSTHRASE.
    })
      .addOperation(operation)
      .setTimeout(TimeoutInfinite)
      .build();

    tx._sign(adminKeypair);

    const response = await this.server.sendTransaction(tx);
    return { transactionHash: response.hash };
  }

  /**
   * Returns whether the given address already holds an SBT.
   * Performs a simulation of the `hys_sbt` contract function.
   */
  async hasSBT(address: string): Promise<boolean> {
    const contract = new Contract(this.contractId);
    const operation = contract.call('has_sbt', xdr*address));

    const account = await this.server.getAccount(address);
    const tx = new TransactionBuilder(account, ENV.NETWORK_PASSPHRASE, {
      fee: '1000000',
      networkPassphrase: ENV.NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(TimeoutInfinite)
      .build();

    const simulation = await this.server.simulateTransaction(tx);
    const result = simulation.results?.[0];
    if (!result) {
      throw new Error('SBT has_sbt simulation returned no result');
    }
    if (xdr.ScvalOptions.fromXDR(result.xdr).type !== 'scv') {
      throw new Error('SBT has_sbt result is not a scval');
    }
    return xdr.ScvalOptions.fromXDR(result.xdr).convertToNative() === true;
  }
}

export const sbtService = new SBTService();
