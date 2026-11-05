// The Noctis fixture's build, as the fixture site's vite.config.ts builds, its one page's code
// highlighted under the SDK's syntax themes and a Noctis one appended: Noctis Hibernus in light
// and Noctis Obscuro in dark, syntax/noctis/content/, byte for byte as liviuschera/noctis holds
// them, held to their record, syntax/noctis/content.json, by the browser tier's checkContent.
// With FIXTURE_SYNTAX=plain it builds the same site without the Noctis entry, into plain/dist/,
// so noctis, which the page still registers, matches no syntax rule and its code renders plain:
// the build the browser tier's palette check fails on.
// Adapted from spike-html-hosting-sdk (237a769): test/fixtures/site/vite.config.ts, the syntax
// themes, and the plain build.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { ThemeRegistrationAny } from "shiki";
import { defineConfig } from "vite";

import { cssModuleScripts } from "../../../src/css-module-scripts.ts";
import { markdownPages } from "../../../src/markdown-pages.ts";
import { renderBlocking } from "../../../src/render-blocking.ts";
import { base } from "../../../src/served.ts";
import { builtinSyntax } from "../../../src/syntax.ts";
import type { SyntaxTheme } from "../../../src/syntax.ts";

const root = fileURLToPath(new URL(".", import.meta.url));

/** A theme of the Noctis copy, by its path from the copy's root. */
const theme = (path: string): ThemeRegistrationAny =>
  JSON.parse(
    readFileSync(new URL(`./syntax/noctis/content/${path}`, import.meta.url), "utf8"),
  ) as ThemeRegistrationAny;

const noctis: SyntaxTheme = {
  palette: "noctis",
  light: theme("themes/hibernus.json"),
  dark: theme("themes/obscuro.json"),
};

const plain = process.env.FIXTURE_SYNTAX === "plain";

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
      repository: "https://github.com/JaimeStill/fixture-noctis",
      ref: "0123456789abcdef0123456789abcdef01234567",
      syntax: plain ? builtinSyntax : [...builtinSyntax, noctis],
    }),
    renderBlocking(),
  ],
  publicDir: false,
  build: { outDir: plain ? "plain/dist" : "dist", target: "es2024" },
  appType: "mpa",
});
