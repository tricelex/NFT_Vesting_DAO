// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NftVestingDao is ERC721Enumerable, ERC721Royalty, Ownable {
    constructor() ERC721("VestingNFT", "VNFT") {
        /**
        @dev set the royalty percentage(5%) 
        */
        setRoyaltyInfo(msg.sender, 500);
    }

    /**
    @dev _price is the price of one NFT
     */
    uint256 public _price = 0.01 ether;

    /**
    @dev maxMintAmount is the max number of NFTs that can be minted at once
     */
    uint256 public maxMintAmount = 1;

    /**
    @dev maxSupply is the max supply of NFTs
     */
    uint256 public maxSupply = 100;

    /**
    @dev money raised and earned in treasury
     */
    uint256 public treasuryFund;

    /**
    @dev money to be distributed to the staked NFTs
     */
    uint256 public rewardsFund;

    /**
    @dev tokenId to nesting start time (0 = not nesting).
     */
    mapping(uint256 => uint256) private nestingStarted;

    /**
    @dev tokenId to nesting restart time (0 = not nesting).
     */
    mapping(uint256 => uint256) private nestingRestarted;

    /**
    @dev Cumulative per-token nesting, excluding the current period.
     */
    mapping(uint256 => uint256) private nestingTotal;

    /**
    @dev Cumulative amount claimable per staker.
     */
    mapping(uint256 => uint256) private claimablePerTokenId;

    /**
    @dev MUST only be modified by safeTransferWhileNesting(); if set to 2 then
    the _beforeTokenTransfer() block while nesting is disabled.
     */
    uint256 private nestingTransfer = 1;

    /**
    @notice Whether nesting is currently allowed.
    @dev If false then nesting is blocked, but unnesting is always allowed.
    */
    bool public nestingOpen = false;

    /**
    @dev Emitted when a Token begins nesting.
     */
    event Nested(uint256 indexed tokenId);

    /**
    @dev Emitted when a Token stops nesting; either through standard means or
    by expulsion.
     */
    event Unnested(uint256 indexed tokenId);

    modifier tokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == _msgSender(), "only owner");
        _;
    }

    function mint(uint256 _mintAmount) public payable {
        uint256 supply = totalSupply();
        require(_mintAmount > 0);
        require(_mintAmount <= maxMintAmount);
        require(supply + _mintAmount <= maxSupply);

        if (msg.sender != owner()) {
            require(msg.value >= _price * _mintAmount);
        }

        for (uint256 i = 1; i <= _mintAmount; i++) {
            super._mint(msg.sender, supply + i);
        }
        treasuryFund += msg.value;
    }

    /**
    
    {@notice Returns the length of time, in seconds, that the Token has
    nested.
    @dev Nesting is tied to a specific Token, not to the owner, so it doesn't
    reset upon sale.
    @return nesting Whether the Token is currently nesting. MAY be true with
    zero current nesting if in the same block as nesting began.
    @return current Zero if not currently nesting, otherwise the length of time
    since the most recent nesting began.
    @return total Total period of time for which the Token has nested across
    its life, including the current period.
    */
    function nestingPeriod(uint256 tokenId)
        external
        view
        returns (
            bool nesting,
            uint256 current,
            uint256 total
        )
    {
        uint256 start = nestingStarted[tokenId];
        if (start != 0) {
            nesting = true;
            current = block.timestamp - start;
        }
        total = current + nestingTotal[tokenId];
    }

    function checkIfNesting(uint256 tokenId)
        public
        view
        returns (bool nesting)
    {
        return nestingStarted[tokenId] != 0;
    }

    /**
    @notice Changes the Token's nesting status.
    */
    function toggleNesting(uint256 tokenId)
        external
        tokenOwner(tokenId)
    /** onlyApprovedOrOwner(tokenId) change to onlyOwner*/
    {
        uint256 start = nestingStarted[tokenId];
        if (start == 0) {
            require(nestingOpen, "nesting closed");
            nestingStarted[tokenId] = block.timestamp;
            nestingRestarted[tokenId] = block.timestamp;
            emit Nested(tokenId);
        } else {
            nestingTotal[tokenId] += block.timestamp - start;
            nestingStarted[tokenId] = 0;
            emit Unnested(tokenId);
        }
    }

    function resetAllNesting() external onlyOwner {
        for (uint256 i; i < totalSupply(); i++) {
            uint256 currentTokenId = tokenByIndex(i);
            nestingStarted[currentTokenId] = 0;
        }
    }

    function claimableReward(uint256 tokenId) external view returns (uint256) {
        require(claimablePerTokenId[tokenId] != 0, "Nothing to claim");
        uint256 reward = claimablePerTokenId[tokenId];
        return reward;
    }

    function claimReward(uint256 tokenId)
        external
        payable
        tokenOwner(tokenId)
        returns (uint256)
    {
        require(rewardsFund > 0, "no rewards to be claimed");

        uint256 reward = this.claimableReward(tokenId);

        address addr = msg.sender;
        address payable wallet = payable(addr);
        wallet.transfer(reward);

        return reward;
    }

    function transferRewardsFund(uint256 _rewardsTransfer)
        external
        onlyOwner
        returns (uint256, uint256)
    {
        require(_rewardsTransfer < treasuryFund, "not enough funds available");
        uint256 newBalanceTreasuryFund = treasuryFund - _rewardsTransfer;
        uint256 newBalanceRewardsFund = rewardsFund + _rewardsTransfer;

        treasuryFund = newBalanceTreasuryFund;
        rewardsFund = newBalanceRewardsFund;

        //total elapsed time for all tokens
        uint256 totalElapsed;
        for (uint256 i; i < totalSupply(); i++) {
            uint256 currentTokenId = tokenByIndex(i);
            totalElapsed += block.timestamp - nestingStarted[currentTokenId];
        }

        //claimble amount per token
        for (uint256 i; i < totalSupply(); i++) {
            uint256 currentTokenId = tokenByIndex(i);
            uint256 elapsedToken = block.timestamp -
                nestingStarted[currentTokenId];
            uint256 tokenClaimableAmount = (elapsedToken / totalElapsed) *
                _rewardsTransfer;
            claimablePerTokenId[currentTokenId] = tokenClaimableAmount;
        }

        return (treasuryFund, rewardsFund);
    }

    /**
    @notice Toggles the `nestingOpen` flag.
    */
    function setNestingOpen(bool open) external onlyOwner {
        nestingOpen = open;
    }

    /**
    @notice Transfer a token between addresses while the Token is minting,
    thus not resetting the nesting period.
    */
    function safeTransferWhileNesting(
        address from,
        address to,
        uint256 tokenId
    ) external tokenOwner(tokenId) {
        require(
            from == ownerOf(tokenId) && to == ownerOf(tokenId),
            "only own account transfers"
        );
        nestingTransfer = 2;
        safeTransferFrom(from, to, tokenId);
        nestingTransfer = 1;
    }

    function setRoyaltyInfo(address _receiver, uint96 _feeNumerator)
        public
        onlyOwner
    {
        _setDefaultRoyalty(_receiver, _feeNumerator);
    }

    /**
    @dev Block transfers while nesting.
    */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        require(
            nestingStarted[tokenId] == 0 || nestingTransfer == 2,
            "nesting"
        );
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
    @dev overrides fucntions for royaltis
    */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721Royalty) {
        super._burn(tokenId);
        super._resetTokenRoyalty(tokenId);
    }

    function withdraw() public payable onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        require(success);
        treasuryFund = address(this).balance;
    }
}
