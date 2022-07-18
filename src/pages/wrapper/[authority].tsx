import LoadedWrapperView from "../../components/LoadedWrapperView";
import { LoadedWrapper } from "../../models/LoadedWrapper";
import { WrapperInfo } from "../../models/WrapperInfo";
import { PublishedWrapper } from "../models/PublishedWrapper";
import Navigation from "../../components/Navigation";
import { ETH_PROVIDERS, WRAPPERS_GATEWAY_URL } from "../../constants";
import LoadWrapper from "../../components/LoadWrapper";

import { create as createIpfsNode } from "ipfs-http-client";
import { useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import { loadFilesFromIpfs } from "../../utils/loadFilesFromIpfs";
import { ethers } from "ethers";
import { fetchCidOrOcrId } from "../../utils/ens/fetchCidOrOcrId";
import { getFilesByOcrId } from "../../utils/ocr/getFilesByOcrId";
import { getProvider } from "../../utils/getProvider";

const ipfsNode = createIpfsNode({
  url: WRAPPERS_GATEWAY_URL,
});
const WrapperPage: NextPage = () => {
  const router = useRouter();
  const { authority, value, chainId: routeChainId } = router.query;

  const { chainId, provider } = useEthers();
  const [wrapper, setWrapper] = useState<LoadedWrapper | undefined>();
  const [wrapperInfo, setWrapperInfo] = useState<WrapperInfo>();
  const [publishedWrapper, setPublishedWrapper] = useState<
    PublishedWrapper | undefined
  >();

  useEffect(() => {
    (async () => {
      if (wrapper) {
        return;
      }

      switch (authority) {
        case "ipfs":
          if (value) {
            const ipfsFiles = await loadFilesFromIpfs(
              value as string,
              ipfsNode
            );

            if (!ipfsFiles || !ipfsFiles.length) {
              return;
            }

            const wrp = {
              cid: value as string,
              files: ipfsFiles,
            };

            console.log("WRP", wrp);
            setWrapper(wrp);
          }
          break;
        case "ens":
          if (value) {
            console.log("ENS", value);

            const networkProvider =
              parseInt(routeChainId as string) === chainId
                ? provider
                : ethers.getDefaultProvider(
                    ETH_PROVIDERS[parseInt(routeChainId as string)]
                  );
            console.log("networkProvider", networkProvider);
            const result = await fetchCidOrOcrId(
              {
                name: value as string,
                chainId: parseInt(routeChainId as string),
              },
              parseInt(routeChainId as string),
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
                  name: value as string,
                  chainId: parseInt(routeChainId as string),
                },
                files: ipfsFiles,
              };

              console.log("WRP e", wrp);
              setWrapper(wrp);
            } else if (result.ocrId) {
              const readOnlyProvider = getProvider(
                result.ocrId.chainId,
                parseInt(routeChainId as string),
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
                  name: value as string,
                  chainId: parseInt(routeChainId as string),
                },
                files: packageFiles,
              };

              console.log("WRP e o", wrp);
              setWrapper(wrp);
            }
          }
          break;
      }
    })();
  }, [wrapper, authority, value, provider, chainId, routeChainId]);

  const result = useDropzone({ noClick: true });
  const { acceptedFiles, getRootProps, getInputProps, isDragAccept } = result;

  const dropHover = isDragAccept ? " drop-hover" : "";

  console.log("isDragActive", isDragAccept);
  return (
    <>
      <Navigation></Navigation>
      <div className="page container-xl">
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
              <h2 className="p-3 mt-2 text-center">
                {wrapperInfo && wrapperInfo.name && (
                  <span>{wrapperInfo.name}</span>
                )}
                {!(wrapperInfo && wrapperInfo.name) && <span>Wrapper</span>}
              </h2>

              <div className="widget widget-border widget-shadow widget-with-tabs">
                {!wrapper && !value && (
                  <LoadWrapper
                    publishedWrapper={publishedWrapper}
                    ipfsNode={ipfsNode}
                    setLoadedWrapper={setWrapper}
                  ></LoadWrapper>
                )}
                {wrapper && (
                  <LoadedWrapperView
                    wrapper={wrapper}
                    setWrapper={setWrapper}
                    ipfsNode={ipfsNode}
                    setLoadedWrapperInfo={setWrapperInfo}
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
