import {
  Options,
  updateCopyrightHeaders,
} from "https://deno.land/x/copyright_license_checker@1.0.1/mod.ts";

const options: Options = {
  extensions: [".ts"],
  exclusions: ["**/headerUpdater.ts"],
  headerText:
    `// Copyright {TIMEFRAME} Chris Knight. All rights reserved. MIT license.`,
  rootDir: ".",
  firstYear: 2023,
  quiet: false,
};

await updateCopyrightHeaders(options);
