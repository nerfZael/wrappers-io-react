import JSZip from "jszip";
import FileSaver from "file-saver";
import { InMemoryFile } from "@nerfzael/encoding";

export const downloadFilesAsZip = async (
  files: InMemoryFile[]
): Promise<void> => {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content as ArrayBuffer);
  }

  await zip.generateAsync({ type: "blob" }).then((content: Blob) => {
    FileSaver.saveAs(content, "wrapper.zip");
  });
};
