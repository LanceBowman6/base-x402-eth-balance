import { type Network } from "@x402/core/types";

export function resolveX402Network(input = "base"): Network {
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

  throw new Error(
    `Unsupported X402_NETWORK "${input}". Use "base", "base-sepolia", or a CAIP-2 network like "eip155:8453".`,
  );
}
