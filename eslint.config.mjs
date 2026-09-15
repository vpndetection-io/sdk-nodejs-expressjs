import { lib, typeChecked } from "@mslm/libjs-eslint-config";

export default [
  { ignores: ["dist/**", "node_modules/**", "spec/**", "integration/**", "src/generated/**", "**/*.gen.ts"] },
  ...lib,
  typeChecked(import.meta.dirname),
  {
    // Declaration merging onto Express.Request needs a namespace; an ES module cannot do it.
    files: ["src/index.ts"],
    rules: { "@typescript-eslint/no-namespace": "off" },
  },
];
