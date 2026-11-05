// The scaffold test: the scaffold bin, bin/new.js, run from the working tree into a scratch
// directory in TMPDIR, removed after, as `pnpm dlx` runs it, and the site it makes checked by its
// own check. The site is the template's, its package name and its index's title the repository's
// name, its .gitignore restored, the SDK pinned and both reusable workflows called at this
// package's version's tag, each file that takes comments carrying its provenance line, and its
// copied tree the template's byte for byte, its README within 100 columns for a long name, and
// its closing line naming git init before the install and the check. It refuses a dir that holds
// anything, and a usage error exits 2 with the usage.
//
// It reads no network. The bin's one network step, `pnpm install --lockfile-only`, runs a stub pnpm
// first on PATH, which records its arguments and directory. The site is then installed offline as
// the pack check's bin site is: its pnpm-workspace.yaml overrides each package its manifest
// declares with a link:, the SDK to the working tree, whose dist/ the check's build wrote, and
// every other to the repository's own install, which the site's pin must match, with its store and
// cache in the scratch directory, so pnpm fetches nothing. The site is made a git repository, as
// its owner's is, for actionlint, which finds the workflows from the repository's root; then its
// `mise run check` runs, the copy's lint, types, build, unit tier, and browser tier, with mise
// trusting its config. Its `mise run currency` runs too, offline, against the currency test's
// lookup stubs answering each pin with itself and typescript's latest above typescript-eslint's
// peer range, so a fresh scaffold, which declares no typescript-eslint, prints nothing and exits 0.

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { stripVTControlCharacters } from "node:util";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { after, before, describe, test } from "node:test";

import { lsRemote, tags, writeStubs } from "../stubs.ts";

const root = join(import.meta.dirname, "../..");
const bin = join(root, "bin", "new.js");
const template = join(root, "template");
const name = "@jaimestill/spike-html-hosting-sdk";
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  version: string;
};
const repo = "scaffolded-site";

/** Every file below dir, relative to it with / separators, sorted. */
function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((path) => !path.split(sep).includes("node_modules") && !path.startsWith(`.git${sep}`))
    .filter((path) => statSync(join(dir, path)).isFile())
    .map((path) => path.split(sep).join("/"))
    .sort();
}

/** A template file's path once scaffolded: the pack's gitignore is the site's .gitignore. */
const scaffolded = (path: string): string => (path === "gitignore" ? ".gitignore" : path);

/** Whether a template file takes no provenance line: JSON, which takes no comments; the license;
 * and the copied tree, which content.json holds byte for byte. */
const unmarked = (path: string): boolean =>
  path.endsWith(".json") || path === "LICENSE" || path.startsWith("content/");

let scratch: string;
let stubs: string;
let site: string;
let made: { status: number | null; stdout: string; stderr: string };

/** The environment the site's own mise runs in: the variables mise sets for the SDK's own task
 * dropped, so the site's mise reads the site's config as its own run would, a user's mise settings
 * kept; and so is the one node's test runner sets for this test, with which the site's node --test
 * would run no file. mise trusts the site's config. */
function siteEnv(): NodeJS.ProcessEnv {
  const task = /^(MISE_(TASK_\w+|PROJECT_ROOT|CONFIG_ROOT|ORIGINAL_CWD)|NODE_TEST_CONTEXT)$/;
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !task.test(key)));
  return { ...env, MISE_TRUSTED_CONFIG_PATHS: site };
}

/** The absolute path of the command PATH finds, before any stub goes first on it. */
const which = (command: string): string =>
  execFileSync("sh", ["-c", `command -v ${command}`], { encoding: "utf8" }).trim();

/** Runs the bin with args in the scratch directory, the stub pnpm first on PATH. */
function scaffold(...args: string[]): { status: number | null; stdout: string; stderr: string } {
  const { status, stdout, stderr } = spawnSync(process.execPath, [bin, ...args], {
    cwd: scratch,
    env: { ...process.env, PATH: `${stubs}:${process.env.PATH}` },
    encoding: "utf8",
  });
  return { status, stdout, stderr };
}

before(() => {
  scratch = mkdtempSync(join(tmpdir(), "scaffold-"));
  stubs = join(scratch, "stubs");
  mkdirSync(stubs);
  writeFileSync(
    join(stubs, "pnpm"),
    `#!/usr/bin/env bash\necho "$PWD $*" >> ${JSON.stringify(join(scratch, "pnpm.log"))}\n`,
  );
  chmodSync(join(stubs, "pnpm"), 0o755);
  made = scaffold(repo);
  site = join(scratch, repo);
});
after(() => rmSync(scratch, { recursive: true, force: true }));

