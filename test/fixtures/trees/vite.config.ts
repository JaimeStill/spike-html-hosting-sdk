// The trees fixture's build, as a root-style site's vite.config.ts builds: its index.html a hand
// page and briefs/orientation.html another, each an input of its own, and a page for each Markdown
// file of its two copied trees, content/github/ from .github and content/org/ from org, as
// content.json records them, each filling page.html, the shell its rendered pages share, into
// dist/, under the Pages base, /<package.json's name>/. The plugin's inputs concatenate with the
// hand pages', so all three are built. The SDK's own plugins, from its source, and the site
// stylesheet aliased to the source, as the fixture site's config has them.
// Adapted from test/fixtures/site/vite.config.ts: its plugins, with several trees, a shell of
// their own, and hand pages.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

import type { Tree } from "../../../src/content.ts";
import { cssModuleScripts } from "../../../src/css-module-scripts.ts";
import { markdownPages } from "../../../src/markdown-pages.ts";
import { renderBlocking } from "../../../src/render-blocking.ts";
import { base } from "../../../src/served.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
const content = JSON.parse(readFileSync(`${root}content.json`, "utf8")) as { trees: Tree[] };

export default defineConfig({
  base: base(root),
  resolve: {
    alias: {
      "@jaimestill/spike-html-hosting-sdk/site.css": fileURLToPath(
        new URL("../../../src/site.css", import.meta.url),
      ),
    },
  },
  plugins: [
    cssModuleScripts(),
    markdownPages({
      dir: "content",
      // Each tree's source; the org brief links the org repository's LICENSE, which it doesn't
      // copy.
      trees: content.trees.map(({ url, commit, repository }) => ({
        repository: url,
        ref: commit,
        external: repository === "org" ? ["LICENSE"] : [],
      })),
      shell: "page.html",
    }),
    renderBlocking(),
  ],
  publicDir: false,
  build: {
    outDir: "dist",
    target: "es2024",
    // The hand page's clip is emitted as a file under the base, as a site's video is, and never
    // inlined as a data: URL, which would leave the request check no network request of it.
    assetsInlineLimit: (file) => (file.endsWith(".webm") ? false : undefined),
    // The hand pages, which no shell fills: Vite builds index.html by default only with no input
    // given, and the plugin gives its pages.
    rolldownOptions: { input: [`${root}index.html`, `${root}briefs/orientation.html`] },
  },
  appType: "mpa",
});
