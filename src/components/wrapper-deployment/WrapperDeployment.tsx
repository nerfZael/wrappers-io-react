import PublishToIpfs from "../publish/publish-to-ipfs/PublishToIpfs";
import PublishToEns from "../publish/publish-to-ens/PublishToEns";
import PublishToWns from "../publish/publish-to-wns/PublishToWns";
import PublishToOcr from "../publish/publish-to-ocr/PublishToOcr";
import { LoadedWrapper } from "../../models/LoadedWrapper";

import { IPFSHTTPClient } from "ipfs-http-client";

const WrapperDeployment: React.FC<{
  wrapper: LoadedWrapper;
  ipfsNode: IPFSHTTPClient;
  setWrapper: (wrapper: LoadedWrapper) => void;
}> = ({ wrapper, ipfsNode, setWrapper }) => {
  return (
    <div>
      {wrapper && (
        <>
          <PublishToIpfs
            wrapper={wrapper}
            setWrapper={setWrapper}
            ipfsNode={ipfsNode}
          ></PublishToIpfs>
          <PublishToEns
            wrapper={wrapper}
            setWrapper={setWrapper}
          ></PublishToEns>
          {/* <PublishToWns
            wrapper={wrapper}
            setWrapper={setWrapper}
          ></PublishToWns>
          <PublishToOcr
            wrapper={wrapper}
            setWrapper={setWrapper}
          ></PublishToOcr> */}
        </>
      )}
    </div>
  );
};

export default WrapperDeployment;
