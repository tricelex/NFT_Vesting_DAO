import { useEffect, useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import type { ExternalProvider } from "@ethersproject/providers";

export function useEthereumProvider() {
  const [ethereumProvider, setEthereumProvider] =
    useState<ExternalProvider | null>(null);
  const [isMetaMask, setIsMetaMask] = useState(false);

  useEffect(() => {
    async function detectProvider() {
      const provider = (await detectEthereumProvider()) as ExternalProvider;
      setEthereumProvider(provider);

      if (provider === window.ethereum) {
        setIsMetaMask(!!provider);
      }
    }

    detectProvider();

    return () => {
      setEthereumProvider(null);
      setIsMetaMask(false);
    };
  }, []);

  return { ethereumProvider, isMetaMask };
}
