import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "@wagmi/connectors";

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({
    //   target: "metaMask", // 会自动兼容 Rabby
        shimDisconnect: true,
    }),
  ],
  transports: {
    [sepolia.id]: http(), // 默认使用 public RPC
  },
});
