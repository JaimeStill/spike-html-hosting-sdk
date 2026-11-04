// The CSS module script rewrite, src/css-module-scripts.ts's cssModuleScripts, run in a Vite build
// of a fixture module in a scratch directory of TMPDIR, removed after: a layer's module, under
// node_modules/@jaimestill/, as a site installs the foundation, whose CSS module script the build
// rewrites to a constructed CSSStyleSheet holding the sheet's rules, the attribute gone. That a
// site's own build runs it is the builds' to show: the fixture site's, whose theme menu the browser
// tier finds adopting its sheet, the pack check's, and the scaffolded site's.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";

import { build } from "vite";
import type { Rolldown } from "vite";

import { cssModuleScripts } from "../../src/css-module-scripts.ts";

let scratch: string;
let code: string;

before(async () => {
  scratch = mkdtempSync(join(tmpdir(), "css-module-scripts-"));
  const layer = join(scratch, "node_modules", "@jaimestill", "layer");
  mkdirSync(layer, { recursive: true });
  writeFileSync(join(layer, "menu.css"), ":host { color: rebeccapurple; }\n");
  writeFileSync(
    join(layer, "menu.js"),
    'import sheet from "./menu.css" with { type: "css" };\n' + "export const sheets = [sheet];\n",
  );
  const output = (await build({
    root: scratch,
    configFile: false,
    logLevel: "silent",
    plugins: [cssModuleScripts()],
    build: {
      write: false,
      minify: false,
      rolldownOptions: { input: join(layer, "menu.js"), preserveEntrySignatures: "strict" },
    },
  })) as Rolldown.RolldownOutput;
  code = output.output
    .filter((file) => file.type === "chunk")
    .map((chunk) => chunk.code)
    .join("\n");
});
after(() => rmSync(scratch, { recursive: true, force: true }));

describe("the CSS module script rewrite", () => {
  test("rewrites a layer's CSS module script to a constructed CSSStyleSheet of its rules", () => {
    assert.match(code, /new CSSStyleSheet\(\)/);
    assert.match(code, /rebeccapurple/);
  });

  test("leaves no CSS module script, and no Lit CSSResult, in the build", () => {
    assert.doesNotMatch(code, /type:\s*["']css["']/);
    assert.doesNotMatch(code, /\.css["']/);
    assert.doesNotMatch(code, /unsafeCSS|lit/);
  });
});
