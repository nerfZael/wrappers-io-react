import { WrapperInfo } from "../models/WrapperInfo";

import Link from "next/link";

const getDependencyUrl = (wrapUri: string): string => {
  if (wrapUri.startsWith("ens/")) {
    const domainWithNetwork = wrapUri.slice("ens/".length, wrapUri.length);
    if (domainWithNetwork.includes("/")) {
      const network = domainWithNetwork.split("/")[0];
      const domain = domainWithNetwork.split("/")[1];

      return `/wrapper/ens/${network}/${domain}`;
    } else {
      const network = "mainnet";
      const domain = domainWithNetwork;

      return `/wrapper/ens/${network}/${domain}`;
    }
  } else if (wrapUri.startsWith("ipfs/")) {
    const cid = wrapUri.slice("ipfs/".length, wrapUri.length);

    return `wrapper/ipfs/${cid}`;
  }

  return "";
};

const WrapperDependencyView: React.FC<{
  wrapperInfo: WrapperInfo;
}> = ({ wrapperInfo }) => {
  return (
    <div className="WrapperDependencyView widget">
      <div className="">
        {wrapperInfo?.dependencies.map((wrapUri: string) => (
          <Link href={getDependencyUrl(wrapUri)} key={wrapUri}>
            <span className="clickable p-2" key={wrapUri}>
              {wrapUri}
            </span>
          </Link>
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
