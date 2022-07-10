import './LoadWrapper.scss';
import { useEffect, useState } from 'react';
import { InMemoryFile } from '@nerfzael/encoding';
import { getCidFromContenthash } from '../../utils/getCidFromContenthash';
import { useCall, useEthers } from '@usedapp/core';
import { stripBasePath } from '../../utils/stripBasePath';
import { useDropzone } from 'react-dropzone';
import { isCID } from '../../utils/isCID';
import { loadFilesFromIpfs } from '../../utils/loadFilesFromIpfs';
import { IPFSHTTPClient } from 'ipfs-http-client';
import { LoadedWrapper } from '../../models/LoadedWrapper';
import { EnsDomain } from '../../models/EnsDomain';
import { Network } from '../../utils/Network';
import { decodeOcrIdFromContenthash, OcrId } from '@nerfzael/ocr-core';
import OcrIdLoader from '../ocr-id-loader/OcrIdLoader';
import { getFilesByOcrId } from '../../utils/ocr/getFilesByOcrId';
import { EnsRegistryContract } from '../../utils/ens/EnsRegistryContract';
import { EnsResolverContract } from '../../utils/ens/EnsResolverContract';
import { arrayify, namehash } from 'ethers/lib/utils';
import { ENS_CONTRACT_ADDRESSES } from '../../utils/ens/constants';
import { ethers } from 'ethers';
import { WNS_CONTRACT_ADDRESSES } from '../../utils/wns/constants';
import { getProvider } from '../../utils/getProvider';
import { PublishedWrapper } from '../../models/PublishedWrapper';

const readFile = (file: File): Promise<InMemoryFile> => {
  return new Promise<InMemoryFile>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e: any) => { 
      const text = (e.target.result)

      resolve({
        path: (file as any)["path"],
        content: text,
      } as InMemoryFile);
    };

    reader.readAsArrayBuffer(file)
  });
};

