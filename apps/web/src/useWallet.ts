import { BrowserProvider } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { IOTA_EVM_CHAIN_ID, IOTA_EVM_RPC_URL } from "./config";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

function getProvider() {
  if (typeof window === "undefined" || !window.ethereum) return null;
  return new BrowserProvider(window.ethereum);
}

export function useWallet() {
  const [account, setAccount] = useState<string>("");
  const [status, setStatus] = useState<string>("Disconnected");
  const hasWallet = typeof window !== "undefined" && Boolean(window.ethereum);

  // ── Sync already-connected account on mount ─────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    // Check if MetaMask already has a permitted account
    (window.ethereum.request({ method: "eth_accounts" }) as Promise<string[]>)
      .then((accounts) => {
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setStatus("Connected");
        }
      })
      .catch(() => {/* not connected yet – fine */});

    // React to MetaMask account switches
    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts || accounts.length === 0) {
        setAccount("");
        setStatus("Disconnected");
      } else {
        setAccount(accounts[0]);
        setStatus("Connected");
      }
    };

    // React to network/chain switches
    const handleChainChanged = () => {
      // Reload is the safest approach (MetaMask recommends it)
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // ── Add / switch to IOTA EVM chain ──────────────────────────
  async function ensureIotaChain() {
    if (!window.ethereum) return;

    const chainIdHex = `0x${IOTA_EVM_CHAIN_ID.toString(16)}`;

    try {
      // Try switching first (works if chain is already added)
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: unknown) {
      // Error code 4902 = chain not added yet → add it
      const code = (switchError as { code?: number })?.code;
      if (code === 4902 || code === -32603) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: "IOTA EVM Testnet",
              nativeCurrency: { name: "IOTA", symbol: "IOTA", decimals: 18 },
              rpcUrls: [IOTA_EVM_RPC_URL],
              blockExplorerUrls: ["https://explorer.evm.testnet.iotaledger.net"],
            },
          ],
        });
      } else {
        throw switchError; // user rejected or unexpected error
      }
    }
  }

  // ── Connect ──────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setStatus("MetaMask not found. Install MetaMask and refresh.");
      return;
    }

    try {
      setStatus("Requesting accounts…");

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        setStatus("No accounts returned.");
        return;
      }

      setStatus("Switching to IOTA EVM…");
      await ensureIotaChain();

      setAccount(accounts[0]);
      setStatus("Connected");
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code;
      const message = (err as { message?: string })?.message ?? "";

      if (code === 4001) {
        setStatus("Connection rejected by user.");
      } else if (message.toLowerCase().includes("already processing")) {
        setStatus("MetaMask popup already open — check MetaMask.");
      } else {
        setStatus(`Connection failed: ${message || "unknown error"}`);
      }
    }
  }, []);

  // ── Disconnect (client-side only — MetaMask has no revoke API) ──
  const disconnect = useCallback(() => {
    setAccount("");
    setStatus("Disconnected");
  }, []);

  // ── Signer ───────────────────────────────────────────────────
  const signer = useCallback(async () => {
    const provider = getProvider();
    if (!provider) throw new Error("Wallet provider not available.");
    return provider.getSigner();
  }, []);

  return { account: account || null, status, connect, disconnect, signer, hasWallet };
}
