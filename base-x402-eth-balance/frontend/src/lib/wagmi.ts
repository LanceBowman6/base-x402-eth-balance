import { coinbaseWallet, injected, metaMask, walletConnect } from "@wagmi/connectors";
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: "Base x402 ETH Balance Service",
    }),
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      metadata: {
        name: "Base x402 ETH Balance Service",
        description: "Pay USDC via x402 to check Base ETH balances.",
        url: typeof window !== "undefined" ? window.location.origin : "http://localhost:5173",
        icons: [],
      },
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});
