"use client";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { localhost, bsc } from "wagmi/chains";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWeb3Modal } from "@web3modal/wagmi/react";

import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

// Get projectId at https://cloud.walletconnect.com
export const walletConnectProjectId = "867fac74ffcda25d2219ebbd1cf1b2b9";

const metadata = {
	name: "Web3Modal",
	description: "Web3Modal Example",
	url: "https://web3modal.com", // origin must match your domain & subdomain
	icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Create wagmiConfig
export const config = defaultWagmiConfig({
	chains: [bsc, localhost], // required
	projectId: walletConnectProjectId, // required
	metadata, // required
});

createWeb3Modal({
	wagmiConfig: config,
	projectId: walletConnectProjectId,
});

export function WalletConnectConfig({ children }) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
			
		</WagmiProvider>
	);
}
