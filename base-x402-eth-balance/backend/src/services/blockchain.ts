import { createPublicClient, formatEther, http, isAddress, type Address } from "viem";
import { base } from "viem/chains";

export interface BalanceResponse {
  address: Address;
  network: "base";
  ethBalance: string;
  timestamp: string;
}

function getRpcUrl(): string {
  const rpcUrl = process.env.BASE_RPC_URL;

  if (!rpcUrl) {
    throw new Error("BASE_RPC_URL is required.");
  }

  return rpcUrl;
}

export async function getBaseEthBalance(address: string): Promise<BalanceResponse> {
  if (!isAddress(address)) {
    throw new Error("Invalid Base wallet address.");
  }

  const client = createPublicClient({
    chain: base,
    transport: http(getRpcUrl()),
  });

  const balance = await client.getBalance({ address });

  return {
    address,
    network: "base",
    ethBalance: formatEther(balance),
    timestamp: new Date().toISOString(),
  };
}
