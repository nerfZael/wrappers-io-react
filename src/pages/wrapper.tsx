import { Network } from "../utils/Network";
import LoadedWrapperView from "../components/loaded-wrapper-view/LoadedWrapperView";
import { LoadedWrapper } from "../models/LoadedWrapper";
import LoadWrapper from "../components/load-wrapper/LoadWrapper";
import { constants } from "../constants";
import { WrapperInfo } from "../models/WrapperInfo";
import { PublishedWrapper } from "../models/PublishedWrapper";

import { create as createIpfsNode } from "ipfs-http-client";
import { useEthers } from "@usedapp/core";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import Navigation from "../components/navigation";
import { NextPage } from "next";
import { useRouter } from "next/router";

const ipfsNode = createIpfsNode({
  url: constants.WRAPPERS_GATEWAY_URL,
});
const WrapperPage: NextPage = () => {
  const router = useRouter();
  const { cid, chainId: routeChainId, ens, wns, ocrId } = router.query;

  const { chainId } = useEthers();
  const [wrapper, setWrapper] = useState<LoadedWrapper | undefined>();
  const [wrapperInfo, setWrapperInfo] = useState<WrapperInfo>();
  const [publishedWrapper, setPublishedWrapper] = useState<
    PublishedWrapper | undefined
  >();

  useEffect(() => {
    setPublishedWrapper({
      cid: cid as string,
      ensDomain: ens
        ? {
            name: ens as string,
            chainId: parseInt(routeChainId as string),
          }
        : undefined,
      wnsDomain: wns
        ? {
            name: wns as string,
            chainId: parseInt(routeChainId as string),
          }
        : undefined,
    });
  }, [cid, chainId, ens, wns, ocrId]);

  return (
    <>
      <Navigation></Navigation>
      <div className="page">
        {wrapperInfo && wrapperInfo.name && (
          <span>
            {wrapperInfo.name} ({Network.fromChainId(chainId).name})
          </span>
        )}
        {!(wrapperInfo && wrapperInfo.name) && (
          <span>Wrapper ({Network.fromChainId(chainId).name})</span>
        )}

        <div>
          <LoadWrapper
            publishedWrapper={publishedWrapper}
            ipfsNode={ipfsNode}
            setLoadedWrapper={setWrapper}
          ></LoadWrapper>
          {wrapper && (
            <LoadedWrapperView
              wrapper={wrapper}
              setWrapper={setWrapper}
              ipfsNode={ipfsNode}
              setLoadedWrapperInfo={setWrapperInfo}
              setPublishedWrapper={setPublishedWrapper}
            ></LoadedWrapperView>
          )}
        </div>
      </div>
    </>
  );
};

export default WrapperPage;
