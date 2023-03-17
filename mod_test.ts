// Copyright 2023 Chris Knight. All rights reserved. MIT license.
// Copyright 2022-2023 the optic authors. All rights reserved. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.180.0/testing/asserts.ts";
import {
  checkCopyrightHeaders,
  Options,
  updateCopyrightHeaders,
} from "./mod.ts";

Deno.test({
  name: "Options are validated",
  async fn() {
    const options: Options = {
      extensions: [".java", ".jsx"],
      exclusions: ["mod.ts"],
      headerText:
        `// Copyright {TIMEFRAME} the code authors. All rights reserved. MIT license.`,
      rootDir: ".",
      firstYear: 2022,
      quiet: false,
    };

    options.firstYear = 1900;
    await assertRejects(
      () => checkCopyrightHeaders(options),
      Error,
      "Invalid first year",
    );
    await assertRejects(
      () => updateCopyrightHeaders(options),
      Error,
      "Invalid first year",
    );

    options.firstYear = new Date().getFullYear() + 1;
    await assertRejects(
      () => checkCopyrightHeaders(options),
      Error,
      "Invalid first year",
    );
    await assertRejects(
      () => updateCopyrightHeaders(options),
      Error,
      "Invalid first year",
    );

    options.firstYear = 1901;
    options.extensions = [];
    await assertRejects(
      () => checkCopyrightHeaders(options),
      Error,
      "No extensions provided",
    );
    await assertRejects(
      () => updateCopyrightHeaders(options),
      Error,
      "No extensions provided",
    );

    options.firstYear = new Date().getFullYear();
    options.extensions = [".java", ".jsx"];
    options.rootDir = "";
    await assertRejects(
      () => checkCopyrightHeaders(options),
      Error,
      "No root directory provided",
    );
    await assertRejects(
      () => updateCopyrightHeaders(options),
      Error,
      "No root directory provided",
    );

    options.rootDir = ".";
    options.headerText = "";
    await assertRejects(
      () => checkCopyrightHeaders(options),
      Error,
      "No license text provided",
    );
    await assertRejects(
      () => updateCopyrightHeaders(options),
      Error,
      "No license text provided",
    );
  },
});

Deno.test({
  name: "Files are checked with first year specified",
  async fn(t) {
    const license = "// Copyright 2018-{TIMEFRAME}. MIT license.".replace(
      "{TIMEFRAME}",
      new Date().getFullYear().toString(),
    );
    const licenseOld = "// Copyright 2018-{TIMEFRAME}. MIT license.".replace(
      "{TIMEFRAME}",
      (new Date().getFullYear() - 1).toString(),
    );
    await Deno.mkdir("testdir");
    Deno.writeFileSync(
      "my_file.test",
      new TextEncoder().encode("hello world\n"),
    );
    Deno.writeFileSync(
      "./testdir/should_not_be_checked.java",
      new TextEncoder().encode("hello world\n"),
    );
    Deno.writeFileSync(
      "./testdir/my_file2.test",
      new TextEncoder().encode("hello world\n"),
    );
    Deno.writeFileSync(
      "./testdir/my_file3.test",
      new TextEncoder().encode(license + "\nhello world\n"),
    );
    Deno.writeFileSync(
      "./testdir/my_file4.test",
      new TextEncoder().encode(licenseOld + "\nhello world\n"),
    );

    await t.step("Check files with first year specified", async () => {
      const options: Options = {
        extensions: [".test"],
        exclusions: [],
        headerText: `// Copyright {TIMEFRAME}. MIT license.`,
        rootDir: ".",
        firstYear: 2018,
        quiet: false,
      };
      //Files my_file.test, my_file2.test and my_file4.test should fail
      assert(!await checkCopyrightHeaders(options));

      //Now exlude the failing files
      options.exclusions = [
        "**/my_file2.test",
        "**/my_file4.test",
        "my_file.test",
      ];
      assert(await checkCopyrightHeaders(options));
    });

    await t.step("Update files with first year specified", async () => {
      const options: Options = {
        extensions: [".test"],
        exclusions: [],
        headerText: `// Copyright {TIMEFRAME}. MIT license.`,
        rootDir: ".",
        firstYear: 2018,
        quiet: false,
      };
      await updateCopyrightHeaders(options);
      assert(await checkCopyrightHeaders(options));
      assertEquals(
        Deno.readTextFileSync("my_file.test"),
        license + "\nhello world\n",
      );
    });

    await Deno.remove("my_file.test");
    await Deno.remove("./testdir", { recursive: true });
  },
});

Deno.test({
  name: "Files are checked without first year specified",
  async fn(t) {
    const license = "// Copyright {TIMEFRAME}. MIT license.".replace(
      "{TIMEFRAME}",
      new Date().getFullYear().toString(),
    );
    const licenseOld = "// Copyright {TIMEFRAME}. MIT license.".replace(
      "{TIMEFRAME}",
      (new Date().getFullYear() - 1).toString(),
    );
    await Deno.mkdir("testdir");
    Deno.writeFileSync(
      "my_file.test",
      new TextEncoder().encode("hello world\n"),
    );
    Deno.writeFileSync(
      "./testdir/my_file2.test",
      new TextEncoder().encode(license + "\nhello world\n"),
    );
    Deno.writeFileSync(
      "./testdir/my_file3.test",
      new TextEncoder().encode(licenseOld + "\nhello world\n"),
    );

    await t.step(
      "Check and update files with first year specified",
      async () => {
        const options: Options = {
          extensions: [".test"],
          exclusions: [],
          headerText: `// Copyright {TIMEFRAME}. MIT license.`,
          rootDir: ".",
          quiet: true,
        };

        assert(!await checkCopyrightHeaders(options));
        await updateCopyrightHeaders(options);
        assert(await checkCopyrightHeaders(options));
        assertEquals(
          Deno.readTextFileSync("my_file.test"),
          license + "\nhello world\n",
        );
      },
    );

    await Deno.remove("my_file.test");
    await Deno.remove("./testdir", { recursive: true });
  },
});
