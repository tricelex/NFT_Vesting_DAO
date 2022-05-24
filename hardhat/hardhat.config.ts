import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import {
  NftVestingDao,
  NftVestingDao__factory,
  MyGovernor,
  MyGovernor__factory,
} from "./typechain";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("fugazi").setAction(async function (_, { ethers, run }) {
  const nftFactory: NftVestingDao__factory = await ethers.getContractFactory(
    "NftVestingDao"
  );

  const token: NftVestingDao = <NftVestingDao>await nftFactory.deploy();
  await token.deployed();

  // const governorFactory: MyGovernor__factory = await ethers.getContractFactory(
  //   "MyGovernor"
  // );
  // const governor: MyGovernor = <MyGovernor>(
  //   await governorFactory.deploy(token.address)
  // );
  // await governor.deployed();

  // Verify contracts on Etherscan
  // await run("verify:verify", {
  //   address: token.address,
  // });

  // await run("verify:verify", {
  //   address: governor.address,
  //   constructorArguments: [token.address],
  // });

  console.log("Dao deployed to: ", {
    token: token.address,
    // governor: governor.address,
  });
});

task("lol", "Prints the Laughables", async (taskArgs, hre) => {
  console.log("Dao deployed to: HAHAHAHAHAHAHAHAHAHAH");
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.6",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rinkeby: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
};

export default config;
