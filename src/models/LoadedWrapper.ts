import { PublishedWrapper } from "./PublishedWrapper";

import { InMemoryFile } from "@nerfzael/encoding";

export type LoadedWrapper = {
  files: InMemoryFile[];
} & PublishedWrapper;
