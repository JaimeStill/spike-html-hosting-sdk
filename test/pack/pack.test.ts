// The pack check: pnpm pack's tarball of the build, installed into a scratch site in TMPDIR,
// removed after, and each export resolved from it as a site resolves it, through the manifest's exports:
// each JS module imported in node, its declarations typing a site's code under the tsconfig base,
// the Prettier configuration resolved by Prettier, and the stylesheet linked by a site's page and
// bundled by Vite, in a build that runs the three plugins, its CSS module script rewritten, lints
// clean under the exported config, and whose copied tree the content check holds to its record. The tarball carries the template, the
// scaffold and currency bins, and the reusable workflows beside the build, and a pnpm install of it
// links the currency bin, which runs in the installing site; test/scaffold/ runs the scaffold.
//
// The install reads no network: the tarball is extracted to the site's node_modules, and each
// package its manifest declares, its dependencies and its peers, is linked there from the
// repository's own install, as pnpm links a package into its virtual store, with the site's own
// tools, prettier and @types/node, beside them. pnpm's offline install can't stand in for it: after
// mise run install's frozen install it holds no registry metadata to resolve the site's manifest.
// A module the package imports and its manifest doesn't declare isn't linked, so it fails to load.
// The links put the CSS module plugin at its realpath in the repository's install, so its import
// of rolldown/utils, which it doesn't declare, resolves there, as it does in a site's real install
// only through pnpm's hoist (src/css-module-scripts.ts); this install can't show that hoist.
// The bin's site is a pnpm install of the tarball, offline, its store and cache in the scratch
// directory, each package the manifest declares overridden by a link: to the repository's install,
// so pnpm fetches nothing and links the bin as it does for a site.

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
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
  "./markdown-pages.js": [
    "docks",
    "frontMatterText",
    "markdownPages",
    "pageFile",
    "pageHeader",
    "pageUrl",
    "render",
    "sectionTree",
    "siteIndex",
  ],
  "./syntax.js": ["builtinSyntax", "checkSyntax", "createSyntax"],
  "./eslint.js": ["build", "config"],
  "./content.js": ["blob", "checkContent"],
  "./served.js": ["base", "command", "served"],
  "./browser.js": [
    "blocksRender",
    "crawl",
    "definesEveryElement",
    "fitsNarrowWidth",
    "highlightsEachPalette",
    "holdsBetweenDocks",
    "holdsReadingWidth",
    "keepsNavigationWords",
    "opensKeysHelp",
    "opensThemeMenu",
    "requestsUnderBase",
    "shell",
    "startsUnderHeader",
    "staysUnsaved",
    "stepsEachFacet",
  ],
  "./css-module-scripts.js": ["cssModuleScripts"],
  "./screenshots.js": [
    "capture",
    "contentPages",
    "description",
    "keepsCaptures",
    "leavesNoCapture",
  ],
};

/** The files the tarball carries beside the build and the template: the bins, and the reusable
 * workflows a site calls from a release tag's tree. */
const carried = [
  "bin/currency.sh",
  "bin/new.js",
  ".github/workflows/site-ci.yml",
  ".github/workflows/site-pages.yml",
];

/** The files a site reads as they are, by their subpath. */
const files = ["./tsconfig.json", "./prettier.json", "./site.css"];

/** The scratch site's files: a copied tree and its record, the shell its pages fill, its entry
 * importing the foundation's theme menu, which adopts a CSS module script, a Vite config running
 * the three plugins, a lint config spreading the SDK's, a tsconfig on the base, and code that
 * types against each JS export's declarations. */
