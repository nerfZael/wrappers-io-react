import { OcrId } from "@nerfzael/ocr-core";
import { BigNumber, Signer } from "ethers";
import { OcrContract } from "./OcrContract";

const MAX_OCR_PACKAGE_SIZE = 1_000_000;

export const ocrContractAddresses: Record<string, string> = {
  "1": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
};

export const publishDataToOcr = async (
  data: Uint8Array, 
  chainId: number, 
  protocolVersion: number, 
  contractAddress: string, 
  signer: Signer
): Promise<OcrId> => {
  const repository = OcrContract.create(contractAddress, signer);

  const partCount = Math.floor(data.byteLength / MAX_OCR_PACKAGE_SIZE) + 1;
  let packageId: BigNumber = BigNumber.from(0);
  for(let i = 0; i < partCount; i++) {
    const part = data.slice(i * MAX_OCR_PACKAGE_SIZE, (i + 1) * MAX_OCR_PACKAGE_SIZE);
    if(i === 0) {
      const tx = await repository.startPublish(part, partCount === 1);
      const receipt = await tx.wait();
      const event = receipt.events ? receipt.events[0] : undefined;
      console.log(event);
      packageId = event?.args?.packageId;
      console.log(packageId);
    } else {
      await repository.publishPart(packageId, part, i === partCount - 1);
    }
  }

  const packageInfo = await repository.package(packageId);

  return {
    chainId,
    protocolVersion,
    contractAddress,
    packageIndex: packageId.toNumber(),
    startBlock: packageInfo.startBlock.toNumber(),
    endBlock: packageInfo.endBlock.toNumber(),
  };
};

