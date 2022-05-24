import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import Layout from "../components/Layout";
import Prose from "../components/Prose";
import Minting from "../components/Minting";
import Staking from "../components/Staking";
import Governance from "../components/Governance";
import Team from "../components/Team";
import projectConfig from "../config/projectConfig";
import topImage from "../public/assets/1920x600.png";
import { useEffect, useState } from "react";

import ABI from "../config/abi.json";
import rpcConfig from "../config/rpcConfig";
import { useEthereumProvider } from "../hooks/useEthereumProvider";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

const Home: NextPage = () => {
  const { account, active, chainId } = useWeb3React();
  const { ethereumProvider } = useEthereumProvider();

  // User's balance of NftVestingDao NFTs
  const [nftBalance, setNftBalance] = useState(0);

  // Reads the balance of the user's NftVestingDao NFTs and sets the `nftBalance` state variable
  useEffect(() => {
    async function getUserNFTBalance() {
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

          const balance = await contract.balanceOf(account);
          // setNftBalance(balance);
          setNftBalance(parseInt(balance.toString()));
          console.log(`User's NFT balance: ${balance}`);
          console.log(`User's Account: ${account}`);
        } catch (error) {
          console.log(error);
        }
      }
    }

    getUserNFTBalance();

    // cleanup
    return () => setNftBalance(0);
  }, [account, ethereumProvider]);

  return (
    <Layout>
      <Head>
        <title>{projectConfig.nftName}</title>
      </Head>

      <Image src={topImage} alt={projectConfig.nftName} />

      <div className="bg-gray-800 py-8">
        <Prose>
          <h1 className="text-5xl font-bold mb-2">{projectConfig.nftName}</h1>
          <p className="text-xl">
            A fund aiming to support early stage projects in DeFi, originally
            funded through an NFT collection sales. Drives value back to the Gr8
            token holders (profit distribution)
          </p>
        </Prose>
      </div>

      <div className="py-8">
        <Prose>
          <Minting />
        </Prose>
      </div>

      {nftBalance && nftBalance >= 1 ? (
        <>
          <div className="bg-gray-800 py-8">
            <Prose>
              <Staking nftBalance={nftBalance} />
            </Prose>
          </div>

          <div className="py-8">
            <Prose>
              <Governance />
            </Prose>
          </div>
        </>
      ) : (
        ""
      )}

      <div className="bg-gray-800 py-8">
        <Prose>
          <Team />
        </Prose>
      </div>
    </Layout>
  );
};

export default Home;
