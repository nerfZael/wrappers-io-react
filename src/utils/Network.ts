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
      case 137:
        return new Network("polygon", chainId);
      case 1337:
        return new Network("localhost", chainId);
      default:
        return new Network("unkown", 0);
    }
  }
}
