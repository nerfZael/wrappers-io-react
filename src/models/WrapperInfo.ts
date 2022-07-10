import { Abi, MethodDefinition } from "@polywrap/schema-parse";

export type WrapperInfo = {
  name: string;
  abi?: Abi;
  schema?: string;
  dependencies: string[];
  methods: MethodDefinition[] | undefined;
};
