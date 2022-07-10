import App from "./App";

import {
  Config,
  DAppProvider,
  Mainnet,
  Rinkeby,
  Ropsten,
  Polygon,
  Localhost,
} from "@usedapp/core";
import "react-app-polyfill/stable";
import "react-app-polyfill/ie11";
import "core-js/features/array/find";
import "core-js/features/array/includes";
import "core-js/features/number/is-nan";
import type { NextPage } from "next";

const usedappConfig: Config = {
  autoConnect: true,
  networks: [Mainnet, Rinkeby, Ropsten, Polygon, Localhost],
  multicallAddresses: {
    [Localhost.chainId]: "0x0000000000000000000000000000000000000000",
  },
};

const Home: NextPage = () => {
  return (
    <>
      <DAppProvider config={usedappConfig}>
        <App />
      </DAppProvider>
    </>
  );
};

export default Home;
