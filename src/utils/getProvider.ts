import { ethers } from "ethers";
import { PROVIDERS } from "./constant";

export const getProvider = (desiredChainId: number, currentChainId: number, provider: ethers.providers.Provider): ethers.providers.Provider | undefined => {
  if (currentChainId === desiredChainId) {
    return provider;
  } else if (PROVIDERS[desiredChainId]) {
    return new ethers.providers.JsonRpcProvider(PROVIDERS[desiredChainId]);
  } else {
    return undefined;
  }
};