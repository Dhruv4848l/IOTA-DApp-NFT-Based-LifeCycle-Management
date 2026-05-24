import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const privateKey = process.env.PRIVATE_KEY ?? "";
const rpcUrl =
  process.env.IOTA_EVM_RPC_URL ?? "https://json-rpc.evm.testnet.iotaledger.net";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    iotaTestnet: {
      url: rpcUrl,
      chainId: Number(process.env.IOTA_EVM_CHAIN_ID ?? 1076),
      accounts: privateKey ? [privateKey] : []
    }
  }
};

export default config;
