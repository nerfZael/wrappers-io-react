import { encodeFiles, InMemoryFile } from "@nerfzael/encoding";
import { OcrId } from "@nerfzael/ocr-core";
import { Signer } from "ethers";
import { OCR_BYTES_FOR_FILE_PATH, OCR_BYTES_FOR_FILE_SIZE } from "./constants";
import { publishDataToOcr } from "./publishDataToOcr";

export const publishFilesToOcr = async (files: InMemoryFile[], chainId: number, protocolVersion: number, contractAddress: string, signer: Signer): Promise<OcrId> => {
  const data = encodeFiles(files, OCR_BYTES_FOR_FILE_PATH, OCR_BYTES_FOR_FILE_SIZE);

  const ocrId = await publishDataToOcr(data, chainId, protocolVersion, contractAddress, signer);
  
  return ocrId;
};

