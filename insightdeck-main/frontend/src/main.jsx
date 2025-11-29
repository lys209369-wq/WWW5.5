import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "@wagmi/connectors";
import { sepolia } from "wagmi/chains";
import { config } from "./wagmi";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


// const config = createConfig({
//   chains: [sepolia],
//   connectors: [
//     injected({
//       shimDisconnect: true,
//     }),
//   ],
//   transports: {
//     [sepolia.id]: http(),
//   },
// });

// 必须创建 QueryClient
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <App />
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
