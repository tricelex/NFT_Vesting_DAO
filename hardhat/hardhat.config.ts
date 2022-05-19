import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import { getExpectedContractAddress } from "./tasks/utils";

import {
  DaoNftToken,
  DaoNftToken__factory,
  MyGovernor,
  MyGovernor__factory,
  Timelock,
  Timelock__factory,
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
  const timelockDelay = 2;

  const tokenFactory: DaoNftToken__factory = await ethers.getContractFactory(
    "DaoNftToken"
  );

  const signerAddress = await tokenFactory.signer.getAddress();
  const signer = await ethers.getSigner(signerAddress);

  const governorExpectedAddress = await getExpectedContractAddress(signer);

  const token: DaoNftToken = <DaoNftToken>await tokenFactory.deploy();
  await token.deployed();

  const timelockFactory: Timelock__factory = await ethers.getContractFactory(
    "Timelock"
  );
  const timelock: Timelock = <Timelock>(
    await timelockFactory.deploy(governorExpectedAddress, timelockDelay)
  );
  await timelock.deployed();

  const governorFactory: MyGovernor__factory = await ethers.getContractFactory(
    "MyGovernor"
  );
  const governor: MyGovernor = <MyGovernor>(
    await governorFactory.deploy(token.address, timelock.address)
  );
  await governor.deployed();

  // Verify contracts on Etherscan
  //   await run("verify:verify", {
  //     address: token.address,
  //   });

  //   await run("verify:verify", {
  //     address: timelock.address,
  //     constructorArguments: [governor.address, timelockDelay],
  //   });

  //   await run("verify:verify", {
  //     address: governor.address,
  //     constructorArguments: [token.address, timelock.address],
  //   });

  console.log("Dao deployed to: ", {
    governorExpectedAddress,
    // governor: governor.address,
    timelock: timelock.address,
    token: token.address,
  });
});

task("lol", "Prints the Laughabkles", async (taskArgs, hre) => {
  console.log("Dao deployed to: HAHAHAHAHAHAHAHAHAHAH");
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.6",
  networks: {
    hardhat: {
      // throwOnTransactionFailures: true,
      // throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      blockGasLimit: 0x1fffffffffffff,
      // accounts: accounts()
    },
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
  },
};

export default config;
