// The site's build (mise run build): a page for each Markdown file copied into content/, each
// index.html's shell filled with the file, and the foundation modules the shell loads, into dist/:
// static files GitHub Pages serves as the repository's project site, under /<repository>/. The
// base is that path, and the repository's name is package.json's name, the one place it is
// written; the SDK's served(), which the browser tier and the captures serve the build with, reads
// the same name.
//
// The plugins: the CSS module script rewrite, then the SDK's markdownPages, which renders the
// copied tree into pages and fails the build on a relative link it can't place, and its
// renderBlocking, which keeps each page's one entry script render-blocking. content.json records
// the copied tree's source, its repository and commit, which pin the links the pages make into the
// source on GitHub; test/unit/content.test.ts holds the copies to it.
// Adapted from spike-html-apps (529ec52): vite.external.config.ts, its plugins, with the base the
// Pages path and no preview host.
// Adapted from spike-html-hosting (cb0511c): vite.config.ts, its one page a page for each copied
// Markdown file.
// Adapted from spike-html-hosting-architecture (27d70e1): vite.config.ts, its plugins and its base
// the SDK's.
// From spike-html-hosting-sdk (v{{version}}): template/vite.config.ts.

import { fileURLToPath } from "node:url";

import { markdownPages } from "@jaimestill/spike-html-hosting-sdk/markdown-pages.js";
import { renderBlocking } from "@jaimestill/spike-html-hosting-sdk/render-blocking.js";
import { base } from "@jaimestill/spike-html-hosting-sdk/served.js";
import { defineConfig } from "vite";
import { standardCssModules } from "vite-plugin-standard-css-modules";

import content from "./content.json" with { type: "json" };

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: base(root),
  // CSS module scripts, `import sheet from "./x.css" with { type: "css" }`, which the
  // foundation's theme menu uses to adopt its sheet, and which Vite doesn't support. The plugin
  // rewrites each import carrying that attribute to a module whose default export is one
  // constructed CSSStyleSheet per file; include names the importers it parses, the layers'
  // modules, the only ones holding CSS module scripts. outputMode pins the CSSStyleSheet the menu
  // adopts, never Lit's CSSResult. It parses with rolldown/utils, which it doesn't declare, so
  // package.json declares rolldown at the version Vite resolves. The check's lint fails on any CSS
  // module script left in dist/ (eslint.config.js).
  plugins: [
    standardCssModules({
      include: ["**/node_modules/@jaimestill/**/*.js"],
      outputMode: "CSSStyleSheet",
    }),
    // external lists the files the source holds, and its pages link, that the site doesn't copy,
    // such as its LICENSE.
    markdownPages({
      dir: "content",
      repository: content.url,
      ref: content.commit,
      external: [],
    }),
    renderBlocking(),
  ],
  // No public directory: the pages and what they import are the whole site.
  publicDir: false,
  build: {
    outDir: "dist",
    target: "es2024",
  },
  // A multi-page site: a path no page builds to is a 404 in the preview, as it is on Pages, never
  // a fallback to the index.
  appType: "mpa",
});
