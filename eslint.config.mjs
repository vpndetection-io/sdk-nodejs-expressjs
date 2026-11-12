import { lib, typeChecked } from "@mslmio/eslint-config";

export default [
  { ignores: ["dist/**", "node_modules/**", "spec/**", "integration/**", "src/generated/**", "**/*.gen.ts"] },
  ...lib,
  typeChecked(import.meta.dirname),
  {
    // Declaration merging onto Express.Request needs a namespace; an ES module cannot do it.
    files: ["src/index.ts"],
    rules: { "@typescript-eslint/no-namespace": "off" },
  },
  {
    // The README's apiKey: process.env pattern is what a test proves; the suite is not the library.
    files: ["test/**"],
    rules: { "mslmio/no-lib-process-env": "off" },
  },
];
