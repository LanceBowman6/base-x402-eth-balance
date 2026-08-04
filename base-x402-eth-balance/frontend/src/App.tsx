import { AlertCircle, CheckCircle2, Loader2, PlugZap, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { base } from "wagmi/chains";
import { isAddress } from "viem";
import { fetchBalanceWithX402, readPaymentRequirement, type BalanceResponse } from "./lib/x402.js";

const exampleAddress = "0x0000000000000000000000000000000000000000";

export function App() {
  const [addressInput, setAddressInput] = useState(exampleAddress);
  const [result, setResult] = useState<BalanceResponse | null>(null);
  const [paymentRequirement, setPaymentRequirement] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const isBase = chainId === base.id;
  const canSubmit = useMemo(
    () => isConnected && isBase && Boolean(walletClient) && isAddress(addressInput),
    [addressInput, isBase, isConnected, walletClient],
  );

  async function handleCheckBalance() {
    setError(null);
    setResult(null);
    setPaymentRequirement(null);

    if (!isAddress(addressInput)) {
      setError("Enter a valid EVM address.");
      return;
    }

    if (!walletClient) {
      setError("Connect a browser wallet first.");
      return;
    }

    setIsChecking(true);

    try {
      if (!isBase) {
        await switchChainAsync({ chainId: base.id });
      }

      const requirement = await readPaymentRequirement(addressInput);
      setPaymentRequirement(requirement);

      const balance = await fetchBalanceWithX402(walletClient, addressInput);
      setResult(balance);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to complete paid balance check.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="title-row">
          <div>
            <p className="eyebrow">Base x402 Seller</p>
            <h1>ETH Balance Service</h1>
          </div>
          <div className="network-pill">Base · 0.001 USDC</div>
        </div>

        <section className="panel wallet-panel">
          <div className="panel-title">
            <Wallet size={18} />
            <span>Wallet</span>
          </div>

          {isConnected ? (
            <div className="connected-row">
              <div>
                <div className="address-label">{address}</div>
                <div className={isBase ? "status ok" : "status warn"}>
                  {isBase ? "Connected on Base" : "Switch to Base to pay"}
                </div>
              </div>
              <div className="button-row">
                {!isBase && (
                  <button className="secondary-button" onClick={() => switchChainAsync({ chainId: base.id })}>
                    Switch Base
                  </button>
                )}
                <button className="secondary-button" onClick={() => disconnect()}>
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="connector-grid">
              {connectors.map(connector => (
                <button
                  key={connector.uid}
                  className="wallet-button"
                  disabled={isConnecting}
                  onClick={() => connect({ connector })}
                >
                  <PlugZap size={16} />
                  {connector.name}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <label htmlFor="address">Base wallet address</label>
          <div className="input-row">
            <input
              id="address"
              value={addressInput}
              onChange={event => setAddressInput(event.target.value)}
              placeholder={exampleAddress}
              spellCheck={false}
            />
            <button className="primary-button" disabled={!canSubmit || isChecking} onClick={handleCheckBalance}>
              {isChecking ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
              Check ETH Balance
            </button>
          </div>
        </section>

        {error && (
          <section className="notice error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </section>
        )}

        {result && (
          <section className="result-grid">
            <div className="metric">
              <span>ETH Balance</span>
              <strong>{result.ethBalance}</strong>
            </div>
            <div className="metric">
              <span>Network</span>
              <strong>{result.network}</strong>
            </div>
            <div className="metric wide">
              <span>Address</span>
              <strong>{result.address}</strong>
            </div>
          </section>
        )}

        {paymentRequirement !== null && (
          <section className="panel">
            <div className="panel-title">
              <span>x402 Payment Request</span>
            </div>
            <pre>{JSON.stringify(paymentRequirement, null, 2)}</pre>
          </section>
        )}
      </section>
    </main>
  );
}
