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
// the between-docks check fails on the index, naming main's off-center margins, and with the
// guide's tree moved to the start column it fails naming the tree. The index and the orphan page
// are shorter than the viewport at 390px, 1200px, and 1600px, so the body's min-height leaves room
// under them, and with v0.3.0's grid, whose rows stretch into it, the under-header check and the
// crawl fail on the index, naming the width and main's gap; at 390px, with a flex column whose auto
// margin pushes main to the body's end, the check fails as well, and with main pulled up into the
// header it fails naming the overlap. With the shell's keys help
// dialog removed, the Theme button's binding removed, the Theme button's kbd removed, as its markup
// before v0.3.1 had it, or a handler that opens the Pages drawer on P whatever the switch says,
// the keys help check fails, naming the page and the assertion. With the Help button's glyph
// removed, the Theme button's word shown beside its glyph, or the keys help's Close showing the
// Help button's glyph, the glyph check fails, naming the page and the button.

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
  showsGlyphs,
  startsUnderHeader,
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
      assert.deepEqual(crawled.hand, [], "every page is a copied file's");
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

  test("the section tree out of its end column fails the between-docks check", async () => {
    // The guide's docked tree moved to the start column, before main.
    const page = await withSheet(
      "@media (width >= 70rem) { body > .section-tree { grid-column: 1 !important; } }",
    );
    try {
      await assert.rejects(holdsBetweenDocks(page, `${server.origin}guide/`), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/guide\/: at 1200px the section tree is docked beside main/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });
});

describe("the fixture site's short pages", () => {
  for (const path of ["", "orphan.html"]) {
    for (const [width, height] of [
      [390, 844],
      [1200, 900],
      [1600, 900],
    ]) {
      test(`${path || "the index"} is shorter than a ${width}px viewport`, async () => {
        const page = await browser.open("about:blank");
        try {
          await page.cdp("Emulation.setDeviceMetricsOverride", {
            width,
            height,
            deviceScaleFactor: 1,
            mobile: false,
          });
          await page.goto(`${server.origin}${path}`);
          await page.evaluate(SETTLED);
          // The header's and main's heights, and the docked drawer's, the rows' content, apart
          // from where the grid places them.
          const content: number = await page.evaluate(`(() => {
            const height = (selector) => document.querySelector(selector)?.getBoundingClientRect().height ?? 0;
            const drawer = document.querySelector("sl-drawer#pages:state(docked)") ? height("sl-drawer#pages") : 0;
            return height("body > header") + Math.max(height("main"), drawer);
          })()`);
          assert.ok(
            content < height,
            `its rows' content, ${content}px, leaves room in the viewport`,
          );
        } finally {
          await page.close();
        }
      });
    }
  }
});

describe("the fixture site with v0.3.0's stretched rows", () => {
  // v0.3.0's grid, its rows left to stretch into the body's min-height.
  const css = "@media (width >= 70rem) { body { align-content: normal !important; } }";
  const named =
    /\/fixture-site\/: at 1200px main starts directly under the header, [\d.]+px below it, past the layout's 0px/;

  test("the under-header check fails on the index, naming the width and the gap", async () => {
    const page = await withSheet(css);
    try {
      await assert.rejects(startsUnderHeader(page, server.origin), (error: Error) => {
        assert.match(error.message, named);
        return true;
      });
    } finally {
      await page.close();
    }
  });

  test("the crawl fails on the index, naming the width and the gap", async () => {
    const page = await withSheet(css);
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

describe("the fixture site with main pushed down or up at 390px", () => {
  test("the under-header check fails with main at the end of a flex column", async () => {
    // An auto margin takes the room a short page leaves, as no margin of the layout's own would.
    const page = await withSheet(
      "@media (width < 70rem) { body { display: flex; flex-direction: column; } " +
        "main { margin-block-start: auto; } }",
    );
    try {
      await assert.rejects(startsUnderHeader(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: at 390px main starts directly under the header, [\d.]+px below it, past the layout's [\d.]+px/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });

  test("the under-header check fails with main pulled up into the header", async () => {
    const page = await withSheet("@media (width < 70rem) { main { margin-block-start: -3rem; } }");
    try {
      await assert.rejects(startsUnderHeader(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: at 390px main starts under the header, not into it/,
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

describe("the fixture site with its keys help wrong", () => {
  test("a binding missing from the dialog fails the keys help check", async () => {
    // The Theme button's T binding removed before keys.js reads the page's bindings.
    const page = await browser.open("about:blank");
    await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `document.addEventListener("DOMContentLoaded", () => document.querySelector("[commandfor=theme][data-keys]")?.removeAttribute("data-keys"));`,
    });
    try {
      await assert.rejects(opensKeysHelp(page, server.origin), (error: Error) => {
        assert.match(error.message, /\/fixture-site\/: the keys help lists the page's bindings/);
        return true;
      });
    } finally {
      await page.close();
    }
  });

  test("a header control that binds a key without showing it fails the keys help check", async () => {
    // The Theme button's markup before v0.3.1: its label alone, no kbd.
    const page = await browser.open("about:blank");
    await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `document.addEventListener("DOMContentLoaded", () => { const theme = document.querySelector("header [commandfor=theme]"); theme.removeAttribute("aria-label"); theme.textContent = "Theme"; });`,
    });
    try {
      await assert.rejects(opensKeysHelp(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: every header control that binds a key shows it in a kbd/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });

  test("P opening the drawer with the keys off fails the keys help check", async () => {
    // A handler that opens the Pages drawer on P whatever the reader's switch says.
    const page = await browser.open("about:blank");
    await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `addEventListener("keydown", (event) => { if (event.key === "p") document.querySelector("sl-drawer#pages")?.show(); });`,
    });
    try {
      await assert.rejects(opensKeysHelp(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: with the keys off, P doesn't open the drawer/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });
});

describe("the fixture site with its glyphs wrong", () => {
  /** Opens a page that runs script once its document is parsed, before the check reads it. */
  async function withChange(script: string): Promise<Page> {
    const page = await browser.open("about:blank");
    await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `document.addEventListener("DOMContentLoaded", () => { ${script} });`,
    });
    return page;
  }

  for (const { change, script, message } of [
    {
      change: "the Help button's glyph removed",
      script: `document.querySelector("header [commandfor=help] svg").remove();`,
      message: /\/fixture-site\/: the Help button shows its glyph and its key hint/,
    },
    {
      change: "the Theme button's word shown beside its glyph",
      script: `document.querySelector("header [commandfor=theme]").prepend("Theme ");`,
      message: /\/fixture-site\/: the Theme button shows its glyph and its key hint, no word/,
    },
    {
      change: "the keys help's Close showing the Help button's glyph",
      script: `document.querySelector("#help [command=close] svg").replaceWith(
        document.querySelector("header [commandfor=help] svg").cloneNode(true));`,
      message: /\/fixture-site\/: the keys help's Close shows its glyph and its key hint/,
    },
  ]) {
    test(`${change} fails the glyph check`, async () => {
      const page = await withChange(script);
      try {
        await assert.rejects(showsGlyphs(page, server.origin), (error: Error) => {
          assert.match(error.message, message);
          return true;
        });
      } finally {
        await page.close();
      }
    });
  }
});
