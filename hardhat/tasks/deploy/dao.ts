import { task } from "hardhat/config";

import { getExpectedContractAddress } from "../utils";

import {
  DaoNftToken,
  DaoNftToken__factory,
  MyGovernor,
  MyGovernor__factory,
  Timelock,
  Timelock__factory,
} from "../../typechain";

task("deploy:Dao").setAction(async function (_, { ethers, run }) {
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
    governor: governor.address,
    timelock: timelock.address,
    token: token.address,
  });
});
