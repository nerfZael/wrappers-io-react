import LoadedWrapperView from "./LoadedWrapperView";
import { LoadedWrapper } from "../models/LoadedWrapper";
import { WrapperInfo } from "../models/WrapperInfo";
import { PublishedWrapper } from "../models/PublishedWrapper";
import Navigation from "./Navigation";
import LoadWrapper from "./LoadWrapper";

import { IPFSHTTPClient } from "ipfs-http-client";
import { useDropzone } from "react-dropzone";
import { useState } from "react";

const WrapperPageContent: React.FC<{
  wrapper: LoadedWrapper | undefined;
  ipfsNode: IPFSHTTPClient;
  setWrapper: (wrapper: LoadedWrapper) => void;
}> = ({ wrapper, ipfsNode, setWrapper }) => {
  const [wrapperInfo, setWrapperInfo] = useState<WrapperInfo>();
  const [publishedWrapper, setPublishedWrapper] = useState<
    PublishedWrapper | undefined
  >();

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
                {!wrapper && (
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

export default WrapperPageContent;
