import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { NftVestingDao } from "../typechain";

describe("NftVestingDao", function () {
  let nftToken: NftVestingDao;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const nftFactory = await ethers.getContractFactory("NftVestingDao", owner);

    nftToken = await nftFactory.deploy();
    await nftToken.deployed();
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

  it("Should not stake NFT", async function () {
    await nftToken.mint(1);

    await expect(nftToken.toggleNesting(1)).to.be.revertedWith(
      "nesting closed"
    );
    expect(await nftToken.totalSupply()).to.equal(1);
  });

  it("Should stake NFT", async function () {
    await nftToken.mint(1);

    await nftToken.setNestingOpen(true);
    // tokenId 1
    await nftToken.toggleNesting(1);

    // go foward in time by 3600 ms
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    const [nested, , total] = await nftToken.nestingPeriod(1);
    // console.log(nested, current, total);

    expect(total).to.eq(ethers.BigNumber.from(3600));
    expect(nested).to.be.true;

    expect(await nftToken.totalSupply()).to.equal(1);
  });

  it("Should not be safeTransferWhileNesting the nested NFT", async function () {
    await nftToken.mint(1);

    await nftToken.setNestingOpen(true);
    // tokenId 1
    await nftToken.toggleNesting(1);

    // go foward in time by 3600 ms
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    const [nested, , total] = await nftToken.nestingPeriod(1);
    // console.log(nested, current, total);

    await expect(
      nftToken.safeTransferWhileNesting(owner.address, addr1.address, 1)
    ).to.be.revertedWith("only own account transfers");
  });

  it("Should not be transfer the nested NFT", async function () {
    await nftToken.mint(1);

    await nftToken.setNestingOpen(true);
    // tokenId 1
    await nftToken.toggleNesting(1);

    // go foward in time by 3600 ms
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    const [nested, , total] = await nftToken.nestingPeriod(1);
    // console.log(nested, current, total);

    await expect(
      nftToken.transferFrom(owner.address, addr1.address, 1)
    ).to.be.revertedWith("nesting");
  });

  it("Should safeTransferWhileNesting the nested NFT", async function () {
    await nftToken.mint(1);

    await nftToken.setNestingOpen(true);
    // tokenId 1
    await nftToken.toggleNesting(1);

    // go foward in time by 3600 ms
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    const [nested, , total] = await nftToken.nestingPeriod(1);
    // console.log(nested, current, total);

    await nftToken.safeTransferWhileNesting(owner.address, owner.address, 1);
  });

  it("Should unstake NFT", async function () {
    await nftToken.mint(1);

    await nftToken.setNestingOpen(true);

    // tokenId 1 nested
    await expect(nftToken.toggleNesting(1)).to.emit(nftToken, "Nested");

    // go foward in time by 3600 ms
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    var [nested, ,] = await nftToken.nestingPeriod(1);

    expect(nested).to.be.true;

    // token 1 unested
    await expect(nftToken.toggleNesting(1)).to.emit(nftToken, "Unnested");

    var [nested, ,] = await nftToken.nestingPeriod(1);

    expect(nested).to.be.false;

    expect(await nftToken.totalSupply()).to.equal(1);
  });

  it("Should not be able to claim rewards beucase the are 0", async function () {
    await nftToken.mint(1);

    await nftToken.setNestingOpen(true);

    // tokenId 1 nested
    await expect(nftToken.toggleNesting(1)).to.emit(nftToken, "Nested");

    // go foward in time by 3600 ms
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    const [nested, ,] = await nftToken.nestingPeriod(1);

    expect(nested).to.be.true;

    await expect(nftToken.claimReward(1)).to.be.revertedWith(
      "no rewards to be claimed"
    );

    // const tx = await nftToken.claimReward(1);
    // await tx.wait();
    // expect(tx.value).to.be.equal(0);

    expect(await nftToken.totalSupply()).to.equal(1);
  });

  it("Should be able to claim rewards", async function () {
    await nftToken
      .connect(addr1)
      .mint(1, { value: ethers.utils.parseEther("0.1") });

    await nftToken.setNestingOpen(true);
    await nftToken.transferRewardsFund(ethers.utils.parseEther("0.01"));
    // console.log(await nftToken.treasuryFund());
    // console.log(await nftToken.rewardsFund());
    // tokenId 1 nested
    await expect(nftToken.connect(addr1).toggleNesting(1)).to.emit(
      nftToken,
      "Nested"
    );

    // go foward in time by 3600 ms
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    const [, current, total] = await nftToken.connect(addr1).nestingPeriod(1);
    // console.log(current);
    // console.log(total);

    const preBalance = await addr1.getBalance();
    console.log("preBalance", preBalance);
    const tx = await nftToken.connect(addr1).claimReward(1);
    await tx.wait();
    // var [,current,total] = await nftToken.nestingPeriod(1);
    // console.log(current);
    // console.log(total);
    // expect(tx.value).to.be.equal(ethers.utils.parseEther('0.01'));

    expect(await addr1.getBalance()).to.be.gt(preBalance);
  });
});
