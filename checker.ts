// Copyright 2023 Chris Knight. All rights reserved. MIT license.
import { checkCopyrightHeaders, Options } from "./mod.ts";

if (Deno.args.length !== 1) {
  console.error("No configuration file specified");
  console.log("Usage: deno run --allow-read=. checker.ts config.json");
  Deno.exit(1);
}

const config = Deno.readTextFileSync(Deno.args[0]);
const options = JSON.parse(config) as Options;

await checkCopyrightHeaders(options);
