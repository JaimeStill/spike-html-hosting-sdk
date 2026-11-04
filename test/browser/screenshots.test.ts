// The capture run at its seam, on the fixture site's capture file, as a site's browser tier runs
// it: the tooling's spike-html-apps-screenshots on the index, light, to the terminal, under a
// scratch TMPDIR. It leaves nothing there, and with --keep leaves what it printed. An unknown
// --palette exits 2 with the tooling's message, which names the page by its path, the index's
// /<repository>/. Each facet's default and each of --all's profiles is a name the index
// registers, which the bin checks only for the names a flag gives.

import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, test } from "node:test";

import { launch } from "@jaimestill/spike-html-apps-tooling/browser.js";

import {
  capture,
  contentPages,
  description,
  keepsCaptures,
  leavesNoCapture,
} from "../../src/screenshots.ts";
import { served } from "../../src/served.ts";

const root = join(import.meta.dirname, "../fixtures/site");
const config = join(root, "screenshots.config.ts");

describe("the screenshots command on the fixture site", () => {
  test("captures the index under TMPDIR and leaves nothing there", () => {
    leavesNoCapture(root, config);
  });

  test("with --keep, leaves every capture file it printed", () => {
    keepsCaptures(root, config);
  });

  test("an unknown --palette names the index by its URL path", () => {
    const { status, stderr, printed } = capture(root, config, "--palette", "nonesuch");
    assert.equal(status, 2, stderr);
    assert.deepEqual(printed, []);
    assert.match(stderr, /unknown palette nonesuch; the palettes \/fixture-site\/ registers: /);
  });

  test("names, as each default and in --all, only profiles the index registers", async () => {
    const described = description({ root, pages: contentPages(root) });
    assert.ok(described.profiles, "the description lists the registered profiles");
    const server = await served(root);
    const browser = await launch();
    try {
      const page = await browser.open(server.origin);
      const registered = await described.profiles(page);
      const named = [
        ...(described.facets ?? []).map(({ flag, default: name }) => [flag, name]),
        ...(described.all ?? []).flatMap((profile) => Object.entries(profile)),
      ];
      assert.ok(named.length > 0, "the description names profiles");
      for (const [flag, name] of named) {
        assert.ok(registered[flag]?.includes(name), `the index registers ${flag} ${name}`);
      }
    } finally {
      await browser.close();
      await server.stop();
    }
  });
});
