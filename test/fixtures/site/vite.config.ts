// The fixture site's build, as a site's vite.config.ts builds: a page for each Markdown file in
// content/, in index.html's shell, and the foundation modules the shell loads, into dist/, under
// the Pages base, /<package.json's name>/, which served() serves it under too. The SDK's own
// plugins, from its source, and the site stylesheet the page links by the package's name, aliased
// to the source, so the fixture builds with no build of the SDK.
// Adapted from spike-html-hosting-architecture (18eaa89): vite.config.ts, its plugins the SDK's.

import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

import { cssModuleScripts } from "../../../src/css-module-scripts.ts";
import { markdownPages } from "../../../src/markdown-pages.ts";
import { renderBlocking } from "../../../src/render-blocking.ts";
import { base } from "../../../src/served.ts";

const root = fileURLToPath(new URL(".", import.meta.url));

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
      repository: "https://github.com/JaimeStill/fixture",
      ref: "0123456789abcdef0123456789abcdef01234567",
    }),
    renderBlocking(),
  ],
  publicDir: false,
  build: { outDir: "dist", target: "es2024" },
  appType: "mpa",
});
