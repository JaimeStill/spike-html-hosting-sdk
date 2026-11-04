// The pack check: pnpm pack's tarball of the build, installed into a scratch site in TMPDIR, removed
// after, and each export resolved from it as a site resolves it, through the manifest's exports:
// each JS module imported in node, its declarations typing a site's code under the tsconfig base,
// the Prettier configuration resolved by Prettier, and the stylesheet linked by a site's page and
// bundled by Vite, in a build that runs both plugins, lints clean under the exported config, and
// whose copied tree the content check holds to its record.
//
// The install reads no network: the tarball is extracted to the site's node_modules, and each
// package its manifest declares, its dependencies and its peers, is linked there from the
// repository's own install, as pnpm links a package into its virtual store, with the site's own
// tools, prettier and @types/node, beside them. pnpm's offline install can't stand in for it: after
// mise run install's frozen install it holds no registry metadata to resolve the site's manifest.
// A module the package imports and its manifest doesn't declare isn't linked, so it fails to load.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, sep } from "node:path";
import { after, before, describe, test } from "node:test";

const root = join(import.meta.dirname, "../..");
const name = "@jaimestill/spike-html-hosting-sdk";

/** Every file below dir, relative to it with / separators, sorted. */
function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((path) => statSync(join(dir, path)).isFile())
    .map((path) => path.split(sep).join("/"))
    .sort();
}

/** The exported names each JS export holds, by its subpath. */
const modules: Record<string, string[]> = {
  "./render-blocking.js": ["renderBlocking"],
  "./markdown-pages.js": ["frontMatterTable", "markdownPages", "pageFile", "pageUrl", "render"],
  "./eslint.js": ["build", "config"],
  "./content.js": ["blob", "checkContent"],
};

/** The files a site reads as they are, by their subpath. */
const files = ["./tsconfig.json", "./prettier.json", "./site.css"];

/** The scratch site's files: a copied tree and its record, the shell its pages fill, a Vite config
 * running both plugins, a lint config spreading the SDK's, a tsconfig on the base, and code that
 * types against each JS export's declarations. */
const site: Record<string, string> = {
  "package.json": JSON.stringify({ name: "site", private: true, type: "module" }),
  "content/README.md": "# The pack's site\n\n[A page](a.md)\n",
  "content/a.md": "---\nname: A page\n---\n\nBody.\n",
  "index.html":
    "<!doctype html>\n<html><head><title></title>\n" +
    `<link rel="stylesheet" href="${name}/site.css" />\n` +
    '<script type="module" src="./main.js"></script>\n' +
    "</head><body><main></main></body></html>\n",
  // The page's entry. A site's own code runs on node, as the exported config's globals have it; the
  // modules its page loads are the foundation's.
  "main.js": 'console.log("ready");\n',
  "vite.config.js":
    `import { defineConfig } from "vite";\n` +
    `import { markdownPages } from "${name}/markdown-pages.js";\n` +
    `import { renderBlocking } from "${name}/render-blocking.js";\n` +
    "export default defineConfig({\n" +
    "  publicDir: false,\n" +
    "  appType: 'mpa',\n" +
    "  plugins: [\n" +
    "    markdownPages({ dir: 'content', repository: 'https://github.com/owner/source', ref: " +
    "'0123456789abcdef0123456789abcdef01234567' }),\n" +
    "    renderBlocking(),\n" +
    "  ],\n" +
    "});\n",
  "eslint.config.js": `import { config } from "${name}/eslint.js";\nexport default [...config];\n`,
  ".prettierrc.json": JSON.stringify(`${name}/prettier.json`),
  "tsconfig.json": JSON.stringify({
    extends: `${name}/tsconfig.json`,
    compilerOptions: { module: "nodenext", moduleResolution: "nodenext" },
    include: ["site.ts"],
  }),
  "site.ts":
    'import type { Plugin } from "vite";\n' +
    'import type { Config } from "eslint/config";\n' +
    `import { blob, checkContent } from "${name}/content.js";\n` +
    `import { build, config } from "${name}/eslint.js";\n` +
    `import { markdownPages, render } from "${name}/markdown-pages.js";\n` +
    `import type { Source } from "${name}/markdown-pages.js";\n` +
    `import { renderBlocking } from "${name}/render-blocking.js";\n` +
    "const source: Source = { pages: new Set(), external: new Set(), repository: '', ref: '' };\n" +
    "export const plugins: Plugin[] = [\n" +
    "  renderBlocking(),\n" +
    "  markdownPages({ dir: 'content', repository: '', ref: '' }),\n" +
    "];\n" +
    "export const lint: Config[] = config;\n" +
    "export const globs: string[] = build;\n" +
    "export const problems: string[] = checkContent('.');\n" +
    "export const hash: string = blob(new Uint8Array());\n" +
    "export const title: string = render('a.md', '# A', source).title;\n",
};

let scratch: string;
let tarballFiles: string[];
let dir: string;
let manifest: {
  exports: Record<string, unknown>;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};

/** Runs node with args in the site, returning its output. */
const node = (...args: string[]): string =>
  execFileSync(process.execPath, args, { cwd: dir, encoding: "utf8" });

/** The path of a linked package's bin, from its manifest. */
function bin(pkg: string, command: string): string {
  const pkgDir = join(dir, "node_modules", pkg);
  const { bin } = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  return join(pkgDir, typeof bin === "string" ? bin : bin[command]);
}

