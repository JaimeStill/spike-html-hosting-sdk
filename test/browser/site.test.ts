// The SDK's browser checks at their seam, on the fixture site's build, as a site's browser tier
// runs them: test/fixtures/site/dist/, served under its base by served(), in the pinned
// chrome-headless-shell. Each shell check is a test on a fresh page of the index, and the crawl
// reaches every page content.json records, the one no link reaches among them.

import assert from "node:assert/strict";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";

import { launch } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Browser } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Server } from "@jaimestill/spike-html-apps-tooling/server.js";

import { crawl, shell } from "../../src/browser.ts";
import { served } from "../../src/served.ts";

const root = join(import.meta.dirname, "../fixtures/site");

let server: Server;
let browser: Browser;

before(async () => {
  server = await served(root);
  browser = await launch();
});
after(async () => {
  await browser?.close();
  await server?.stop();
});

describe("the fixture site under its base", () => {
  test("is served at /<package.json's name>/", () => {
    assert.match(server.origin, /^http:\/\/127\.0\.0\.1:\d+\/fixture-site\/$/);
  });

  for (const [name, check] of Object.entries(shell)) {
    test(name, async () => {
      const page = await browser.open("about:blank");
      try {
        await check(page, server.origin);
      } finally {
        await page.close();
      }
    });
  }

  test("the crawl reaches every recorded page, the unlinked one restarted from", async (t) => {
    const page = await browser.open("about:blank");
    try {
      const crawled = await crawl(page, server.origin, root);
      t.diagnostic(`${crawled.pages} pages, ${crawled.links} in-site links`);
      assert.equal(crawled.pages, 4);
      assert.deepEqual(crawled.unreachable, ["orphan.html"]);
    } finally {
      await page.close();
    }
  });
});
