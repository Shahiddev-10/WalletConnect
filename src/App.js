import { Route, Routes } from "react-router-dom";

import Layout from "./layout/Layout";
// import { MetaMaskProvider } from "./hook";
import { WalletConnectConfig } from "./configs/walletConnectConfig";
import { lazy } from "react";

import Exchange from "./pages/Exchange";
import Home from "./pages/Home";

// const Home = lazy(() => import("./pages/Home"));
// const Exchange = lazy(() => import("./pages/Exchange"));

function App() {
	return (
		<>
			<WalletConnectConfig>
				{/* <MetaMaskProvider> */}
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index path="/" element={<Home />}></Route>
						<Route path="/Exchange" element={<Exchange />}></Route>
					</Route>
				</Routes>

				{/* </MetaMaskProvider> */}
			</WalletConnectConfig>
		</>
	);
}

export default App;
