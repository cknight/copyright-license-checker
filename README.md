![ci](https://github.com/cknight/copyright-checker/workflows/ci/badge.svg)

# copyright-license-checker

A Deno based utility to check and/or update the copyright/license file headers
of source code files.

## What is a copyright and license header?

A copyright and license header is typically found at the top of each source file
in a project. It might look like this:

```ts
// Copyright 2019-2023 The Company authors. All rights reserved. MIT license.
```

where `The Company` is either the organisation (or individual) owning the code.

## Why do you need a copyright and license header in your source files?

Including a copyright and license header in source files is important for a
number of reasons:

- Protecting intellectual property rights: The copyright header serves as a
  notice that the source code is protected by copyright law. It informs others
  viewing individual files that they cannot use or distribute the code except
  under the terms of the license.

- Clarifying the terms of use: Users can see the license for that source file
  and understand the terms under which the code may be used, modified, and
  distributed.

- Establishing ownership and origin: The copyright and license headers identify
  the author or organization that created the code and the date it was created.
  This can be important for establishing ownership and tracking the history of
  the code, for example if the source code file is copied to another project.

- Meeting legal requirements: Many software licenses require that the copyright
  and license information be included in each source file.

## Usage

This project offers two command line utilities, `checker.ts` and `updater.ts`.
These take a single argument, an options JSON file.

### Options

This is a JSON file which looks like this:

```json
{
  "extensions": [
    ".ts",
    ".js"
  ],
  "exclusions": [
    "node_modules",
    "dist",
    "**/testdata"
  ],
  "headerText": "// Copyright {TIMEFRAME} The Company authors. All rights reserved. MIT license.",
  "rootDir": ".",
  "firstYear": 2019,
  "quiet": false
}
```

The `firstYear` element is optional.

With regards to dynamic timeframes in your header, you specify in the header
text a `{TIMEFRAME}` token placeholder. This token will be replaced with the
timespan of first year to current year (e.g. "2019-2023") OR just the current
year (e.g. "2023") if the first year is either left out of the options or is the
same as the current year.

### Checking files have up to date copyright and license header

You can check your files via the following:

```shell
deno run --allow-read=. jsr:@cknight/copyright-checker/checker options.json
```

### Implementing a header check in your CI pipeline

The simplest way to implement a copyright/license header check in your CI
pipeline to ensure all necessary files have a copyright/license header which is
also up to date is to add a test in your project. An example test would be:

```ts
import { assert } from "jsr:@std/assert@0.215";
import {
  checkCopyrightHeaders,
  Options,
} from "jsr:@cknight/copyright_checker@1";

// Run with allow write and allow read permissions on the relevant directories
// e.g. deno test --allow-read=.
Deno.test({
  name: "Copyright and license headers are present and up to date",
  async fn() {
    const options: Options = {
      extensions: [".ts", ".tsx"],
      exclusions: ["testdata", "node_modules"],
      headerText:
        `// Copyright {TIMEFRAME} the Org authors. All rights reserved. MIT license.`,
      rootDir: ".",
      firstYear: 2019,
      quiet: false,
    };
    assert(await checkCopyrightHeaders(options));
  },
});
```

### Updating files to have the latest copyright and license header

To update the headers you can run the following:

```shell
deno run --allow-write=. --allow-read=. jsr:@cknight/copyright-checker/updater options.json
```
