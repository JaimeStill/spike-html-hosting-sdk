#!/usr/bin/env node
// spike-html-hosting-sdk, the SDK's scaffold bin: `spike-html-hosting-sdk <repo> [dir]` makes a new
// site in dir, ./<repo> by default, from the package's template/, as gonew makes a module from a
// template: it copies the tree, restores .gitignore, which the pack stores as gitignore since a
// pack never carries a .gitignore, and fills the template's two tokens: {{name}}, the repository's
// name, which is the site's package.json name, its Pages base, and its index's title; and
// {{version}}, this package's own version, read from its package.json, so the site pins the SDK and
// calls its reusable workflows at the release tag the bin ran from, and each file's provenance line
// names that release. The copied tree, content/, is copied byte for byte, its tokens untouched,
// since content.json holds it to its source's blob hashes. Then `pnpm install --lockfile-only`
// writes the site's pnpm-lock.yaml, which mise run install's frozen install reads; it is the one
// step that reads the network. It never runs git init: the new site's repository is its owner's
// to make, and its closing line names git init first, since the site's check runs actionlint,
// which finds the workflows from the repository's root.
//
// It is the bin named after the package, unscoped, so `pnpm dlx github:...#vX.Y.Z <repo>` and
// `npm exec -- github:...#vX.Y.Z <repo>`, which run that bin when a package has several, run it.
// It refuses a dir that holds anything, exiting 1 and naming it, and a usage error exits 2 with the
// usage. pnpm is found on PATH, so test/scaffold/scaffold.test.ts stands a stub in for the lockfile
// step and installs the copy offline itself.

import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const pkg = resolve(import.meta.dirname, "..");
const template = join(pkg, "template");
const { version } = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"));

const usage = `usage: spike-html-hosting-sdk <repo> [dir]

Makes a GitHub Pages site for the repository <repo> in dir, ./<repo> by default, from
spike-html-hosting-sdk v${version}'s template, and writes its pnpm-lock.yaml.`;

/** Prints the message and the usage to stderr and exits 2. */
function usageError(/** @type {string} */ message) {
  process.stderr.write(`spike-html-hosting-sdk: ${message}\n${usage}\n`);
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.length === 1 && (args[0] === "-h" || args[0] === "--help")) {
  process.stdout.write(`${usage}\n`);
  process.exit(0);
}
if (args.length < 1 || args.length > 2) usageError("want a repository name and an optional dir");
const [repo, target = repo] = args;
// The name served.ts's base() accepts, which GitHub's repository names fit; never a flag.
if (!/^[\w.-]+$/.test(repo) || /^[.-]/.test(repo)) {
  usageError(`${repo} isn't a repository's name: letters, digits, _, ., and -`);
}

const dir = resolve(target);
if (existsSync(dir) && (!statSync(dir).isDirectory() || readdirSync(dir).length > 0)) {
  process.stderr.write(`spike-html-hosting-sdk: ${dir} isn't empty; give an empty or new dir\n`);
  process.exit(1);
}

cpSync(template, dir, { recursive: true });
renameSync(join(dir, "gitignore"), join(dir, ".gitignore"));

/** Every file below dir, relative to it with / separators. */
const files = readdirSync(dir, { recursive: true, encoding: "utf8" })
  .filter((path) => statSync(join(dir, path)).isFile())
  .map((path) => path.split(sep).join("/"));
for (const path of files) {
  if (path.startsWith("content/") || path === "LICENSE") continue;
  const file = join(dir, path);
  const text = readFileSync(file, "utf8");
  const filled = text.replaceAll("{{name}}", repo).replaceAll("{{version}}", version);
  if (filled !== text) writeFileSync(file, filled);
}

process.stdout.write(
  `spike-html-hosting-sdk v${version}: ${repo} made in ${relative(process.cwd(), dir) || "."}\n` +
    "Writing pnpm-lock.yaml with pnpm install --lockfile-only\n",
);
const lock = spawnSync("pnpm", ["install", "--lockfile-only"], { cwd: dir, stdio: "inherit" });
if (lock.status !== 0) {
  process.stderr.write(
    `spike-html-hosting-sdk: pnpm install --lockfile-only failed in ${dir}` +
      `${lock.error ? `: ${lock.error.message}` : ""}; the site's files are in place, so run it ` +
      "there again\n",
  );
  process.exit(1);
}
process.stdout.write(`Next, in ${dir}: git init, mise run install, then mise run check.\n`);
