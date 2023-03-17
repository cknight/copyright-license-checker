// Copyright 2023 Chris Knight. All rights reserved. MIT license.
import { Options, updateCopyrightHeaders } from "./mod.ts";

if (Deno.args.length !== 1) {
  console.error("No configuration file specified");
  console.log(
    "Usage: deno run --allow-read=. --allow-write=. updater.ts config.json",
  );
  Deno.exit(1);
}

const config = Deno.readTextFileSync(Deno.args[0]);
const options = JSON.parse(config) as Options;

await updateCopyrightHeaders(options);
