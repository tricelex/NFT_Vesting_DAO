// For Ethereum, use the Infura endpoints
export default function rpcConfig(infuraKey?: string) {
    return process.env.NODE_ENV === 'production'
      ? `https://rinkeby.infura.io/v3/${infuraKey}` // `https://mainnet.infura.io/v3/${infuraKey}`
      : `https://rinkeby.infura.io/v3/${infuraKey}` // `https://mainnet.infura.io/v3/${infuraKey}`
  }
  