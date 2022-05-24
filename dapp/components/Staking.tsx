import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

import ABI from "../config/abi.json";
import rpcConfig from "../config/rpcConfig";
import projectConfig from "../config/projectConfig";
import { useEthereumProvider } from "../hooks/useEthereumProvider";

type Props = {
  nftBalance: number;
};

export default function Staking({ nftBalance }: Props) {
  const { account, active, chainId } = useWeb3React();
  const { ethereumProvider } = useEthereumProvider();

  console.log("nftBalance: ", nftBalance);

  const [message, setMessage] = useState("");
  const [connErrMsg, setConnErrMsg] = useState("");
  const [claimableReward, setClaimableReward] = useState(0);

  const [isPending, setIsPending] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isStaked, setIStaked] = useState(false);
  const [tokenId, setTokenId] = useState(0);

  async function stakeNFT() {
    if (account && ethereumProvider) {
      setMessage("");
      setIsPending(true);
      try {
        const web3Provider = new ethers.providers.Web3Provider(
          ethereumProvider
        );
        const signer = web3Provider.getSigner();
        const contract = new ethers.Contract(
          projectConfig.contractAddress,
          ABI,
          signer
        );
        const transaction = await contract.toggleNesting(tokenId);
        setIsPending(false);
        setIsMinting(true);
        await transaction.wait();
        setIsMinting(false);
        setMessage(`Yay! ${projectConfig.nftSymbol} successfully Staked`);
      } catch (error) {
        setIsPending(false);
      }
    }
  }

  async function claimReward() {
    if (account && ethereumProvider) {
      setMessage("");
      setIsPending(true);
      try {
        const web3Provider = new ethers.providers.Web3Provider(
          ethereumProvider
        );
        const signer = web3Provider.getSigner();
        const contract = new ethers.Contract(
          projectConfig.contractAddress,
          ABI,
          signer
        );
        const transaction = await contract.claimReward(tokenId);
        setIsPending(false);
        setIsMinting(true);
        await transaction.wait();
        setIsMinting(false);
        setMessage(`Yay! ${projectConfig.nftSymbol} reward Claimed!`);
      } catch (error) {
        setIsPending(false);
      }
    }
  }

  useEffect(() => {
    if (!active) {
      setConnErrMsg("Not connected to your wallet.");
    } else {
      if (chainId !== projectConfig.chainId) {
        setConnErrMsg(`Change the network to ${projectConfig.networkName}.`);
      } else {
        setConnErrMsg("");
      }
    }
  }, [active, chainId]);

  useEffect(() => {
    async function fetchClaimableReward() {
      if (account && ethereumProvider) {
        try {
          const web3Provider = new ethers.providers.JsonRpcProvider(
            rpcConfig(process.env.NEXT_PUBLIC_INFURA_KEY)
          );

          const contract = new ethers.Contract(
            projectConfig.contractAddress,
            ABI,
            web3Provider
          );

          let tokenId: number = 0;
          for (let index = 0; index < nftBalance; index++) {
            tokenId = await contract.tokenOfOwnerByIndex(account, index);
          }
          console.log("tokenId: ", parseInt(tokenId.toString()));
          const reward = await contract.claimableReward(
            parseInt(tokenId.toString())
          );
          setClaimableReward(parseInt(reward.toString()));
          setTokenId(parseInt(tokenId.toString()));
        } catch (error) {
          console.log(error);
        }
      }
    }

    fetchClaimableReward();

    // cleanup
    return () => setClaimableReward(0);
  }, [account, ethereumProvider, nftBalance]);

  useEffect(() => {
    async function fetchStakeStatus() {
      if (account && ethereumProvider) {
        try {
          const web3Provider = new ethers.providers.JsonRpcProvider(
            rpcConfig(process.env.NEXT_PUBLIC_INFURA_KEY)
          );

          const contract = new ethers.Contract(
            projectConfig.contractAddress,
            ABI,
            web3Provider
          );

          let tokenId: number = 0;
          for (let index = 0; index < nftBalance; index++) {
            tokenId = await contract.tokenOfOwnerByIndex(account, index);
          }
          const isStaked = await contract.checkIfNesting(
            parseInt(tokenId.toString())
          );
          setIStaked(isStaked);
        } catch (error) {
          console.log(error);
        }
      }
    }

    fetchStakeStatus();

    // cleanup
    return () => setIStaked(false);
  }, [account, ethereumProvider, nftBalance]);

  return (
    <>
      <h2 className="text-4xl mb-4">Staking</h2>
      <div className="bg-gray-800 border border-t-red-300 border-r-blue-300 border-b-green-300 border-l-yellow-300 rounded p-8 space-y-4">
        <div className="text-3xl font-bold text-center">
          <span className="text-pink-500">{claimableReward} ETH Claimable</span>
        </div>

        <div className="flex justify-center">
          {active && !connErrMsg ? (
            <>
              {isPending || isMinting ? (
                <button
                  type="button"
                  className="flex justify-center items-center rounded px-4 py-2 bg-red-700 font-bold w-40 cursor-not-allowed"
                  disabled
                >
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isPending && "Pending"}
                  {isMinting && "Minting"}
                  {!isPending && !isMinting && "Processing"}
                </button>
              ) : (
                <>
                  {active && isStaked ? (
                    <button
                      type="button"
                      className={`rounded px-4 py-2 bg-blue-700 hover:bg-blue-600 font-bold w-40`}
                      onClick={claimReward}
                    >
                      Claim Rewards
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`rounded px-4 py-2 bg-blue-700 hover:bg-blue-600 font-bold w-40`}
                      onClick={stakeNFT}
                    >
                      Stake NFT
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <button
              type="button"
              className={`rounded px-4 py-2 bg-gray-700 font-bold w-40 cursor-not-allowed`}
              disabled={true}
              onClick={stakeNFT}
            >
              Stake NFT
            </button>
          )}
        </div>

        {message && <div className="text-green-500 text-center">{message}</div>}
        {connErrMsg && (
          <div className="text-red-500 text-center">{connErrMsg}</div>
        )}
      </div>
    </>
  );
}
