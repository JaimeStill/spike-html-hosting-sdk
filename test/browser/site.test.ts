// The SDK's browser checks at their seam, on the fixture site's build, as a site's browser tier
// runs them: test/fixtures/site/dist/, served under its base by served(), in the pinned
// chrome-headless-shell. Each shell check is a test on a fresh page of the index, and the crawl
// reaches every page content.json records, the one no body link reaches among them, through the
// site index every page carries. With one component's module kept from defining its element, as a
// shell that fails to load it leaves it, the site nav's or the Pages drawer's, the shell's
// definition check and the crawl each fail, naming the page and the tag. With a sheet that breaks
// the site index's words in a narrow column, or holds the docked drawer's column under 16rem, the
// navigation check fails, naming the width and the word or the column.

import assert from "node:assert/strict";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";

import { launch } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Browser, Page } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Server } from "@jaimestill/spike-html-apps-tooling/server.js";

import { crawl, definesEveryElement, keepsNavigationWords, shell } from "../../src/browser.ts";
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

/** Opens a page on which customElements.define skips tag, before any of the page's scripts run, so
 * the element stays undefined as when the shell fails to load its component's module. */
async function withUndefined(tag: string): Promise<Page> {
  const page = await browser.open("about:blank");
  await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
    source: `{
      const define = customElements.define.bind(customElements);
      customElements.define = (name, ...rest) => {
        if (name !== ${JSON.stringify(tag)}) define(name, ...rest);
      };
    }`,
  });
  return page;
}

/** Opens a page that adds a sheet of css, after the page's own, once its document is parsed. */
async function withSheet(css: string): Promise<Page> {
  const page = await browser.open("about:blank");
  await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
    source: `document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = ${JSON.stringify(css)};
      document.head.append(style);
    });`,
  });
  return page;
}

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

  test("the crawl reaches every recorded page, the one no body links through the index", async (t) => {
    const page = await browser.open("about:blank");
    try {
      const crawled = await crawl(page, server.origin, root);
      t.diagnostic(`${crawled.pages} pages, ${crawled.links} in-site links`);
      assert.equal(crawled.pages, 4);
      assert.deepEqual(crawled.unreachable, []);
    } finally {
      await page.close();
    }
  });
});

for (const tag of ["sl-site-nav", "sl-drawer"]) {
  describe(`the fixture site with ${tag} never defined`, () => {
    const named = new RegExp(`/fixture-site/: every custom element is defined; ${tag}`);

    test("the definition check fails, naming the index and the tag", async () => {
      const page = await withUndefined(tag);
      try {
        await assert.rejects(definesEveryElement(page, server.origin), (error: Error) => {
          assert.match(error.message, named);
          return true;
        });
      } finally {
        await page.close();
      }
    });

    test("the crawl fails on the index, naming the tag", async () => {
      const page = await withUndefined(tag);
      try {
        await assert.rejects(crawl(page, server.origin, root), (error: Error) => {
          assert.match(error.message, named);
          return true;
        });
      } finally {
        await page.close();
      }
    });
  });
}

describe("the fixture site with its navigation cramped", () => {
  test("a site index link broken inside a word fails the navigation check", async () => {
    // The index's list in a column narrower than its words, each breaking anywhere.
    const page = await withSheet(
      "sl-site-index { display: block; inline-size: 2rem; } sl-site-index a { word-break: break-all; }",
    );
    try {
      await assert.rejects(keepsNavigationWords(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: at 1376px no navigation link breaks inside a word; \S/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });

  test("a docked column under 16rem fails the navigation check", async () => {
    // The grid's side columns held to 8rem, the docked drawer's among them.
    const page = await withSheet(
      "body { grid-template-columns: 8rem minmax(0, 80ch) 8rem !important; }",
    );
    try {
      await assert.rejects(keepsNavigationWords(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: at 1376px the docked sl-drawer is [\d.]+px wide, under 16rem/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });
});
