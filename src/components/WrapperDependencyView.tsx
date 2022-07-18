import { WrapperInfo } from "../models/WrapperInfo";

import { useEthers } from "@usedapp/core";

const WrapperDependencyView: React.FC<{
  wrapperInfo: WrapperInfo;
}> = ({ wrapperInfo }) => {
  const { library: provider } = useEthers();

  return (
    <div className="WrapperDependencyView widget">
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

                    // TODO: go to wrapper url
                    // setPublishedWrapper({
                    //   ensDomain: {
                    //     name: domain,
                    //     chainId: 1,
                    //   },
                    // });
                  }
                } else if (wrapUri.startsWith("wrap://ipfs/")) {
                  const cid = wrapUri.slice(
                    "wrap://ipfs/".length,
                    wrapUri.length
                  );

                  // TODO: go to wrapper url
                  //   setPublishedWrapper({
                  //   cid,
                  // });
                }
              }}
            >
              {wrapUri}
            </span>
          </div>
        ))}
        {wrapperInfo &&
          !(wrapperInfo.dependencies && wrapperInfo.dependencies.length) && (
            <div className="">No dependencies</div>
          )}
      </div>
    </div>
  );
};

export default WrapperDependencyView;
