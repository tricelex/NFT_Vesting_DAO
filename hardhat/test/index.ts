import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { NftVestingDao, NftVestingDao__factory } from "../typechain";
import { BigNumber } from "ethers";

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
    ));

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

  it("Should not stake NFT", async function () {
    await nftToken.mint(1);
    
    await expect(nftToken.toggleNesting(1)).to.be.revertedWith('nesting closed');
    expect(await nftToken.totalSupply()).to.equal(1);

  });

  it("Should stake NFT", async function () {
    await nftToken.mint(1);
    
    await nftToken.setNestingOpen(true);
    //tokenId 1
     await nftToken.toggleNesting(1);
    
     // go foward in time by 3600 ms
    await network.provider.send("evm_increaseTime", [3600])
    await network.provider.send("evm_mine") 

    var [nested,current,total] = await nftToken.nestingPeriod(1);
    //console.log(nested, current, total);
   
    expect(total).to.eq(ethers.BigNumber.from(3600));
    expect(nested).to.be.true;
   

    expect(await nftToken.totalSupply()).to.equal(1);

  });

  it("Should unstake NFT", async function () {
    await nftToken.mint(1);
    
    await nftToken.setNestingOpen(true);
    
    //tokenId 1 nested
     await expect(nftToken.toggleNesting(1)).to.emit(nftToken, "Nested");
    
     // go foward in time by 3600 ms
    await network.provider.send("evm_increaseTime", [3600])
    await network.provider.send("evm_mine") 

    var [nested,,] = await nftToken.nestingPeriod(1);
   
    expect(nested).to.be.true;
   
    //token 1 unested
    await expect(nftToken.toggleNesting(1)).to.emit(nftToken, "Unnested");

    var [nested,,] = await nftToken.nestingPeriod(1);

    expect(nested).to.be.false;

    expect(await nftToken.totalSupply()).to.equal(1);

  });


});
