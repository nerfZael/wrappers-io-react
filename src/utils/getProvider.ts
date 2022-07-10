import { PROVIDERS } from "./constant";

import { ethers } from "ethers";

export const getProvider = (
  desiredChainId: number,
  currentChainId: number,
  provider: ethers.providers.Provider
): ethers.providers.Provider | undefined => {
  if (currentChainId === desiredChainId) {
    return provider;
  } else if (PROVIDERS[desiredChainId]) {
    return new ethers.providers.JsonRpcProvider(PROVIDERS[desiredChainId]);
  } else {
    return undefined;
  }
};
