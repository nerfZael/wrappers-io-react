import { LoadedWrapper } from "../../../../models/LoadedWrapper";
import { ETH_PROVIDERS, WRAPPERS_GATEWAY_URL } from "../../../../constants";
import { loadFilesFromIpfs } from "../../../../utils/loadFilesFromIpfs";
import { fetchCidOrOcrId } from "../../../../utils/ens/fetchCidOrOcrId";
import { getFilesByOcrId } from "../../../../utils/ocr/getFilesByOcrId";
import { getProvider } from "../../../../utils/getProvider";
import { Network } from "../../../../utils/Network";
import WrapperPageContent from "../../../../components/WrapperPageContent";

import { create as createIpfsNode } from "ipfs-http-client";
import { useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { ethers } from "ethers";

const ipfsNode = createIpfsNode({
  url: WRAPPERS_GATEWAY_URL,
});
const WrapperPage: NextPage = () => {
  const router = useRouter();
  const domain = router.query.network as string;
  const network = "mainnet";

  const { chainId, library: provider } = useEthers();
  const [wrapper, setWrapper] = useState<LoadedWrapper | undefined>();

  useEffect(() => {
    (async () => {
      if (wrapper || !provider || !chainId) {
        return;
      }

      const routeChainId = Network.fromNetworkName(network).chainId;

      const networkProvider =
        routeChainId === chainId
          ? provider
          : ethers.getDefaultProvider(ETH_PROVIDERS[routeChainId]);
      console.log("networkProvider", networkProvider);
      const result = await fetchCidOrOcrId(
        {
          name: domain as string,
          chainId: routeChainId,
        },
        routeChainId,
        networkProvider
      );
      console.log("result", result);

      if (result.cid) {
        const ipfsFiles = await loadFilesFromIpfs(result.cid, ipfsNode);

        if (!ipfsFiles || !ipfsFiles.length) {
          return;
        }

        const wrp = {
          cid: result.cid,
          ensDomain: {
            name: domain,
            chainId: routeChainId,
          },
          files: ipfsFiles,
        };

        console.log("WRP e", wrp);
        setWrapper(wrp);
      } else if (result.ocrId) {
        const readOnlyProvider = getProvider(
          result.ocrId.chainId,
          routeChainId,
          provider
        );

        console.log(readOnlyProvider);
        if (!readOnlyProvider) {
          return;
        }

        const packageFiles = await getFilesByOcrId(
          result.ocrId,
          readOnlyProvider
        );

        if (!packageFiles || !packageFiles.length) {
          return;
        }

        const wrp = {
          ocrId: result.ocrId,
          ensDomain: {
            name: domain,
            chainId: routeChainId,
          },
          files: packageFiles,
        };

        console.log("WRP e o", wrp);
        setWrapper(wrp);
      }
    })();
  }, [wrapper, domain, network, provider, chainId]);

  return (
    <>
      <WrapperPageContent
        wrapper={wrapper}
        setWrapper={setWrapper}
        ipfsNode={ipfsNode}
      ></WrapperPageContent>
    </>
  );
};

export default WrapperPage;