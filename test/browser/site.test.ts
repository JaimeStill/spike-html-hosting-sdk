// The SDK's browser checks at their seam, on the fixture site's build, as a site's browser tier
// runs them: test/fixtures/site/dist/, served under its base by served(), in the pinned
// chrome-headless-shell. Each shell check is a test on a fresh page of the index, and the crawl
// reaches every page content.json records, the one no body link reaches among them, through the
// site index every page carries. With one component's module kept from defining its element, as a
// shell that fails to load it leaves it, the site nav's or the Pages drawer's, the shell's
// definition check and the crawl each fail, naming the page and the tag. With a sheet that breaks
// the site index's words in a narrow column, or holds the docked drawer's column under 16rem, the
// navigation check fails, naming the width and the word or the column. A px below and at each of
// the layout's docks, on the guide's page, which has both side columns, site.css lays each out as
// its component's dock attribute has it: a docked tree beside main at its end and a bar above it
// otherwise, a docked drawer beside main at its start with the Pages button hidden, and the button
// shown otherwise. With a sheet that holds the end column to 16rem on a page with no section tree,
// the between-docks check fails on the index, naming main's off-center margins; with the shell's
// keys help dialog removed, the keys help check fails, naming the page.

import assert from "node:assert/strict";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";

import { launch, SETTLED } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Browser, Page } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Server } from "@jaimestill/spike-html-apps-tooling/server.js";

import {
  crawl,
  definesEveryElement,
  holdsBetweenDocks,
  keepsNavigationWords,
  opensKeysHelp,
  shell,
} from "../../src/browser.ts";
import { docks } from "../../src/markdown-pages.ts";
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

describe("the fixture site's layout at its docks", () => {
  /** A dock's width in px, its rem 16px, as a media query reads it. */
  const px = (dock: string): number => parseFloat(dock) * 16;
  const widths = [docks.tree, docks.index].flatMap((dock) => [px(dock) - 1, px(dock)]);

  for (const width of widths) {
    test(`at ${width}px places each side column as its component docks it`, async () => {
      const page = await browser.open("about:blank");
      try {
        await page.cdp("Emulation.setDeviceMetricsOverride", {
          width,
          height: 900,
          deviceScaleFactor: 1,
          mobile: false,
        });
        await page.goto(`${server.origin}guide/`);
        await page.evaluate(SETTLED);
        const layout: {
          tree: { docked: boolean; beside: boolean; above: boolean };
          drawer: { docked: boolean; beside: boolean };
          opener: boolean;
        } = await page.evaluate(`(() => {
          const main = document.querySelector("main").getBoundingClientRect();
          const tree = document.querySelector("sl-section-tree");
          const drawer = document.querySelector("sl-drawer#pages");
          const t = tree.getBoundingClientRect();
          const d = drawer.getBoundingClientRect();
          return {
            tree: {
              docked: tree.matches(":state(docked)"),
              beside: t.left >= main.right,
              above: t.bottom <= main.top,
            },
            drawer: {
              docked: drawer.matches(":state(docked)"),
              beside: d.width > 0 && d.right <= main.left,
            },
            opener: getComputedStyle(document.querySelector(".pages-opener")).display !== "none",
          };
        })()`);
        assert.equal(layout.tree.docked, width >= px(docks.tree), "the tree docks from its dock");
        assert.ok(
          layout.tree.docked ? layout.tree.beside : layout.tree.above,
          `the tree is ${layout.tree.docked ? "beside main, at its end" : "a bar above main"}`,
        );
        assert.equal(
          layout.drawer.docked,
          width >= px(docks.index),
          "the drawer docks from its dock",
        );
        if (layout.drawer.docked) {
          assert.ok(layout.drawer.beside, "the docked drawer is beside main, at its start");
        }
        assert.equal(
          layout.opener,
          !layout.drawer.docked,
          "the Pages button is shown exactly where the drawer is not docked",
        );
      } finally {
        await page.close();
      }
    });
  }
});

describe("the fixture site with its index off-center between the docks", () => {
  test("the end column held to 16rem with no section tree fails the between-docks check", async () => {
    // Slice 6b's grid, the tree's 16rem end column on every page.
    const page = await withSheet(
      "@media (width >= 70rem) { body { grid-template-columns: minmax(0, 1fr) minmax(0, 80ch) minmax(16rem, 1fr) !important; } }",
    );
    try {
      await assert.rejects(holdsBetweenDocks(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: at 1200px, with no section tree, main is centered, [\d.]+px and [\d.]+px/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });
});

describe("the fixture site with no keys help dialog", () => {
  test("the keys help check fails, naming the page", async () => {
    // The shell's dialog#help removed before any of the page's scripts run.
    const page = await browser.open("about:blank");
    await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `document.addEventListener("DOMContentLoaded", () => document.querySelector("dialog#help")?.remove());`,
    });
    try {
      await assert.rejects(opensKeysHelp(page, server.origin), (error: Error) => {
        assert.match(error.message, /\/fixture-site\/: \? opens the keys help dialog/);
        return true;
      });
    } finally {
      await page.close();
    }
  });
});
