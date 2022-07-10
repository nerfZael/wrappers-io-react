import { Localhost, Polygon } from "@usedapp/core";

export const PROVIDERS = {
  [Polygon.chainId]: "https://polygon-rpc.com",
  [Localhost.chainId]: "http://localhost:8545",
};
