import {
  Goerli,
  Localhost,
  Mainnet,
  Polygon,
  Rinkeby,
  Ropsten,
} from "@usedapp/core";

export const PROVIDERS = {
  [Mainnet.chainId]:
    "https://mainnet.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
  [Rinkeby.chainId]:
    "https://rinkeby.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
  [Ropsten.chainId]:
    "https://ropsten.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
  [Goerli.chainId]:
    "https://goerli.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
  [Polygon.chainId]: "https://polygon-rpc.com",
  [Localhost.chainId]: "http://localhost:8545",
};
