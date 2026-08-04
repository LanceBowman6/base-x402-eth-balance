import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { type Network } from "@x402/core/types";
import { ExactEvmScheme, toClientEvmSigner } from "@x402/evm";
import { type WalletClient } from "viem";
import { base } from "viem/chains";
import { getPublicClient } from "wagmi/actions";
import { wagmiConfig } from "./wagmi.js";

export interface BalanceResponse {
  address: `0x${string}`;
  network: "base";
  ethBalance: string;
  timestamp: string;
}

const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

function resolveX402Network(input = "base-sepolia"): Network {
  const normalized = input.trim().toLowerCase();

  if (normalized === "base") {
    return "eip155:8453";
  }

  if (normalized === "base-sepolia" || normalized === "base_sepolia") {
    return "eip155:84532";
  }

  if (normalized.startsWith("eip155:")) {
    return normalized as Network;
  }

  throw new Error(`Unsupported VITE_X402_NETWORK "${input}".`);
}

export async function fetchBalanceWithX402(
  walletClient: WalletClient,
  addressToCheck: string,
): Promise<BalanceResponse> {
  if (!walletClient.account?.address) {
    throw new Error("Connect a wallet before making a paid request.");
  }

  const signer = toClientEvmSigner(
    {
      address: walletClient.account.address,
      signTypedData: async typedData =>
        walletClient.signTypedData({
          account: walletClient.account!,
          domain: typedData.domain,
          types: typedData.types,
          primaryType: typedData.primaryType,
          message: typedData.message,
        }),
    },
    getPublicClient(wagmiConfig, { chainId: base.id }),
  );

  const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [
      {
        network: resolveX402Network(import.meta.env.VITE_X402_NETWORK),
        client: new ExactEvmScheme(signer),
      },
    ],
  });

  const response = await fetchWithPayment(`${apiUrl}/api/balance/${addressToCheck}`, {
    method: "GET",
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error ?? `Request failed with status ${response.status}`);
  }

  return body as BalanceResponse;
}

export async function readPaymentRequirement(addressToCheck: string) {
  const response = await fetch(`${apiUrl}/api/balance/${addressToCheck}`);
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  return {
    status: response.status,
    body,
  };
}
