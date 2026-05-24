import { BrowserProvider } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { IOTA_EVM_CHAIN_ID, IOTA_EVM_RPC_URL } from "./config";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export function useWallet() {
  const [account, setAccount] = useState<string>("");
  const [status, setStatus] = useState<string>("Disconnected");
  const hasWallet = typeof window !== "undefined" && Boolean(window.ethereum);

  const provider = useMemo(() => {
    if (!window.ethereum) return null;
    return new BrowserProvider(window.ethereum);
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum || !provider) {
      setStatus("MetaMask or another EIP-1193 wallet is required.");
      return;
    }

    setStatus("Connecting wallet...");
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts"
    })) as string[];

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${IOTA_EVM_CHAIN_ID.toString(16)}`,
          chainName: "IOTA EVM Testnet",
          nativeCurrency: { name: "IOTA", symbol: "IOTA", decimals: 18 },
          rpcUrls: [IOTA_EVM_RPC_URL],
          blockExplorerUrls: ["https://explorer.evm.testnet.iotaledger.net"]
        }
      ]
    });

    setAccount(accounts[0] ?? "");
    setStatus("Connected");
  }, [provider]);

  const disconnect = useCallback(() => {
    setAccount("");
    setStatus("Disconnected");
  }, []);

  const signer = useCallback(async () => {
    if (!provider) throw new Error("Wallet provider is not available");
    return provider.getSigner();
  }, [provider]);

  return { account, status, connect, disconnect, signer, hasWallet };
}
