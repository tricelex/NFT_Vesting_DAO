import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { NftVestingDao, NftVestingDao__factory } from "../typechain";

describe("NftVestingDao", function () {
  let nftToken: NftVestingDao;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const nftFactory = (await ethers.getContractFactory(
      "NftVestingDao",
      owner
    )) as NftVestingDao__factory;

    nftToken = await nftFactory.deploy();
    await nftToken.deployed();

    // console.log("owner", owner.address);
    // console.log("addr1", addr1.address);
    // console.log("addr2", addr2.address);
  });

  it("Should return the 'owner' as contract owner", async function () {
    expect(await nftToken.owner()).to.equal(owner.address);
  });

  // it("Contract owner should mint token and increase balance", async function () {
  //   await nftToken.mint(owner.address);
  //   expect(await nftToken.balanceOf(owner.address)).to.equal(1);
  // });

  it("Total Supply at deployment should be zero", async function () {
    expect(await nftToken.totalSupply()).to.equal(0);
  });
});
