import Tabs from "./shared/Tabs";
import { downloadFilesAsZip } from "../utils/downloadFilesAsZip";
import { LoadedWrapper } from "../models/LoadedWrapper";
import { WrapperInfo } from "../models/WrapperInfo";
import { toPrettyNumber } from "../utils/toPrettyNumber";
import WrapperDeployment from "./WrapperDeployment";
import { PublishedWrapper } from "../models/PublishedWrapper";

import { IPFSHTTPClient } from "ipfs-http-client";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useEthers } from "@usedapp/core";
import { renderSchema } from "@polywrap/schema-compose";
import { InMemoryFile } from "@nerfzael/encoding";
import { useEffect, useState } from "react";
import { deserializeWrapManifest } from "@polywrap/wrap-manifest-types-js";
import WrapperDependencyView from "./WrapperDependencyView";

const LoadedWrapperView: React.FC<{
  wrapper: LoadedWrapper;
  setWrapper: (wrapper: LoadedWrapper) => void;
  ipfsNode: IPFSHTTPClient;
  setLoadedWrapperInfo: (wrapperInfo: WrapperInfo) => void;
}> = ({ wrapper, ipfsNode, setWrapper, setLoadedWrapperInfo }) => {
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
              <>
                {wrapperInfo && (
                  <WrapperDependencyView
                    wrapperInfo={wrapperInfo}
                  ></WrapperDependencyView>
                )}
              </>
            )}
            {selectedTab === "Schema" && wrapperInfo?.schema && (
              <SyntaxHighlighter language="graphql" style={{ ...codeStyle }}>
                {wrapperInfo.schema}
              </SyntaxHighlighter>
            )}
            {selectedTab === "Deployment" && (
              <WrapperDeployment
                wrapper={wrapper}
                ipfsNode={ipfsNode}
                setWrapper={setWrapper}
              ></WrapperDeployment>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadedWrapperView;
