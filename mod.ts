import { walk } from "https://deno.land/std@0.178.0/fs/walk.ts";
import { globToRegExp } from "https://deno.land/std@0.178.0/path/glob.ts";

export type Options = {
  /* file extensions to check. E.g. [".ts", ".js"] */
  extensions: string[],
  /* glob patterns of files or directories to exclude. E.g. ["some/path/*_test.ts"] */
  exclusions?: string[],
  /* the first year of the copyright. If not provided, only the current year will be used. */
  firstYear?: number,
  /* the copyright and license header text. The string "{TIMEFRAME}" will be replaced with the current year or the first year (if specified) and the current year. */
  licenseText: string,
  /* the root directory to carry out the check. */
  rootDir: string,
  /* if true, no output will be printed to the console. */
  quiet?: boolean,
}

/**
 * Checks that all files in the root directory have a valid copyright/license header.
 * @param {Options}
 * @returns true if all files have a valid copyright/license header, false otherwise.
 */
export async function checkCopyrightHeaders(options: Options): Promise<boolean> {
  const [ filesMissingLicense, filesWithOutOfDateLicense ] = await walkFiles(options, false);
  outputCheckResult(filesMissingLicense, filesWithOutOfDateLicense, options.quiet);
  return filesMissingLicense.length == 0 && filesWithOutOfDateLicense.length == 0;
}

/**
 * Updates all matched files with a valid copyright/license header where necessary.
 * @param {Options}
 */
export async function updateCopyrightHeaders(options: Options): Promise<void> {
  const [ filesMissingLicense, filesWithOutOfDateLicense ] = await walkFiles(options, true);
  outputUpdateResult(filesMissingLicense, filesWithOutOfDateLicense, options.quiet);
}

async function walkFiles(options: Options, shouldUpdate: boolean): Promise<string[][]> {
  const CURRENT_YEAR = new Date().getFullYear();
  validateOptions(options, CURRENT_YEAR);
  const { extensions, exclusions = [], firstYear, licenseText, rootDir } = options;

  const timeframe = (firstYear && firstYear != CURRENT_YEAR) ? `${firstYear}-${CURRENT_YEAR}` : CURRENT_YEAR.toString();
  const license = licenseText.replace("{TIMEFRAME}", timeframe);
  const [ licenseStart, licenseEnd ] = licenseText.split("{TIMEFRAME}");

  const filesMissingLicense: string[] = [];
  const filesWithOutOfDateLicense: string[] = [];

  for await(const { path } of walk(rootDir, {
    exts: extensions,
    skip: exclusions.map((path) => globToRegExp(path)),
    includeDirs: false,
  })) {
    const content = await Deno.readTextFile(path);
    if (content.indexOf(license) == -1) {
      if (content.indexOf(licenseStart) >= 0 && content.indexOf(licenseEnd) >= 0) {
        filesWithOutOfDateLicense.push(path);
        if (shouldUpdate) {
          const licenseStartIndex = content.indexOf(licenseStart);
          const licenseEndIndex = content.indexOf(licenseEnd) + licenseEnd.length;
          const updatedContent = content.substring(0, licenseStartIndex) + license + content.substring(licenseEndIndex);
          await Deno.writeTextFile(path, updatedContent);
        }
      } else {
        filesMissingLicense.push(path);
        if (shouldUpdate) {
          await Deno.writeTextFile(path, license + "\n" + content);
        }
      } 
    }
  }

  return [ filesMissingLicense, filesWithOutOfDateLicense ];
}

function outputCheckResult(filesMissingLicense: string[], filesWithOutOfDateLicense: string[], quiet: boolean|undefined): void {
  if (filesMissingLicense.length > 0 || filesWithOutOfDateLicense.length > 0) {
    if (!quiet) {
      if (filesMissingLicense.length > 0) {
        console.log("");
        console.log("%cFiles missing copyright header:", "color: red");
        console.log("----------------------");
        console.log(filesMissingLicense.map((path) => `  ${path}`).join("\n"));
      }
      if (filesWithOutOfDateLicense.length > 0) {
        console.log("");
        console.log("%cFiles with out-of-date copyright header:", "color: red");
        console.log("------------------------------");
        console.log(filesWithOutOfDateLicense.map((path) => `  ${path}`).join("\n"));
      }
      console.log("");
    }
  } else {
    if (!quiet) {
      console.log("%cAll files have valid up to date copyright header", "color: green");
    }
  }
}

function outputUpdateResult(filesMissingLicense: string[], filesWithOutOfDateLicense: string[], quiet: boolean|undefined): void {
  if (filesMissingLicense.length > 0 || filesWithOutOfDateLicense.length > 0) {
    if (!quiet) {
      if (filesMissingLicense.length > 0) {
        console.log("");
        console.log("%cAdded copyright/license header to:", "color: red");
        console.log("----------------------------");
        console.log(filesMissingLicense.map((path) => `  ${path}`).join("\n"));
      }
      if (filesWithOutOfDateLicense.length > 0) {
        console.log("");
        console.log("%cUpdated copyright/license header in:", "color: red");
        console.log("------------------------------");
        console.log(filesWithOutOfDateLicense.map((path) => `  ${path}`).join("\n"));
      }
      console.log("");
    }
  } else {
    if (!quiet) {
      console.log("%cNo updates necessary, all files have valid up to date copyright/license header", "color: green");
    }
  }
}

function validateOptions(options: Options, currentYear: number): void {
  if (options.firstYear) {
    assert(options.firstYear > 1900 && options.firstYear <= currentYear, "Invalid first year");
  }
  assert(options.extensions.length > 0, "No extensions provided");
  assert(options.rootDir.length > 0, "No root directory provided");
  assert(options.licenseText.length > 0, "No license text provided");
}

function assert(assertion: boolean, logMessage: string) {
  if (!assertion) {
    throw new Error(logMessage);
  }
}