const site: Record<string, string> = {
  "package.json": JSON.stringify({ name: "site", private: true, type: "module" }),
  "content/README.md": "# The pack's site\n\n[A page](a.md)\n\n```sh\necho highlighted\n```\n",
  "content/a.md": "---\nname: A page\n---\n\nBody.\n",
  "index.html":
    "<!doctype html>\n<html><head><title></title>\n" +
    `<link rel="stylesheet" href="${name}/site.css" />\n` +
    '<script type="module" src="./main.js"></script>\n' +
    "</head><body><main></main></body></html>\n",
  // The page's entry, which loads the foundation's theme menu and its CSS module script. A site's
  // own code runs on node, as the exported config's globals have it; the modules its page loads
  // are the foundation's.
  "main.js":
    'import "@jaimestill/spike-html-apps-foundation/theme-menu.js";\nconsole.log("ready");\n',
  "vite.config.js":
    `import { defineConfig } from "vite";\n` +
    `import { cssModuleScripts } from "${name}/css-module-scripts.js";\n` +
    `import { markdownPages } from "${name}/markdown-pages.js";\n` +
    `import { renderBlocking } from "${name}/render-blocking.js";\n` +
    "export default defineConfig({\n" +
    "  publicDir: false,\n" +
    "  appType: 'mpa',\n" +
    "  plugins: [\n" +
    "    cssModuleScripts(),\n" +
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
    `import { cssModuleScripts } from "${name}/css-module-scripts.js";\n` +
    `import { build, config } from "${name}/eslint.js";\n` +
    `import { markdownPages, render } from "${name}/markdown-pages.js";\n` +
    `import type { Source } from "${name}/markdown-pages.js";\n` +
    `import { renderBlocking } from "${name}/render-blocking.js";\n` +
    `import { base, served } from "${name}/served.js";\n` +
    `import { crawl, shell } from "${name}/browser.js";\n` +
    `import type { Check, Crawled } from "${name}/browser.js";\n` +
    `import { contentPages, description } from "${name}/screenshots.js";\n` +
    `import type { Captured } from "${name}/screenshots.js";\n` +
    'import type { Description } from "@jaimestill/spike-html-apps-tooling/screenshots.js";\n' +
    'import type { Server } from "@jaimestill/spike-html-apps-tooling/server.js";\n' +
    'import type { Page } from "@jaimestill/spike-html-apps-tooling/browser.js";\n' +
    "const source: Source = { pages: new Set(), external: new Set(), repository: '', ref: '' };\n" +
    "export const plugins: Plugin[] = [\n" +
    "  cssModuleScripts(),\n" +
    "  renderBlocking(),\n" +
    "  markdownPages({ dir: 'content', repository: '', ref: '' }),\n" +
    "];\n" +
    "export const lint: Config[] = config;\n" +
    "export const globs: string[] = build;\n" +
    "export const problems: string[] = checkContent('.');\n" +
    "export const hash: string = blob(new Uint8Array());\n" +
    "export const title: string = render('a.md', '# A', source).title;\n" +
    "export const under: string = base('.');\n" +
    "export const serving: () => Promise<Server> = () => served('.');\n" +
    "export const checks: Check[] = Object.values(shell);\n" +
    "export const crawling: (page: Page) => Promise<Crawled> = (page) => crawl(page, '', '.');\n" +
    "export const described: Description = description({ root: '.', pages: contentPages('.') });\n" +
    "export type Run = Captured;\n",
};

