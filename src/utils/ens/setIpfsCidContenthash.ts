import { ContractTransaction, ethers, Signer } from "ethers";
import { EnsRegistryContract } from "./EnsRegistryContract";
import { EnsResolverContract } from "./EnsResolverContract";
window.Buffer = window.Buffer || require("buffer").Buffer;
const contentHash = require('content-hash');

export const setIpfsCidContenthash = async (domain: string, cid: string, registryAddress: string, signer: Signer): Promise<ContractTransaction> => {
  const registry = EnsRegistryContract.create(registryAddress, signer);

  const resolverAddress = await registry.resolver(ethers.utils.namehash(domain));
  
  const resolver = EnsResolverContract.create(resolverAddress, signer);
  
  const contenthash = "0x" + contentHash.fromIpfs(cid);

  console.log("ethers.utils.namehash(domain)", ethers.utils.namehash(domain));
  console.log("ethers.utils.namehash(domain)", contenthash);
  const tx = await resolver.setContenthash(ethers.utils.namehash(domain), contenthash);

  return tx;
};

