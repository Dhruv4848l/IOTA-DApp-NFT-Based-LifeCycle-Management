export const IOTA_EVM_CHAIN_ID = Number(import.meta.env.VITE_IOTA_EVM_CHAIN_ID ?? 1076);
export const IOTA_EVM_RPC_URL =
  import.meta.env.VITE_IOTA_EVM_RPC_URL ??
  "https://json-rpc.evm.testnet.iotaledger.net";
export const DPP_CONTRACT_ADDRESS =
  import.meta.env.VITE_DPP_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000";

export const lifecycleStages = [
  "RawMaterial",
  "ManufacturingInspection",
  "QualityAssurance",
  "SupplyChain",
  "InService",
  "Maintenance",
  "EndOfLife"
] as const;

export const passportKinds = [
  "Product",
  "Machine",
  "Maintenance",
  "Quality",
  "Skill",
  "SupplyChain",
  "Carbon"
] as const;

