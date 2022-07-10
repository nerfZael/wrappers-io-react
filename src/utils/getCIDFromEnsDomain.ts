import { ethers } from "ethers";
import { getCidFromContenthash } from "./getCidFromContenthash";

export const getCIDFromEnsDomain = async (ensDomain: string, provider: ethers.providers.JsonRpcProvider): Promise<string | undefined> => {
  const resolver = await provider?.getResolver(ensDomain);
  const contenthash = await resolver?.getContentHash();
  if(!contenthash) {
    return;
  }
  const cid = getCidFromContenthash(contenthash);

  return cid;
};