before(() => {
  scratch = mkdtempSync(join(tmpdir(), "pack-"));
  execFileSync("pnpm", ["pack", "--pack-destination", scratch], { cwd: root, stdio: "ignore" });
  const tarball = readdirSync(scratch).find((file) => file.endsWith(".tgz"));
  assert.ok(tarball, "pnpm pack wrote no tarball");
  const listed = execFileSync("tar", ["-tzf", join(scratch, tarball)], { encoding: "utf8" });
  tarballFiles = listed
    .split("\n")
    .filter(Boolean)
    .map((path) => path.replace(/^package\//, ""))
    .sort();

  dir = join(scratch, "site");
  const installed = join(dir, "node_modules", name);
  mkdirSync(installed, { recursive: true });
  execFileSync("tar", ["-xzf", join(scratch, tarball), "-C", installed, "--strip-components=1"]);
  manifest = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
  const linked = [
    ...Object.keys(manifest.dependencies),
    ...Object.keys(manifest.peerDependencies),
    "prettier",
    "@types/node",
  ];
  for (const pkg of linked) {
    const link = join(dir, "node_modules", pkg);
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(realpathSync(join(root, "node_modules", pkg)), link, "dir");
  }
  for (const [path, text] of Object.entries(site)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
});
after(() => rmSync(scratch, { recursive: true, force: true }));

describe("the pack", () => {
  test("is the build, package.json, README.md, and LICENSE", () => {
    const built = listFiles(join(root, "dist")).map((path) => `dist/${path}`);
    assert.ok(built.length > 0, "mise run build wrote no dist/");
    assert.deepEqual(tarballFiles, [...built, "LICENSE", "README.md", "package.json"].sort());
  });

  test("exports each JS module and each file a site reads, and nothing else", () => {
    assert.deepEqual(
      Object.keys(manifest.exports).sort(),
      [...Object.keys(modules), ...files].sort(),
    );
  });

  for (const [subpath, names] of Object.entries(modules)) {
    test(`imports ${subpath} in node from the install`, () => {
      const specifier = name + subpath.slice(1);
      const script =
        `const m = await import(${JSON.stringify(specifier)});` +
        "console.log(JSON.stringify(Object.keys(m).sort()));";
      assert.deepEqual(JSON.parse(node("--input-type=module", "-e", script)), names);
    });
  }

  test("resolves each file a site reads to a packed file", () => {
    for (const subpath of files) {
      const specifier = name + subpath.slice(1);
      const script = `console.log(import.meta.resolve(${JSON.stringify(specifier)}));`;
      const url = node("--input-type=module", "-e", script).trim();
      assert.ok(existsSync(new URL(url)), `${specifier} resolves to ${url}, which isn't there`);
    }
  });

  test("types a site's code under the tsconfig base, with each module's declarations", () => {
    execFileSync("tsc", ["-p", "."], { cwd: dir, encoding: "utf8" });
    const shown = JSON.parse(
      execFileSync("tsc", ["--showConfig", "-p", "."], { cwd: dir }).toString(),
    );
    assert.equal(shown.compilerOptions.strict, true);
    assert.equal(shown.compilerOptions.noEmit, true);
  });

  test("gives Prettier its configuration by the package's name", () => {
    const script =
      'const { resolveConfig } = await import("prettier");' +
      'console.log(JSON.stringify(await resolveConfig("site.ts")));';
    const resolved = JSON.parse(node("--input-type=module", "-e", script));
    const exported = JSON.parse(readFileSync(join(root, "src", "prettier.json"), "utf8"));
    assert.deepEqual(resolved, exported);
  });

  test("builds a site with both plugins, the stylesheet bundled from its link", () => {
    node(bin("vite", "vite"), "build", "--logLevel", "warn");
    const index = readFileSync(join(dir, "dist", "index.html"), "utf8");
    assert.match(index, /<title>The pack's site<\/title>/);
    assert.match(index, /<script type="module" blocking="render" crossorigin src=/);
    assert.match(index, /<a href="a.html">A page<\/a>/);
    const sheets = listFiles(join(dir, "dist", "assets")).filter((file) => file.endsWith(".css"));
    assert.equal(sheets.length, 1, `want one bundled sheet, found ${sheets.join(", ")}`);
    const sheet = readFileSync(join(dir, "dist", "assets", sheets[0]), "utf8");
    assert.match(sheet, /@layer site\s*\{/);
  });

  test("lints the site and its build clean with the exported config", () => {
    node(bin("eslint", "eslint"), ".");
  });

  test("checks the site's copied tree against its record with the exported check", () => {
    const record = {
      repository: "source",
      url: "https://github.com/owner/source",
      commit: "0123456789abcdef0123456789abcdef01234567",
      files: Object.fromEntries(
        ["README.md", "a.md"].map((path) => [
          path,
          execFileSync("git", ["hash-object", join(dir, "content", path)], {
            encoding: "utf8",
          }).trim(),
        ]),
      ),
    };
    writeFileSync(join(dir, "content.json"), JSON.stringify(record));
    const script =
      `const { checkContent } = await import("${name}/content.js");` +
      "console.log(JSON.stringify(checkContent('.')));";
    assert.deepEqual(JSON.parse(node("--input-type=module", "-e", script)), []);
  });
});
