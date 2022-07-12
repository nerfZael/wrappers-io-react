export class Network {
  constructor(public readonly name: string, public readonly chainId: number) {}

  static fromChainId(chainId: number | undefined): Network {
    switch (chainId) {
      case 1:
        return new Network("mainnet", chainId);
      case 3:
        return new Network("ropsten", chainId);
      case 4:
        return new Network("rinkeby", chainId);
      case 5:
        return new Network("goerli", chainId);
      case 137:
        return new Network("polygon", chainId);
      case 1337:
        return new Network("localhost", chainId);
      default:
        return new Network("unkown", 0);
    }
  }

  static fromNetworkName(name: string | undefined): Network {
    switch (name) {
      case "mainnet":
        return new Network(name, 1);
      case "ropsten":
        return new Network("ropsten", 3);
      case "rinkeby":
        return new Network("rinkeby", 4);
      case "goerli":
        return new Network("goerli", 5);
      case "polygon":
        return new Network("polygon", 137);
      case "localhost":
        return new Network("localhost", 1337);
      default:
        return new Network("unkown", 0);
    }
  }
}
