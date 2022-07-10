import Tabs from "../tabs/Tabs";
import { downloadFilesAsZip } from "../../utils/downloadFilesAsZip";
import { LoadedWrapper } from "../../models/LoadedWrapper";
import { WrapperInfo } from "../../models/WrapperInfo";
import { toPrettyNumber } from "../../utils/toPrettyNumber";
import { escapeHTML } from "../../utils/escapeHTML";
import WrapperDeployment from "../wrapper-deployment/WrapperDeployment";
import { PublishedWrapper } from "../../models/PublishedWrapper";

import { IPFSHTTPClient } from "ipfs-http-client";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useEthers } from "@usedapp/core";
import { renderSchema } from "@polywrap/schema-compose";
import { InMemoryFile } from "@nerfzael/encoding";
import { useEffect, useState } from "react";
import { deserializeWrapManifest } from "@polywrap/wrap-manifest-types-js";

const LoadedWrapperView: React.FC<{
  wrapper: LoadedWrapper;
  setWrapper: (wrapper: LoadedWrapper) => void;
  ipfsNode: IPFSHTTPClient;
  setLoadedWrapperInfo: (wrapperInfo: WrapperInfo) => void;
  setPublishedWrapper: (publishedWrapper: PublishedWrapper) => void;
}> = ({
  wrapper,
  ipfsNode,
  setWrapper,
  setLoadedWrapperInfo,
  setPublishedWrapper,
}) => {
  const { library: provider } = useEthers();
  const [selectedTab, setSelectedTab] = useState<string | undefined>();
  const [wrapperInfo, setWrapperInfo] = useState<WrapperInfo>();

  useEffect(() => {
    wrapperInfo && setLoadedWrapperInfo(wrapperInfo);
  }, [wrapperInfo, setLoadedWrapperInfo]);

  useEffect(() => {
    if (!wrapper.files.length) {
      return;
    }

    (async () => {
      const manifestContent = wrapper.files.find(
        (x) => x.path === "wrap.info"
      )?.content;
      if (!manifestContent) {
        alert("No wrap.info file found");
        return;
      }

      const manifest = deserializeWrapManifest(manifestContent);
      const abi: any = manifest.abi as any;

      const schema = renderSchema(abi, false);

      setWrapperInfo({
        name: manifest.name,
        abi: abi,
        schema: schema,
        dependencies: abi ? abi.importedModuleTypes.map((x: any) => x.uri) : [],
        methods: abi && abi.moduleType ? abi.moduleType.methods : undefined,
      });
    })();
  }, [wrapper]);

  useEffect(() => {
    if (!(wrapper.files && wrapper.files.length)) {
      return;
    }
    setSelectedTab("Files");
  }, [wrapper.files]);

  const downloadWrapper = async () => {
    if (!wrapper.files.length) {
      return;
    }

    await downloadFilesAsZip(wrapper.files);
  };

  return (
    <div className="LoadedWrapperView widget">
      {wrapper && (
        <div>
          <Tabs
            tabs={["Files", "Methods", "Dependencies", "Schema", "Deployment"]}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          ></Tabs>
          <div
            className={`tab-body ${
              selectedTab === "Schema" ? "code-back padding-0" : "padding-20"
            }`}
          >
            {selectedTab === "Files" && (
              <>
                <div className="">
                  <table className="table" cellSpacing="3" cellPadding="3">
                    <thead>
                      <tr>
                        <th>Path</th>
                        <th>Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wrapper.files &&
                        wrapper.files.map(
                          (file: InMemoryFile, index: number) => (
                            <tr key={index}>
                              <td>
                                <span>{file.path}</span>
                              </td>
                              <td>
                                {file.content && (
                                  <span>
                                    {toPrettyNumber(file.content?.byteLength)}{" "}
                                    bytes
                                  </span>
                                )}
                                {!file.content && <span>Empty</span>}
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                  <div className="download">
                    <button
                      className="btn btn-success"
                      onClick={downloadWrapper}
                    >
                      Download wrapper
                    </button>
                  </div>
                </div>
              </>
            )}
            {selectedTab === "Methods" && wrapperInfo?.methods && (
              <div className="">
                {wrapperInfo.methods.map((x) => (
                  <div className="p-2" key={x.name}>
                    <span>{x.name}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedTab === "Dependencies" && (
              <div className="">
                {wrapperInfo?.dependencies.map((wrapUri: string) => (
                  <div className="clickable p-2" key={wrapUri}>
                    <span
                      onClick={async () => {
                        if (!provider) {
                          return;
                        }

                        if (wrapUri.startsWith("wrap://ens/")) {
                          const domainWithNetwork = wrapUri.slice(
                            "wrap://ens/".length,
                            wrapUri.length
                          );
                          if (domainWithNetwork.includes("/")) {
                            const network = domainWithNetwork.split("/")[0];
                            const domain = domainWithNetwork.split("/")[1];
                          } else {
                            const network = "mainnet";
                            const domain = domainWithNetwork;

                            setPublishedWrapper({
                              ensDomain: {
                                name: domain,
                                chainId: 1,
                              },
                            });
                          }
                        } else if (wrapUri.startsWith("wrap://ipfs/")) {
                          const cid = wrapUri.slice(
                            "wrap://ipfs/".length,
                            wrapUri.length
                          );

                          setPublishedWrapper({
                            cid,
                          });
                        }
                      }}
                    >
                      {wrapUri}
                    </span>
                  </div>
                ))}
                {wrapperInfo &&
                  !(
                    wrapperInfo.dependencies && wrapperInfo.dependencies.length
                  ) && <div className="">No dependencies</div>}
              </div>
            )}
            {selectedTab === "Schema" && wrapperInfo?.schema && (
              <SyntaxHighlighter language="graphql" style={{ ...codeStyle }}>
                {wrapperInfo.schema}
              </SyntaxHighlighter>
            )}
            {selectedTab === "Deployment" && (
              <div>
                <WrapperDeployment
                  wrapper={wrapper}
                  ipfsNode={ipfsNode}
                  setWrapper={setWrapper}
                ></WrapperDeployment>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadedWrapperView;
