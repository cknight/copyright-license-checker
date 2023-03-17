![ci](https://github.com/cknight/copyright-checker/workflows/ci/badge.svg)

# copyright-checker

A Deno based utility to check and/or update the copyright/license file headers
of source code files.

## What is a copyright and license header?

A copyright and license header is typically found at the top of a source file.
It might look like this:

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

The primary use case of this module is as a test within your code's test suite
to check for compliance with the projects copyright and license header. Thus
every time your test suite runs, it will check the compliance of the copyright
and license header.

### Options

This is configurable with an `Options` input as follows:

```ts
export type Options = {
  /* file extensions to check. E.g. [".ts", ".js"] */
  extensions: string[];
  /* glob patterns of files or directories to exclude. E.g. ["some/path/*_test.ts"] */
  exclusions?: string[];
  /* the first year of the copyright. If not provided, only the current year will be used. */
  firstYear?: number;
  /* the copyright and license header text. The string "{TIMEFRAME}" will be replaced with the current year, or the first year (if specified) and the current year (e.g. 2019-2023). */
  headerText: string;
  /* the root directory to carry out the check. */
  rootDir: string;
  /* if true, no output will be printed to the console. */
  quiet?: boolean;
};
```

With regards to dynamic timeframes in your header, you specify in the header
text a `{TIMEFRAME}` token placeholder. This token will be replaced with the
timespan first year to current year (e.g. 2019-2023) OR just the current year
(e.g. 2023) if the first year is either left out of the options or is the same
as the current year.

### Checking files have up to date copyright and license header

An example test would be:

```ts
import { assert } from "https://deno.land/std@0.179.0/testing/asserts.ts";
import {
  checkCopyrightHeaders,
  Options,
} from "https://deno.land/x/copyright_license_checker@1.0.1/mod.ts";

// Run with allow write and allow read permissions on the relevant directories
// e.g. deno test --allow-write=. --allow-read=.
Deno.test({
  name: "Copyright and license headers are present and up to date",
  async fn() {
    const options: Options = {
      extensions: [".ts", ".tsx"],
      exclusions: ["test.ts"],
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

To update the headers you can write a simple script as follows:

```ts
// updateHeaders.ts
import {
  Options,
  updateCopyrightHeaders,
} from "https://deno.land/x/copyright_license_checker@1.0.1/mod.ts";

const options: Options = {
  extensions: [".ts"],
  exclusions: ["test.ts"],
  headerText:
    `// Copyright {TIMEFRAME} the Org authors. All rights reserved. MIT license.`,
  rootDir: ".",
  firstYear: 2019,
  quiet: false,
};

await updateCopyrightHeaders(options);
```

and run it with

```shell
deno run --allow-write=. --allow-read=. updateHeaders.ts
```
