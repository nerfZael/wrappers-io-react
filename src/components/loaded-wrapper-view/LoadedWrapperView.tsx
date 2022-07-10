import './LoadedWrapperView.scss';
import { useEffect, useState } from 'react';
import { InMemoryFile } from '@nerfzael/encoding';
import { parseSchema, Abi } from "@polywrap/schema-parse";
import Tabs from "../tabs/Tabs";
import { getCIDFromEnsDomain } from '../../utils/getCIDFromEnsDomain';
import { downloadFilesAsZip } from '../../utils/downloadFilesAsZip';
import { useEthers } from '@usedapp/core';
import { LoadedWrapper } from '../../models/LoadedWrapper';
import { WrapperInfo } from '../../models/WrapperInfo';
import { toPrettyNumber } from '../../utils/toPrettyNumber';
import { escapeHTML } from '../../utils/escapeHTML';
import { IPFSHTTPClient } from 'ipfs-http-client';
import WrapperDeployment from '../wrapper-deployment/WrapperDeployment';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark as codeStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { PublishedWrapper } from '../../models/PublishedWrapper';

const LoadedWrapperView: React.FC<{
  wrapper: LoadedWrapper,
  setWrapper: (wrapper: LoadedWrapper) => void
  ipfsNode: IPFSHTTPClient,
  setLoadedWrapperInfo: (wrapperInfo: WrapperInfo) => void
  setPublishedWrapper: (publishedWrapper: PublishedWrapper) => void
}> = ({ wrapper, ipfsNode, setWrapper, setLoadedWrapperInfo, setPublishedWrapper}) => {
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
      const manifestContent = wrapper.files.find(x => x.path === "wrap.info")?.content;
      if(!manifestContent) {
        alert("No wrap.info file found");
        return;
      }
      // const manifest: WrapManifest = deserializeWrapManifest(manifestContent);
      // let parsedAbi: Abi | undefined = manifest.abi as unknown as Abi;

      const schemaContent = wrapper.files.find(x => x.path === "schema.graphql")?.content;
      let schema: string | undefined;
      let parsedAbi: Abi | undefined;
      if(schemaContent) {
        schema = new TextDecoder().decode(schemaContent);
        parsedAbi = parseSchema(schema);
      }

      setWrapperInfo({
        name: "wrapper",
        abi: parsedAbi,
        schema: schema 
          ? escapeHTML(schema)
          :undefined,
        dependencies: parsedAbi 
          ? parsedAbi.importedModuleTypes.map(x => x.uri)
          : [],
        methods: parsedAbi && parsedAbi.moduleType 
          ? parsedAbi.moduleType.methods
          : undefined
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
    if(!(wrapper.files.length)) {
      return;
    }

    await downloadFilesAsZip(wrapper.files);
  };

  return (
    <div className="LoadedWrapperView widget">
    {
      wrapper && (
        <div>
          <Tabs tabs={["Files", "Methods", "Dependencies", "Schema", "Deployment"]} selectedTab={selectedTab} setSelectedTab={setSelectedTab}></Tabs>
          <div className="tab-body">
          {
            selectedTab === "Files" && (
              <>
              <table className="table" cellSpacing="3" cellPadding="3">
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Size</th>
                  </tr>
                </thead>
                <tbody>
                {
                  wrapper.files && wrapper.files.map((file: InMemoryFile, index: number) => (
                      <tr key={index} onClick={() => {}}>
                        <td>
                            <span>{file.path}</span>
                        </td>
                        <td>
                          {
                            file.content && (
                              <span>{toPrettyNumber(file.content?.byteLength)} bytes</span>
                            )
                          }
                          {
                            !file.content && (
                              <span>Empty</span>
                            )
                          }
                        </td>
                      </tr>
                    ))
                }
                </tbody>
              </table>
                <div className="download">
                  <button className="btn btn-success" onClick={downloadWrapper}>Download wrapper
                  </button>
                </div>
              </>
            )
          }
          {
            selectedTab === "Methods" && wrapperInfo?.methods && (
              <div>
                {
                  wrapperInfo.methods.map(x => (
                    <div key={x.name}>
                      <span>{x.name}</span>
                    </div>
                  ))
                }
              </div>  
            )
          }
          {
            selectedTab === "Dependencies" && (
              <div>
                {
                  wrapperInfo?.dependencies.map((wrapUri: string) => (
                    <div key={wrapUri}>
                      <span onClick={async () => {
                        if(!provider) {
                          return;
                        }
                        
                        if (wrapUri.startsWith("wrap://ens/")) {
                          const domainWithNetwork = wrapUri.slice("wrap://ens/".length, wrapUri.length);
                          if (domainWithNetwork.includes("/")) {
                            const network = domainWithNetwork.split("/")[0];
                            const domain = domainWithNetwork.split("/")[1];
                          } else {
                            const network = "mainnet";
                            const domain = domainWithNetwork;

                            setPublishedWrapper({
                              ensDomain: {
                                name: domain,
                                chainId: 1
                              }
                            });
                          }
                        }
                      }}>{wrapUri}</span>
                    </div>
                  ))
                }
                {
                  wrapperInfo && !(wrapperInfo.dependencies && wrapperInfo.dependencies.length) && (
                    <div>
                      No dependencies
                    </div>  
                  )
                }
              </div>  
            )
          }
          {
            selectedTab === "Schema" && (
              <div>
              {
                wrapperInfo?.schema && (
                  <SyntaxHighlighter language="graphql" style={codeStyle}>
                    {wrapperInfo.schema}
                  </SyntaxHighlighter>
                )
              }
              </div>  
            )
          }
          {
            selectedTab === "Deployment" && (
              <div>
                <WrapperDeployment wrapper={wrapper} ipfsNode={ipfsNode} setWrapper={setWrapper}></WrapperDeployment>
              </div>  
            )
          }
          </div>
        </div>
      )
    }
    </div>
  );
};

export default LoadedWrapperView;
