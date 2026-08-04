import { createCdpFacilitatorClient, CDP_FACILITATOR_URL } from "@coinbase/cdp-sdk/x402";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { isAddress, type Address } from "viem";
import { resolveX402Network } from "./network.js";

const DEFAULT_FACILITATOR_URL = CDP_FACILITATOR_URL;

function requireSellerAddress(): Address {
  const sellerAddress = process.env.SELLER_ADDRESS;

  if (!sellerAddress || !isAddress(sellerAddress)) {
    throw new Error("SELLER_ADDRESS must be set to a valid EVM address.");
  }

  return sellerAddress;
}

export function createPaymentMiddleware() {
  const sellerAddress = requireSellerAddress();
  const price = process.env.PRICE ?? "0.001";
  const network = resolveX402Network(process.env.X402_NETWORK ?? "base");
  const facilitatorUrl = process.env.X402_FACILITATOR_URL ?? DEFAULT_FACILITATOR_URL;

  if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
    throw new Error(
      "CDP_API_KEY_ID and CDP_API_KEY_SECRET are required for Base mainnet x402 payments.",
    );
  }

  const facilitatorClient = createCdpFacilitatorClient({
    baseUrl: facilitatorUrl,
  });
  const resourceServer = new x402ResourceServer(facilitatorClient).register(
    network,
    new ExactEvmScheme(),
  );

  return paymentMiddleware(
    {
      "GET /api/balance/:address": {
        accepts: {
          scheme: "exact",
          price: `$${price}`,
          network,
          payTo: sellerAddress,
          maxTimeoutSeconds: 60,
        },
        description: "Check a Base wallet ETH balance.",
      },
    },
    resourceServer,
  );
}
