const projectConfig = {
  nftName: "VestingNFT",

  nftSymbol: "VNFT",

  maxSupply: 100,

  maxMintAmountPerTxn: 1,

  mintCost: process.env.NODE_ENV === "production" ? 0.01 : 0.01,

  networkName:
    process.env.NODE_ENV === "production"
      ? "Rinkeby Testnet" // 'Ethereum Mainnet'
      : "Rinkeby Testnet", // 'Rinkeby Testnet'

  chainName: "RINKEBY", // 'ETH'

  chainId: process.env.NODE_ENV === "production" ? 4 : 4, // Ethereum (1), Rinkeby (4)

  siteDomain: "www.yourdomain.com",

  siteUrl:
    process.env.NODE_ENV === "production"
      ? `https://your_site_domain`
      : "http://localhost:3000",

  twitterUsername: "@your_twitter_handle",

  twitterUrl: "https://twitter.com/your_twitter_handle",

  discordUrl: "https://discord.gg/your_discord_invite_code",

  openseaCollectionUrl:
    process.env.NODE_ENV === "production"
      ? "https://opensea.io/collection/your_opensea_collection_name"
      : "https://testnets.opensea.io/collection/your_opensea_collection_name",

  contractAddress:
    process.env.NODE_ENV === "production"
      ? "0x11A5b3D9113aCD9603134d98263A0A26FEA1D8D4"
      : "0x11A5b3D9113aCD9603134d98263A0A26FEA1D8D4",

  scanUrl:
    process.env.NODE_ENV === "production"
      ? "https://rinkeby.etherscan.io/address/0x11A5b3D9113aCD9603134d98263A0A26FEA1D8D4"
      : "https://rinkeby.etherscan.io/address/0x11A5b3D9113aCD9603134d98263A0A26FEA1D8D4",
  // : "https://mumbai.polygonscan.com/address/your_mumbai_contract_address",
  // 'https://etherscan.io/address/your_ethereum_contract_address'
  // 'https://rinkeby.etherscan.io/address/your_rinkeby_contract_address'
};

export default projectConfig;
