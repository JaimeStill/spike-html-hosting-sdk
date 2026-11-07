// The palette check, highlightsEachPalette, at its seam, on the Noctis fixture's two builds:
// test/fixtures/noctis/, whose page registers spike-html-apps-noctis beside every built-in profile,
// built with a Noctis syntax theme appended to the SDK's into dist/, and without it into
// plain/dist/ (mise run build:fixture-noctis builds both). Each is served under its base by Vite's
// preview, as served() serves a site, in the pinned chrome-headless-shell. The check passes the
// first, with noctis in the settings, and fails the second, naming noctis, whose code renders
// plain there. The Noctis copy the first build reads is held to its record.

import assert from "node:assert/strict";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";

import { launch } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Browser } from "@jaimestill/spike-html-apps-tooling/browser.js";
import { freePort, start } from "@jaimestill/spike-html-apps-tooling/process.js";
import type { Server } from "@jaimestill/spike-html-apps-tooling/server.js";

import { highlightsEachPalette } from "../../src/browser.ts";
import type { Check } from "../../src/browser.ts";
import { checkContent } from "../../src/content.ts";
import { base, command, served } from "../../src/served.ts";

const root = join(import.meta.dirname, "../fixtures/noctis");

/** The plain build, plain/dist/, served as served() serves dist/: Vite's preview, under the base,
 * its output directory named, since the fixture's config gives it only for the plain build. */
async function servedPlain(): Promise<Server> {
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}${base(root)}`;
  const preview = await start(
    command(root, "vite"),
    [
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      `${port}`,
      "--strictPort",
      "--outDir",
      "plain/dist",
    ],
    { cwd: root, ready: origin },
  );
  return {
    origin,
    stop: async () => {
      await preview.stop();
    },
  };
}

let noctis: Server;
let plain: Server;
let browser: Browser;

before(async () => {
  noctis = await served(root);
  plain = await servedPlain();
  browser = await launch();
});
after(async () => {
  await browser?.close();
  await noctis?.stop();
  await plain?.stop();
});

/** Runs the check on a fresh page of the site at origin. */
async function run(check: Check, origin: string): Promise<void> {
  const page = await browser.open("about:blank");
  try {
    await check(page, origin);
  } finally {
    await page.close();
  }
}

describe("the palette check on the Noctis fixture", () => {
  test("the Noctis copy is liviuschera/noctis's, byte for byte, as its record holds", () => {
    assert.deepEqual(checkContent(join(root, "syntax/noctis")), []);
  });

  // The check holds the settings' color row to the registry's list, so the settings offer noctis.
  test("both builds register noctis after every built-in palette", async () => {
    for (const { origin } of [noctis, plain]) {
      const page = await browser.open("about:blank");
      try {
        await page.goto(origin);
        assert.deepEqual(
          await page.evaluate(
            `[...globalThis[Symbol.for("spike-html-apps-foundation.registry")].color]`,
          ),
          ["flexoki", "primer", "catppuccin", "everforest", "noctis"],
          origin,
        );
      } finally {
        await page.close();
      }
    }
  });

  test("passes with the Noctis syntax theme: each palette's code takes its theme", async () => {
    await run(highlightsEachPalette, noctis.origin);
  });

  test("fails without it, naming noctis, whose code renders plain", async () => {
    await assert.rejects(run(highlightsEachPalette, plain.origin), (error: Error) => {
      assert.match(error.message, /^noctis in light: .*renders plain/);
      return true;
    });
  });
});
