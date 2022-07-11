import { Network } from "../utils/Network";
import LoadedWrapperView from "../components/LoadedWrapperView";
import { LoadedWrapper } from "../models/LoadedWrapper";
import { WrapperInfo } from "../models/WrapperInfo";
import { PublishedWrapper } from "../models/PublishedWrapper";
import Navigation from "../components/navigation";
import { WRAPPERS_GATEWAY_URL } from "../constants";
import LoadWrapper from "../components/LoadWrapper";

import { create as createIpfsNode } from "ipfs-http-client";
import { useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";

const ipfsNode = createIpfsNode({
  url: WRAPPERS_GATEWAY_URL,
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

  const result = useDropzone({ noClick: true });
  const { acceptedFiles, getRootProps, getInputProps, isDragAccept } = result;

  const dropHover = isDragAccept ? " drop-hover" : "";

  console.log("isDragActive", isDragAccept);
  return (
    <>
      <Navigation></Navigation>
      <div className="page">
        <div
          {...getRootProps({
            className: `dropzone ${dropHover}`,
          })}
        >
          <input {...getInputProps()} />
          {isDragAccept && (
            <p>
              Drag &quot;n&quot; drop some files here, or click to select files
            </p>
          )}
          {!isDragAccept && (
            <>
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default WrapperPage;