let scratch: string;
let tarballFiles: string[];
let dir: string;
let manifest: {
  exports: Record<string, unknown>;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  bin: Record<string, string>;
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
  test("is the build, the template, the bins, the reusable workflows, and the package's files", () => {
    const built = listFiles(join(root, "dist")).map((path) => `dist/${path}`);
    assert.ok(built.length > 0, "mise run build wrote no dist/");
    // The template whole, its dotfiles among it, and its gitignore under the name a pack keeps.
    const template = listFiles(join(root, "template")).map((path) => `template/${path}`);
    assert.ok(template.includes("template/gitignore"), "the template holds its gitignore");
    assert.ok(template.includes("template/.github/workflows/pages.yml"));
    assert.deepEqual(
      tarballFiles,
      [...built, ...template, ...carried, "LICENSE", "README.md", "package.json"].sort(),
    );
  });

  test("carries each reusable workflow as the repository holds it, on workflow_call", () => {
    for (const path of carried.filter((path) => path.startsWith(".github/"))) {
      const packed = readFileSync(join(dir, "node_modules", name, path), "utf8");
      assert.equal(packed, readFileSync(join(root, path), "utf8"), `${path} is packed as it is`);
      assert.match(packed, /^on:\n {2}workflow_call:$/m, `${path} is a reusable workflow`);
    }
  });

  test("names the scaffold bin after the package, which dlx runs, each bin a packed file", () => {
    // pnpm dlx and npm exec run, of a package's several bins, the one its unscoped name names.
    const unscoped = name.slice(name.indexOf("/") + 1);
    assert.equal(manifest.bin[unscoped], "./bin/new.js");
    for (const path of Object.values(manifest.bin)) {
      assert.ok(tarballFiles.includes(path.replace(/^\.\//, "")), `${path} is packed`);
    }
  });

  test("links the currency bin in a pnpm install of the tarball, and runs it", () => {
    const site = join(scratch, "bin-site");
    mkdirSync(site);
    const tarball = readdirSync(scratch).find((file) => file.endsWith(".tgz")) as string;
    // The site's one pin, the tarball's file: path, is one the bin can't compare, which it reports
    // with no lookup, so the run needs no network past mise outdated, stubbed: it reads the
    // installing site's package.json, from its own directory.
    writeFileSync(
      join(site, "package.json"),
      JSON.stringify({
        name: "bin-site",
        private: true,
        devDependencies: { [name]: `file:${join(scratch, tarball)}` },
      }),
    );
    const linked = [
      ...Object.keys(manifest.dependencies),
      ...Object.keys(manifest.peerDependencies),
    ];
    const overrides = [...new Set(linked)].map(
      (pkg) =>
        `  ${JSON.stringify(pkg)}: ${JSON.stringify(`link:${realpathSync(join(root, "node_modules", pkg))}`)}`,
    );
    writeFileSync(join(site, "pnpm-workspace.yaml"), `overrides:\n${overrides.join("\n")}\n`);
    execFileSync(
      "pnpm",
      [
        "install",
        "--offline",
        "--ignore-scripts",
        "--config.auto-install-peers=false",
        `--store-dir=${join(scratch, "store")}`,
        `--config.cache-dir=${join(scratch, "cache")}`,
      ],
      { cwd: site, stdio: "ignore" },
    );
    const stubs = join(scratch, "stubs");
    mkdirSync(stubs);
    writeFileSync(join(stubs, "mise"), "#!/usr/bin/env bash\necho '{}'\n");
    chmodSync(join(stubs, "mise"), 0o755);
    const { status, stdout, stderr } = spawnSync(
      join(site, "node_modules", ".bin", "spike-html-hosting-currency"),
      [],
      {
        cwd: site,
        env: { ...process.env, PATH: `${stubs}:${process.env.PATH}` },
        encoding: "utf8",
      },
    );
    assert.equal(stderr, "");
    assert.equal(
      stdout,
      `package.json: ${name} file:${join(scratch, tarball)} -> can't compare this form of pin\n`,
    );
    assert.equal(status, 1);
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

  test("builds a site with the three plugins, the stylesheet bundled from its link", () => {
    node(bin("vite", "vite"), "build", "--logLevel", "warn");
    const index = readFileSync(join(dir, "dist", "index.html"), "utf8");
    assert.match(index, /<title>The pack's site<\/title>/);
    assert.match(index, /<script type="module" blocking="render" crossorigin src=/);
    assert.match(index, /<a href="a.html">A page<\/a>/);
    // The page's stylesheets bundled into one, and the syntax themes' generated one beside it,
    // which the page links: its classes from the packed Flexoki copy and Shiki's own themes.
    const css = listFiles(join(dir, "dist", "assets")).filter((file) => file.endsWith(".css"));
    const sheets = css.filter((file) => !file.startsWith("syntax-"));
    const syntax = css.filter((file) => file.startsWith("syntax-"));
    assert.equal(sheets.length, 1, `want one bundled sheet, found ${sheets.join(", ")}`);
    assert.equal(syntax.length, 1, `want one syntax sheet, found ${syntax.join(", ")}`);
    const sheet = readFileSync(join(dir, "dist", "assets", sheets[0]), "utf8");
    assert.match(sheet, /@layer site\s*\{/);
    assert.ok(index.includes(`<link rel="stylesheet" href="/assets/${syntax[0]}">`), index);
    assert.match(index, /<pre class="shiki [^"]*" tabindex="0"><code><span class="line">/);
    const generated = readFileSync(join(dir, "dist", "assets", syntax[0]), "utf8");
    assert.match(generated, /\[data-palette="flexoki"\] \.shiki span/);
    // The theme menu's CSS module script, rewritten to a constructed sheet; the lint below finds
    // none left.
    const scripts = listFiles(join(dir, "dist", "assets")).filter((file) => file.endsWith(".js"));
    const code = scripts.map((file) => readFileSync(join(dir, "dist", "assets", file), "utf8"));
    assert.ok(
      code.some((text) => text.includes("new CSSStyleSheet")),
      "the theme menu's sheet is constructed",
    );
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