const LoadWrapper: React.FC<{
  publishedWrapper?: PublishedWrapper,
  ipfsNode: IPFSHTTPClient,
  setLoadedWrapper: (wrapper: LoadedWrapper | undefined) => void,
}> = ({ publishedWrapper, ipfsNode, setLoadedWrapper }) => {
  const { library: provider, chainId } = useEthers();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<"fs" | "ipfs" | "ens" | "wns" | "ocr" | undefined>();
  const { acceptedFiles, getRootProps, getInputProps, isDragAccept } = useDropzone();
  const [files, setFiles] = useState<InMemoryFile[]>([]);
  const [cid, setCID] = useState<string | undefined>();
  const [ensDomain, setEnsDomain] = useState<EnsDomain | undefined>();
  const [wnsDomain, setWnsDomain] = useState<EnsDomain | undefined>();
  const [ocrId, setOcrId] = useState<OcrId>();
  const [hasLoadedWrapper, setHasLoadedWrapper] = useState<boolean>(false);

  useEffect(() => {
    if(publishedWrapper) {
      setLoadedWrapper(undefined);
      setFiles([]);
      setCID(undefined);
      setEnsDomain(undefined);
      setWnsDomain(undefined);
      setOcrId(undefined);

      if (publishedWrapper.cid) {
        setCID(publishedWrapper.cid)
      } else if (publishedWrapper.ensDomain) {
        setEnsDomain(publishedWrapper.ensDomain)
      } else if (publishedWrapper.wnsDomain) {
        setWnsDomain(publishedWrapper.wnsDomain)
      } else if (publishedWrapper.ocrId) {
        setOcrId(publishedWrapper.ocrId)
      } 
    }
  }, [publishedWrapper, setLoadedWrapper]);

  useEffect(() => {
    (async () => {
      if(acceptedFiles && acceptedFiles.length) {
        const result = await Promise.all(
          acceptedFiles.map(async x => {
            return await readFile(x);
          })
        );

        setFiles(stripBasePath(result));
  
        setShowUpload(false);
        setUploadType(undefined);
      }
    })();
  }, [acceptedFiles, setLoadedWrapper]);

  useEffect(() => {
    if(cid && !(files && files.length)) {
      (async () => {
        const ipfsFiles = await loadFilesFromIpfs(cid, ipfsNode);

        if(ipfsFiles) {
          setFiles(ipfsFiles);
        }
      })();
    }
  }, [cid, files, ipfsNode]);

  useEffect(() => {
    if(files && files.length) {
      console.log("setLoadedWrapper", {
        cid,
        ensDomain,
        ocrId,
      });
      setLoadedWrapper({
        cid,
        ensDomain,
        ocrId,
        files,
      });
      setHasLoadedWrapper(true);
    }
  }, [files, cid, ensDomain, ocrId, setLoadedWrapper]);

  useEffect(() => {
    (async () => {
      if(!provider || !chainId || !ensDomain || !ensDomain.name.endsWith(".eth")) {
        return;
      }

      const registry = EnsRegistryContract.create(ENS_CONTRACT_ADDRESSES[chainId].registry, provider);

      const resolverAddress = await registry.resolver(namehash(ensDomain.name));
      if(resolverAddress && resolverAddress !== ethers.constants.AddressZero) {
        const resolver = EnsResolverContract.create(resolverAddress, provider);
      
        const contenthash = await resolver.contenthash(namehash(ensDomain.name));
        const savedCid = getCidFromContenthash(contenthash);
      
        if(savedCid) {
          setCID(savedCid);
        } else {
          const savedOcrId = decodeOcrIdFromContenthash(arrayify(contenthash));
          if(savedOcrId) {
            setOcrId(savedOcrId);
          }
        }
      }
    })();
  }, [chainId, provider, ensDomain]);

  useEffect(() => {
    (async () => {
      if(!provider || !chainId || !wnsDomain || !wnsDomain.name.endsWith(".wrap")) {
        return;
      }

      const registry = EnsRegistryContract.create(WNS_CONTRACT_ADDRESSES[chainId].registry, provider);

      const resolverAddress = await registry.resolver(namehash(wnsDomain.name));
      if(resolverAddress && resolverAddress !== ethers.constants.AddressZero) {
        const resolver = EnsResolverContract.create(resolverAddress, provider);
      
        const contenthash = await resolver.contenthash(namehash(wnsDomain.name));
        const savedCid = getCidFromContenthash(contenthash);
      
        if(savedCid) {
          setCID(savedCid);
        } else {
          console.log(arrayify(contenthash));
          const savedOcrId = decodeOcrIdFromContenthash(arrayify(contenthash));
          if(savedOcrId) {
            setOcrId(savedOcrId);
          }
        }
      }
    })();
  }, [chainId, provider, wnsDomain]);

  useEffect(() => {
    (async () => {
      if(provider && ocrId && chainId) {
        
        let packageFiles: InMemoryFile[];

        const readOnlyProvider = getProvider(ocrId.chainId, chainId, provider);

        if(!readOnlyProvider) {
          return;
        }

        packageFiles = await getFilesByOcrId(ocrId, readOnlyProvider);

        setFiles(packageFiles);
      }
    })();
  }, [chainId, provider, ocrId]);

  const dropHover = isDragAccept ? ' drop-hover' : '';
 
  return (
    <>
    {
      hasLoadedWrapper && (
        <></>
      )
    }
    {
      !hasLoadedWrapper && (
        <div className="LoadWrapper">
          {
            showUpload && !uploadType && (
              <select className="form-control" onChange={e => setUploadType(e.target.value as any)}>
                <option value="">None</option>
                <option value="fs">File system</option>
                <option value="ipfs">IPFS</option>
                <option value="ens">ENS</option>
                <option value="wns">WNS</option>
                <option value="ocr">OCR</option>
              </select>
            )
          }
          {
            showUpload && uploadType && (
              <div className="registry-section">
                {
                  uploadType === "fs" && (
                    <div {...getRootProps({ className: `dropzone drag-area${dropHover}` })}>
                      <input {...getInputProps()} />
                      {
                        !files || !files.length 
                          ? (<p>Drag 'n' drop some files here, or click to select files</p>)
                          : (<></>)
                      }
                    </div>
                  )
                }
                {
                  uploadType === "ipfs" && (
                    <input className="form-control" placeholder="IPFS CID..." type="text" onChange={e => {
                      if(isCID(e.target.value)) {
                        setCID(e.target.value);
                      } else {
                        setCID(undefined);
                      }
                    }}/>
                  )
                }
                {
                  uploadType === "ens" && chainId && (
                    <input className="form-control" placeholder={`ENS domain (${Network.fromChainId(chainId as number).name})...`} type="text" onChange={e => {
                      if(e.target.value && e.target.value.endsWith(".eth")) {
                        setEnsDomain({
                          name: e.target.value,
                          chainId
                        });
                      } else {
                        setEnsDomain(undefined);
                      }
                    }}/>
                  )
                }
                {
                  uploadType === "wns" && chainId && (
                    <input className="form-control" placeholder="WNS domain..." type="text" onChange={e => {
                      if(e.target.value && e.target.value.endsWith(".wrap")) {
                        setWnsDomain({
                          name: e.target.value,
                          chainId
                        });
                      } else {
                        setWnsDomain(undefined);
                      }
                    }}/>
                  )
                }
                {
                  uploadType === "ocr" && (
                    <OcrIdLoader setOcrId={setOcrId}></OcrIdLoader>
                  )
                }
              </div>
            )
          }
          <div className="registry-section">
            {
              !showUpload && (
                <button className="btn btn-success" onClick={async (e) =>{
                    setShowUpload(true)
                  }
                  }>Load wrapper
                </button>
              )
            }
          </div>
        </div>
      )
    }
    </>
  );
};

export default LoadWrapper;
