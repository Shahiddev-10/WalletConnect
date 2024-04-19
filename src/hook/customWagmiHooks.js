import { BrowserProvider, JsonRpcProvider, JsonRpcSigner } from "ethers";
import { useMemo } from "react";
import { useClient, useConnectorClient } from "wagmi";

export function clientToSigner(client) {
	const { account, chain, transport } = client;
	const network = {
		chainId: chain.id,
		name: chain.name,
		ensAddress: chain.contracts?.ensRegistry?.address,
	};
	const provider = new BrowserProvider(transport, network);
	const signer = new JsonRpcSigner(provider, account.address);
	return signer;
}

export function useEthersSigner({ chainId } = {}) {
	const { data: client } = useConnectorClient({ chainId });
	return useMemo(
		() => (client ? clientToSigner(client) : undefined),
		[client]
	);
}

export function clientToProvider(client) {
	const { chain, transport } = client;
	const network = {
		chainId: chain.id,
		name: chain.name,
		ensAddress: chain.contracts?.ensRegistry?.address,
	};
	return new JsonRpcProvider(transport.url, network);
}

export function useEthersProvider({ chainId } = {}) {
	const client = useClient({ chainId });
	return useMemo(() => clientToProvider(client), [client]);
}
