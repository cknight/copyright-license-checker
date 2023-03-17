import { Options, updateCopyrightHeaders } from "./mod.ts";

const options: Options = {
  extensions: [".ts"],
  exclusions: ["headerUpdater.ts"],
  headerText:
    `// Copyright {TIMEFRAME} Chris Knight. All rights reserved. MIT license.`,
  rootDir: ".",
  firstYear: 2023,
  quiet: false,
};

await updateCopyrightHeaders(options);
