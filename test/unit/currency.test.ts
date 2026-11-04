// The currency bin, bin/currency.sh, at its seam with no network: run in a scratch site in TMPDIR,
// removed after, with stubs for mise, pnpm, and git first on PATH, each answering the lookups the
// bin makes from a table and failing on any other, so an unexpected lookup fails the run. A stale
// site's every trailing pin is reported, one line each, and the run exits 1: a mise tool, a
// registry pin, typescript against typescript-eslint's peer range rather than its latest, a
// github: tag, an action, and a reusable workflow call, the SDK's site-pages.yml, against its
// repository's highest plain vX.Y.Z tag, a prerelease tag above it ignored; a pin in a form the
// bin can't compare is reported as one, and a uses: line a comment shows isn't scanned. A current
// site prints nothing and exits 0.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, test } from "node:test";

const root = join(import.meta.dirname, "../..");
const bin = join(root, "bin", "currency.sh");

let scratch: string;
before(() => {
  scratch = mkdtempSync(join(tmpdir(), "currency-"));
});
after(() => rmSync(scratch, { recursive: true, force: true }));

/** Each stubbed command's answers: its arguments, joined by spaces, to its output. */
type Answers = Record<"mise" | "pnpm" | "git", Record<string, string>>;

/** git ls-remote --tags --refs's output for the repository's tags. */
const tags = (...names: string[]): string =>
  names.map((name, i) => `${String(i).padStart(40, "0")}\trefs/tags/${name}\n`).join("");

/** The ls-remote lookup of the GitHub repository's tags. */
const lsRemote = (repo: string): string => `ls-remote --tags --refs https://github.com/${repo}.git`;

/** Writes the site's files and the stubs into a fresh directory of the scratch one, runs the bin
 * there with the stubs first on PATH, and returns its status and output. */
function run(
  files: Record<string, string>,
  answers: Answers,
): { status: number | null; stdout: string; stderr: string } {
  const dir = mkdtempSync(join(scratch, "site-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  const stubs = join(dir, ".stubs");
  mkdirSync(stubs);
  for (const [command, table] of Object.entries(answers)) {
    writeFileSync(join(stubs, `${command}.json`), JSON.stringify(table));
    const stub = join(stubs, command);
    writeFileSync(
      stub,
      "#!/usr/bin/env bash\n" +
        `exec node -e '
const answers = require(process.argv[1]);
const key = process.argv.slice(2).join(" ");
if (!(key in answers)) { console.error("stub: unexpected ${command} " + key); process.exit(1); }
process.stdout.write(answers[key]);' "${join(stubs, `${command}.json`)}" "$@"\n`,
    );
    chmodSync(stub, 0o755);
  }
  const { status, stdout, stderr } = spawnSync(bin, [], {
    cwd: dir,
    env: { ...process.env, PATH: `${stubs}:${process.env.PATH}` },
    encoding: "utf8",
  });
  return { status, stdout, stderr };
}

/** The site's package.json, its pins given. */
const manifest = (dependencies: Record<string, string>, devDependencies: Record<string, string>) =>
  JSON.stringify({ name: "site", private: true, dependencies, devDependencies });

const foundation = "JaimeStill/spike-html-apps-foundation";
const sdk = "JaimeStill/spike-html-hosting-sdk";

/** The site's workflows: an action, a local action, and the SDK's reusable workflow called, with
 * a caller's line a comment shows. */
const workflows = (checkout: string, pages: string): Record<string, string> => ({
  ".github/workflows/ci.yml":
    "on: pull_request\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n" +
    `      - uses: actions/checkout@${checkout}\n`,
  ".github/workflows/pages.yml":
    "# A caller writes uses: someone/else/.github/workflows/x.yml@v0.0.1, as below.\n" +
    "on: push\njobs:\n  pages:\n" +
    `    uses: ${sdk}/.github/workflows/site-pages.yml@${pages}\n`,
});

/** The lookups every run makes: typescript's latest and typescript-eslint's peer range. */
const typescript = {
  "view typescript version": "7.0.0\n",
  "view typescript-eslint@8.72.1 peerDependencies.typescript": ">=4.8.4 <6.1.0\n",
  "view typescript@>=4.8.4 <6.1.0 version --json": '["6.0.3", "6.0.4"]\n',
  "view typescript-eslint version": "8.72.1\n",
};

describe("spike-html-hosting-currency", () => {
  test("reports each trailing pin, one line each, and exits 1", () => {
    const { status, stdout, stderr } = run(
      {
        "mise.toml": "",
        "package.json": manifest(
          { marked: "18.1.3" },
          {
            typescript: "6.0.3",
            "typescript-eslint": "8.72.1",
            "@jaimestill/spike-html-apps-foundation": `github:${foundation}#v0.3.0`,
            vite: "^8.0.0",
          },
        ),
        ...workflows("v7.0.1", "v0.1.0"),
        ".github/workflows/local.yml":
          "on: push\njobs:\n  local:\n    runs-on: ubuntu-latest\n    steps:\n" +
          "      - uses: ./local-action\n",
      },
      {
        mise: {
          "outdated --bump --local --json": JSON.stringify({
            node: { requested: "26.13.0", bump: "26.14.0" },
          }),
        },
        pnpm: { "view marked version": "18.2.0\n", ...typescript },
        git: {
          [lsRemote(foundation)]: tags("v0.3.0", "v0.4.0", "v0.5.0-rc.1"),
          [lsRemote("actions/checkout")]: tags("v7.0.1", "v7.1.0"),
          [lsRemote(sdk)]: tags("v0.1.0", "v0.2.0", "v0.3.0-rc.1", "latest"),
        },
      },
    );
    assert.equal(stderr, "");
    assert.equal(status, 1);
    assert.deepEqual(
      stdout.trimEnd().split("\n").sort(),
      [
        "mise.toml: node 26.13.0 -> 26.14.0",
        "package.json: marked 18.1.3 -> 18.2.0",
        "package.json: typescript 6.0.3 -> 6.0.4",
        `package.json: @jaimestill/spike-html-apps-foundation v0.3.0 -> v0.4.0`,
        "package.json: vite ^8.0.0 -> can't compare this form of pin",
        ".github/workflows: actions/checkout v7.0.1 -> v7.1.0",
        `.github/workflows: ${sdk}/.github/workflows/site-pages.yml v0.1.0 -> v0.2.0`,
        ".github/workflows: ./local-action -> can't compare this form of pin",
      ].sort(),
    );
  });

  test("prints nothing and exits 0 when every pin is current", () => {
    const { status, stdout, stderr } = run(
      {
        "mise.toml": "",
        "package.json": manifest(
          {},
          {
            typescript: "6.0.4",
            "typescript-eslint": "8.72.1",
            "@jaimestill/spike-html-apps-foundation": `github:${foundation}#v0.4.0`,
          },
        ),
        ...workflows("v7.1.0", "v0.2.0"),
      },
      {
        mise: { "outdated --bump --local --json": "{}" },
        pnpm: typescript,
        git: {
          [lsRemote(foundation)]: tags("v0.3.0", "v0.4.0"),
          [lsRemote("actions/checkout")]: tags("v7.1.0"),
          [lsRemote(sdk)]: tags("v0.1.0", "v0.2.0", "v0.3.0-rc.1"),
        },
      },
    );
    assert.equal(stderr, "");
    assert.equal(stdout, "");
    assert.equal(status, 0);
  });
});