describe("the scaffold", () => {
  test("makes the site in ./<repo> and writes its lockfile with pnpm install --lockfile-only", () => {
    assert.equal(made.status, 0, made.stderr);
    assert.equal(made.stderr, "");
    assert.match(made.stdout, new RegExp(`^spike-html-hosting-sdk v${version}: ${repo} made in`));
    const log = readFileSync(join(scratch, "pnpm.log"), "utf8");
    assert.equal(log, `${realpathSync(site)} install --lockfile-only\n`);
  });

  test("closes naming git init, then mise run install and mise run check", () => {
    assert.ok(
      made.stdout.endsWith(
        `Next, in ${realpathSync(site)}: git init, mise run install, then mise run check.\n`,
      ),
      made.stdout,
    );
  });

  // After the first test, which reads the stub pnpm's log as the one scaffold's.
  test("keeps its README within 100 columns for a 95-character repository name", () => {
    // The longest name the README's layout fits: the name stands on a line of its own, as the
    // heading's and the base's, with at most five columns beside it.
    const long = `site-${"x".repeat(90)}`;
    assert.equal(long.length, 95);
    const { status, stderr } = scaffold(long);
    assert.equal(status, 0, stderr);
    const readme = readFileSync(join(scratch, long, "README.md"), "utf8");
    assert.ok(readme.includes(long), "the README names the repository");
    for (const [i, line] of readme.split("\n").entries()) {
      assert.ok(line.length <= 100, `README.md:${i + 1} is ${line.length} columns: ${line}`);
    }
  });

  test("copies the template, its gitignore restored as .gitignore", () => {
    assert.deepEqual(listFiles(site), listFiles(template).map(scaffolded).sort());
    assert.ok(existsSync(join(site, ".gitignore")));
    assert.ok(!existsSync(join(site, "gitignore")));
  });

  test("names the site's package and its index's title after the repository", () => {
    const manifest = JSON.parse(readFileSync(join(site, "package.json"), "utf8"));
    assert.equal(manifest.name, repo);
    const index = readFileSync(join(site, "index.html"), "utf8");
    assert.match(index, new RegExp(`<title>${repo}</title>`));
  });

  test("pins the SDK and calls each reusable workflow at this version's tag", () => {
    const manifest = JSON.parse(readFileSync(join(site, "package.json"), "utf8"));
    assert.equal(
      manifest.devDependencies[name],
      `github:JaimeStill/spike-html-hosting-sdk#v${version}`,
    );
    for (const [file, called] of [
      ["pages.yml", "site-pages.yml"],
      ["ci.yml", "site-ci.yml"],
    ]) {
      const workflow = readFileSync(join(site, ".github/workflows", file), "utf8");
      const uses = `uses: JaimeStill/spike-html-hosting-sdk/.github/workflows/${called}@v${version}`;
      assert.ok(workflow.includes(`    ${uses}\n`), `${file} calls ${called} at v${version}`);
    }
  });

  test("marks each file that takes comments with its provenance at this version", () => {
    for (const path of listFiles(template).filter((path) => !unmarked(path))) {
      const text = readFileSync(join(site, scaffolded(path)), "utf8");
      const line = `From spike-html-hosting-sdk (v${version}): template/${path}`;
      assert.ok(text.includes(line), `${scaffolded(path)} names ${line}`);
    }
  });

  test("fills every token, and leaves the copied tree and mise's own templates as they are", () => {
    for (const path of listFiles(site)) {
      const text = readFileSync(join(site, path), "utf8");
      assert.ok(!/\{\{(name|version)\}\}/.test(text), `${path} holds an unfilled token`);
    }
    for (const path of listFiles(join(template, "content"))) {
      assert.deepEqual(
        readFileSync(join(site, "content", path)),
        readFileSync(join(template, "content", path)),
        `content/${path} is copied byte for byte`,
      );
    }
    assert.match(readFileSync(join(site, "mise.toml"), "utf8"), /\/\{\{ version \}\}\/linux64\//);
  });

  test("refuses a dir that holds anything, naming it, and changes nothing there", () => {
    const before = listFiles(site);
    const { status, stdout, stderr } = scaffold("other", repo);
    assert.equal(status, 1);
    assert.equal(stdout, "");
    assert.match(stderr, new RegExp(`${realpathSync(site)} isn't empty`));
    assert.deepEqual(listFiles(site), before);
  });

  test("exits 2 with the usage on a usage error", () => {
    for (const args of [[], ["a", "b", "c"], ["--force"], ["a/b"]]) {
      const { status, stdout, stderr } = scaffold(...args);
      assert.equal(status, 2, `${args.join(" ")} is a usage error`);
      assert.equal(stdout, "");
      assert.match(stderr, /^usage: spike-html-hosting-sdk <repo> \[dir\]$/m);
    }
  });

  test("makes a site whose own mise run check passes, installed offline", () => {
    const manifest = JSON.parse(readFileSync(join(site, "package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
    };
    // Each package but the SDK is linked from the repository's install, so the site's pin must be
    // the one the repository installs, or the check would pass on a version the site never gets.
    const own = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    for (const [pkg, pin] of Object.entries(manifest.devDependencies)) {
      if (pkg === name) continue;
      const installed = own.devDependencies[pkg] ?? own.dependencies[pkg];
      assert.equal(pin, installed, `the site pins ${pkg} at the repository's own pin`);
    }
    const overrides = Object.keys(manifest.devDependencies).map((pkg) => {
      const target = pkg === name ? root : realpathSync(join(root, "node_modules", pkg));
      return `  ${JSON.stringify(pkg)}: ${JSON.stringify(`link:${target}`)}`;
    });
    // The store and cache settings are the workspace's, so the check's pnpm exec, which verifies
    // the install against them before it runs, finds it current and installs nothing.
    writeFileSync(
      join(site, "pnpm-workspace.yaml"),
      `overrides:\n${overrides.join("\n")}\n` +
        `storeDir: ${JSON.stringify(join(scratch, "store"))}\n` +
        `cacheDir: ${JSON.stringify(join(scratch, "cache"))}\n` +
        "autoInstallPeers: false\n",
    );
    execFileSync("pnpm", ["install", "--offline", "--ignore-scripts"], {
      cwd: site,
      stdio: "ignore",
    });
    execFileSync("git", ["init", "--quiet"], { cwd: site });
    const { status, stdout, stderr } = spawnSync("mise", ["run", "check"], {
      cwd: site,
      env: siteEnv(),
      encoding: "utf8",
    });
    assert.equal(status, 0, `${stdout}\n${stderr}`);
    // Read uncolored: mise and node color their lines where CI forces color.
    const out = stripVTControlCharacters(stdout);
    const err = stripVTControlCharacters(stderr);
    // Every step ran, as mise echoes each task's command to stderr, so a step dropped from the
    // site's check fails here rather than passing unrun.
    for (const step of [
      "lint:eslint",
      "lint:format",
      "lint:shell",
      "lint:workflows",
      "types:src",
      "types:test",
      "build",
      "test:unit",
      "test:browser",
    ]) {
      assert.match(err, new RegExp(`^\\[${step}\\] \\$ `, "m"), `${step} ran`);
    }
    // Each tier ran its tests, and none failed.
    for (const tier of ["test:unit", "test:browser"]) {
      assert.match(out, new RegExp(`^\\[${tier}\\] ℹ pass [1-9]\\d*$`, "m"), `${tier} ran`);
      assert.match(out, new RegExp(`^\\[${tier}\\] ℹ fail 0$`, "m"), `${tier} passed`);
    }
  });

  // After the check, which installed the site.
  test("makes a site whose own mise run currency prints nothing, its lookups stubbed", () => {
    const manifest = JSON.parse(readFileSync(join(site, "package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
    };
    // Each pin answered with itself: a registry pin as its latest, a github: tag and a workflow's
    // pin as its repository's highest tag; typescript's latest above typescript-eslint's peer
    // range, whose newest is the site's pin, so only a hold to the SDK's range keeps it silent.
    const pnpm: Record<string, string> = {};
    const git: Record<string, string> = {};
    for (const [pkg, pin] of Object.entries(manifest.devDependencies)) {
      const github = /^github:([^#]+)#(v[\d.]+)$/.exec(pin);
      if (github) git[lsRemote(github[1]!)] = tags(github[2]!);
      else pnpm[`view ${pkg} version`] = `${pin}\n`;
    }
    const { dependencies } = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      dependencies: Record<string, string>;
    };
    const range = ">=4.8.4 <6.1.0";
    pnpm["view typescript version"] = "99.0.0\n";
    pnpm[
      `view typescript-eslint@${dependencies["typescript-eslint"]} peerDependencies.typescript`
    ] = `${range}\n`;
    pnpm[`view typescript@${range} version --json`] = JSON.stringify([
      "5.9.3",
      manifest.devDependencies.typescript,
    ]);
    for (const file of readdirSync(join(site, ".github/workflows"))) {
      const workflow = readFileSync(join(site, ".github/workflows", file), "utf8");
      for (const [, repo, tag] of workflow.matchAll(
        /^\s*(?:-\s+)?uses:\s*([^/@\s]+\/[^/@\s]+)\S*@(\S+)$/gm,
      ))
        git[lsRemote(repo!)] = tags(tag!);
    }
    const stubs = join(scratch, "currency-stubs");
    writeStubs(
      stubs,
      { mise: { "outdated --bump --local --json": "{}" }, pnpm, git },
      { pnpm: { first: "exec", to: which("pnpm") } },
    );
    const env = siteEnv();
    const { status, stdout, stderr } = spawnSync(which("mise"), ["run", "currency"], {
      cwd: site,
      env: { ...env, PATH: `${stubs}:${env.PATH}` },
      encoding: "utf8",
    });
    assert.equal(stderr, "");
    assert.equal(stdout, "");
    assert.equal(status, 0);
  });
});
