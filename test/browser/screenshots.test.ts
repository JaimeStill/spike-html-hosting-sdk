// The capture run at its seam, on the fixture site's capture file, as a site's browser tier runs
// it: the tooling's spike-html-apps-screenshots on the index, light, to the terminal, under a
// scratch TMPDIR. It leaves nothing there, and with --keep leaves what it printed. An unknown
// --palette exits 2 with the tooling's message, which names the page by its path, the index's
// /<repository>/.

import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, test } from "node:test";

import { capture, keepsCaptures, leavesNoCapture } from "../../src/screenshots.ts";

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
});
