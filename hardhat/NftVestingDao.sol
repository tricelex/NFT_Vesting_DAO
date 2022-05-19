// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NftVestingDao is ERC721Enumerable {
    constructor() ERC721("VestingNFT", "VNFT") {}

    /**
    @dev money raised and earned in treasury
     */
    uint256 public treasuryFund;

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
    @dev Emitted when a Moonbird begins nesting.
     */
    event Nested(uint256 indexed tokenId);

    /**
    @dev Emitted when a Moonbird stops nesting; either through standard means or
    by expulsion.
     */
    event Unnested(uint256 indexed tokenId);

    /**
    {@notice Returns the length of time, in seconds, that the Moonbird has
    nested.
    @dev Nesting is tied to a specific Moonbird, not to the owner, so it doesn't
    reset upon sale.
    @return nesting Whether the Moonbird is currently nesting. MAY be true with
    zero current nesting if in the same block as nesting began.
    @return current Zero if not currently nesting, otherwise the length of time
    since the most recent nesting began.
    @return total Total period of time for which the Moonbird has nested across
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

    /**
    @notice Changes the Moonbird's nesting status.
    */
    function toggleNesting(uint256 tokenId)
        external
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

    //claim reward from fund based on ratio of user's stake against team stake
    function claimReward(uint256 tokenId) external returns (uint256) {
        require(ownerOf(tokenId) == _msgSender(), "only owner");

        //elapsed time for claimer
        uint256 elapsedClaimer = block.timestamp - nestingRestarted[tokenId];

        //total elapsed time for all tokens
        uint256 totalElapsed;
        for (uint256 i; i < totalSupply(); i++) {
            uint256 currentTokenId = tokenByIndex(i);
            totalElapsed += block.timestamp - nestingStarted[tokenId];
        }

        //return proportion of treasury fund for claimer elapsed against total
        if (totalElapsed == 0) {
            return 0;
        }

        //reset nesting restarted
        nestingRestarted[tokenId] = block.timestamp;

        return (elapsedClaimer / totalElapsed) * treasuryFund;
    }

    /**
    @notice Toggles the `nestingOpen` flag.
    */
    function setNestingOpen(bool open) external {
        require(ownerOf(tokenId) == _msgSender(), "only owner");
        nestingOpen = open;
    }

    /**
    @notice Transfer a token between addresses while the Moonbird is minting,
    thus not resetting the nesting period.
    */
    function safeTransferWhileNesting(
        address from,
        address to,
        uint256 tokenId
    ) external {
        require(ownerOf(tokenId) == _msgSender(), "only owner");
        nestingTransfer = 2;
        safeTransferFrom(from, to, tokenId);
        nestingTransfer = 1;
    }

    /**
    @dev Block transfers while nesting.
    */
    function _beforeTokenTransfer(
        address,
        address,
        uint256 tokenId
    ) internal view override {
        require(
            nestingStarted[tokenId] == 0 || nestingTransfer == 2,
            "nesting"
        );
    }
}
