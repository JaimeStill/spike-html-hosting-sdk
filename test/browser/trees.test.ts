// The SDK's checks on a site of several copied trees and hand pages, as a root-style site's browser
// tier runs them: test/fixtures/trees/dist/, served under its base by served(), in the pinned
// chrome-headless-shell. Its copies, two trees, .github's under github/ and org's under org/, are
// held to their record. Every shell check is a test on each of three pages, by its URL apart from
// the base: the hand index at the base, the hand page at briefs/orientation.html, and the org
// brief's rendered page, whose alerts are callouts. Taking the hand page's URL for the base fails
// the request check, its assets being under the base and not under the page, which is why the
// checks take the two apart. Each page runs only its own scripts, though one chunk holds them all
// (render-blocking.ts): a hand page, with no Pages drawer, throws nothing, where the shell's
// drawer wiring would. The crawl, from the hand index, checks every copied page of both
// trees and loads each hand page it reaches without failing on it, and with a copied page answered
// 404 it fails, naming the page. The capture file describes the hand pages and every tree's pages
// at their paths under the base. The hand pages and the rendered pages' shell hold glyph markers
// in their buttons, which the build fills with the icons layer's svgs, none left, and the shell
// checks' glyph check holds each button to its glyph.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";

import { launch, SETTLED } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Browser } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Server } from "@jaimestill/spike-html-apps-tooling/server.js";
import gear from "@jaimestill/spike-html-hosting-icons/octicon/gear-16";
import question from "@jaimestill/spike-html-hosting-icons/octicon/question-16";
import x from "@jaimestill/spike-html-hosting-icons/octicon/x-16";

import { crawl, requestsUnderBase, shell } from "../../src/browser.ts";
import { checkContent } from "../../src/content.ts";
import { contentPages, description } from "../../src/screenshots.ts";
import { served } from "../../src/served.ts";

const root = join(import.meta.dirname, "../fixtures/trees");

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

describe("the trees fixture under its base", () => {
  test("holds each tree's copies to its record", () => {
    assert.deepEqual(checkContent(root), []);
  });

  for (const path of ["", "briefs/orientation.html", "org/briefs/orientation.html"]) {
    describe(`the shell checks on ${path || "the hand index"}`, () => {
      for (const [name, check] of Object.entries(shell)) {
        test(name, async () => {
          const page = await browser.open("about:blank");
          try {
            await check(page, server.origin, `${server.origin}${path}`);
          } finally {
            await page.close();
          }
        });
      }
    });
  }

  for (const path of ["", "briefs/orientation.html"]) {
    test(`${path || "the hand index"} runs only its own scripts, throwing nothing`, async () => {
      const page = await browser.open("about:blank");
      const thrown: string[] = [];
      page.on(
        "Runtime.exceptionThrown",
        ({ exceptionDetails }: { exceptionDetails: { exception?: { description?: string } } }) =>
          thrown.push(exceptionDetails.exception?.description ?? "an exception"),
      );
      await page.cdp("Runtime.enable");
      try {
        await page.goto(`${server.origin}${path}`);
        await page.evaluate(SETTLED);
        assert.deepEqual(thrown, []);
        assert.equal(await page.evaluate(`!!customElements.get("sl-drawer")`), false);
      } finally {
        await page.close();
      }
    });
  }

  for (const path of ["index.html", "briefs/orientation.html", "org/briefs/orientation.html"]) {
    test(`${path}'s glyph markers are filled at build with the icons layer's svgs`, () => {
      const built = readFileSync(join(root, "dist", path), "utf8");
      for (const [name, svg] of Object.entries({ question, gear, x })) {
        assert.ok(built.includes(svg), `the built page holds the icons layer's ${name}`);
      }
      assert.doesNotMatch(built, /data-icon/);
    });
  }

  test("the hand page's URL taken for the base fails the request check", async () => {
    const page = await browser.open("about:blank");
    const url = `${server.origin}briefs/orientation.html`;
    try {
      await assert.rejects(requestsUnderBase(page, url), (error: Error) => {
        assert.match(
          error.message,
          /briefs\/orientation\.html: every request resolves under the base/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });

  test("the crawl checks every copied page of both trees, the hand pages loaded", async (t) => {
    const page = await browser.open("about:blank");
    try {
      const crawled = await crawl(page, server.origin, root);
      t.diagnostic(`${crawled.pages} pages, ${crawled.links} in-site links`);
      assert.equal(crawled.pages, 5);
      assert.deepEqual(crawled.unreachable, []);
      assert.deepEqual(crawled.hand, ["", "briefs/orientation.html"]);
    } finally {
      await page.close();
    }
  });

  test("a copied page the build doesn't serve fails the crawl, naming it", async () => {
    const page = await browser.open("about:blank");
    // The org tree's next brief answered 404, as a build that never wrote it leaves it.
    page.on("Fetch.requestPaused", ({ requestId }: { requestId: string }) => {
      void page.cdp("Fetch.fulfillRequest", { requestId, responseCode: 404, body: "" });
    });
    await page.cdp("Fetch.enable", { patterns: [{ urlPattern: "*/org/briefs/next.html" }] });
    try {
      await assert.rejects(crawl(page, server.origin, root), (error: Error) => {
        assert.match(error.message, /\/fixture-trees\/org\/briefs\/next\.html loaded with 404/);
        return true;
      });
    } finally {
      await page.close();
    }
  });

  test("the capture file describes the hand pages and every tree's pages under the base", () => {
    const pages = ["index.html", "briefs/orientation.html", ...contentPages(root)];
    assert.deepEqual(
      description({ root, pages }).pages.map(({ name, path }) => [name, path]),
      [
        ["index", "/fixture-trees/"],
        ["briefs/orientation", "/fixture-trees/briefs/orientation.html"],
        ["github/profile", "/fixture-trees/github/profile/"],
        ["org/briefs/next", "/fixture-trees/org/briefs/next.html"],
        ["org/briefs/orientation", "/fixture-trees/org/briefs/orientation.html"],
      ],
    );
  });
});
