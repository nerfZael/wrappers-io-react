import { useEffect, useState } from 'react';
import { Rinkeby, useEthers, Localhost, Polygon } from '@usedapp/core';
import { LoadedWrapper } from '../../../models/LoadedWrapper';
import { publishFilesToOcr } from '../../../utils/ocr/publishFilesToOcr';
import { ethers } from 'ethers';
import { OcrContract } from '../../../utils/ocr/OcrContract';
import { Network } from '../../../utils/Network';
import { OCR_CONTRACT_ADDRESSES } from '../../../utils/ocr/constants';

const getCanOcrPublish = (chainId: number | undefined, wrapper: LoadedWrapper): boolean => {
  if (!chainId) {
    return false;
  }

  let hasOcrRepo = !!OCR_CONTRACT_ADDRESSES[chainId.toString()];

  return hasOcrRepo && (!!wrapper.cid || (wrapper.files && !!wrapper.files.length));
};

const PublishToOcr: React.FC<{
  wrapper: LoadedWrapper, 
  setWrapper: (wrapper: LoadedWrapper) => void, 
}> = ({ wrapper, setWrapper }) => {
  const { library: provider, chainId } = useEthers();
  const [canOcrPublish, setCanOcrPublish] = useState(false);
  const [protocolVersion, setProtocolVersion] = useState<number | undefined>();
  const [contractAddress, setContractAddress] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();
  const [shouldShowType, setShouldShowType] = useState(false);

  useEffect(() => {
    setCanOcrPublish(getCanOcrPublish(chainId, wrapper));
  }, [chainId, wrapper]);

  useEffect(() => {
    if(!chainId || !type || type !== "latest") {
      return;
    }

    if(OCR_CONTRACT_ADDRESSES[chainId.toString()] && OCR_CONTRACT_ADDRESSES[chainId.toString()]["1"]) {
      setContractAddress(OCR_CONTRACT_ADDRESSES[chainId.toString()]["1"]);
    } else {
      setContractAddress(undefined);
    }
  }, [chainId, type]);

  useEffect(() => {
    (async () => {
      if(provider && chainId && contractAddress &&
         ethers.utils.isAddress(contractAddress)
      ) {
        const contract = OcrContract.create(contractAddress, provider);
        const version = await contract.PROTOCOL_VERSION();

        setProtocolVersion(version.toNumber());
      } else {
        setProtocolVersion(undefined);
      }
    })();
  }, [provider, chainId, contractAddress]);

  const onPublishToOCR = async () => {
    if(!wrapper.files || !wrapper.files.length || !provider || !chainId || !protocolVersion || !contractAddress) {
      return;
    }

    const ocrId = await publishFilesToOcr(
      wrapper.files, 
      chainId,
      protocolVersion,
      contractAddress,
      provider.getSigner()
    );

    if(!ocrId) {
      return;
    }

    setWrapper({
      ...wrapper,
      ocrId
    });
  };

  return (
    <div className="PublishToOCR">
      <div className="registry-section ocr">
        {
          !wrapper.ocrId && (
            <>
            {
              !shouldShowType && (
                <button className="btn btn-success" disabled={!canOcrPublish} onClick={() => { setShouldShowType(true) }}>
                  Publish to OCR
                </button>
              )
            }
            {
              shouldShowType && (
                <>
                  {
                    !wrapper.ocrId && (
                      <>
                      {
                        !type && (
                          <div>
                            <button className="btn btn-success" onClick={() => { setType("latest") }}>
                              Latest
                            </button>
                            <button className="btn btn-success" onClick={() => { setType("custom") }}>
                              Custom
                            </button>
                          </div> 
                        )
                      }
                      {
                        type && (type === 'custom' || (contractAddress && protocolVersion)) && (
                          <div>
                            <input 
                              className="form-control" 
                              placeholder="Contract address..." 
                              type="text"
                              value={contractAddress}
                              onChange={e => setContractAddress(e.target.value)} />
                            <button className="btn btn-success" onClick={onPublishToOCR} disabled={!protocolVersion}>
                              Publish to OCR on {Network.fromChainId(chainId).name}
                            </button>
                          </div>
                        )
                      }
                      </>
                    )
                  }
                </>
              )
            }
            </>
          )
        }
        {
          wrapper.ocrId && (
            <div className="inner-widget">
              <div className="head success-back">
                <span>OCR</span>
              </div>
              <div className="body">
                <div>
                  <span>ChainId: {wrapper.ocrId.chainId} ({Network.fromChainId(wrapper.ocrId.chainId).name})</span>
                </div>
                <div>
                  <span>Protocol version: {wrapper.ocrId.protocolVersion}</span>
                </div>
                <div>
                  <span>Contract: {wrapper.ocrId.contractAddress}</span>
                </div>
                <div>
                  <span>Package index: {wrapper.ocrId.packageIndex}</span>
                </div>
                <div>
                  <span>Start block: {wrapper.ocrId.startBlock}</span>
                </div>
                <div>
                  <span>End block: {wrapper.ocrId.endBlock}</span>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default PublishToOcr;
