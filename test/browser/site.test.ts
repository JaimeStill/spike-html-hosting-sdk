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
// its drawer's dock attribute has it: the Contents drawer docked beside main at its end, its tree
// shown, and closed otherwise, the tree hidden; the Pages drawer docked beside main at its start
// with the Pages button hidden, and the button shown otherwise. With a sheet that holds the end
// column to 16rem on a page with no section tree, the between-docks check fails on the index,
// naming main's off-center margins, and with the guide's Contents drawer moved to the start column
// it fails naming the tree. With the Contents drawer's close() closing nothing, the section tree
// check fails on the guide, naming the width and the drawer a followed link left open. The index
// and the orphan page are shorter than the viewport at 390px, 1200px, and 1600px, so the body's
// min-height leaves room under them, and with v0.3.0's grid, whose rows stretch into it, the
// under-header check and the crawl fail on the index, naming the width and main's gap; at 390px,
// with a flex column whose auto margin pushes main to the body's end, the check fails as well, and
// with main pulled up into the
// header it fails naming the overlap. With the shell's Help dialog removed, the Settings button's
// binding removed, a row of Help's list removed, the Settings button's kbd removed, as the Theme
// button's markup before v0.3.1 had it, or a handler that opens the Pages drawer on P whatever the
// switch in Settings says, the keys help check fails, naming the page and the assertion. With a
// shortcut dialog's heading name, its Close's Esc, its opener's kbd, or its opener's hint wrong,
// or its Close moved to a trailing footer or its heading out of its header row, the shortcut
// dialog check fails, naming the dialog and what it lacks; with Help holding a
// [data-keys-list], which loads the foundation's keys-help.js, the request check fails. With the
// Help button's glyph removed, the Settings button's word shown beside its glyph, or Help's Close
// showing the Help button's glyph, the glyph check fails, naming the page and the button. With the glyph buttons' padding and border dropped and their text small, the target size
// check fails, naming the width, the space, and the button; with the header's group wrapping its
// buttons, laid over the nav's row below 40rem, wrapped under the nav from 40rem, at the
// header's inline end below 40rem or before the nav from 40rem, or the nav wrapping its links
// below 40rem, the header row check fails, naming
// the width; and with the header too wide for a phone, it fails naming the sideways scroll. With the
// bottom pager removed, a pager's links swapped, a pager link that follows nowhere, every L
// binding removed, or, below 40rem, a pager's title shown or out of its name or its key hint
// shown, the crawl fails, naming the page; with the top pager's L dropped, so keys lists
// the bottom one's, or a handler that follows the previous link on H whatever the switch in
// Settings says, the keys help check fails on a paged page, naming it.

import assert from "node:assert/strict";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";

import { launch, SETTLED } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Browser, Page } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Server } from "@jaimestill/spike-html-apps-tooling/server.js";

import {
  crawl,
  definesEveryElement,
  followsShortcutDialogs,
  holdsBetweenDocks,
  keepsNavigationWords,
  hasTargetSize,
  keepsHeaderRow,
  opensKeysHelp,
  placesSectionTree,
  requestsUnderBase,
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

/** Opens a page that runs script once its document is parsed, before the check reads it. */
async function withChange(script: string): Promise<Page> {
  const page = await browser.open("about:blank");
  await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
    source: `document.addEventListener("DOMContentLoaded", () => { ${script} });`,
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
          /\/fixture-site\/: at 1376px the docked sl-drawer#pages is [\d.]+px wide, under 16rem/,
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
          tree: { docked: boolean; beside: boolean; shown: boolean };
          drawer: { docked: boolean; beside: boolean };
          opener: boolean;
        } = await page.evaluate(`(() => {
          const main = document.querySelector("main").getBoundingClientRect();
          const tree = document.querySelector("sl-drawer#contents > sl-section-tree");
          const drawer = document.querySelector("sl-drawer#pages");
          const t = tree.getBoundingClientRect();
          const d = drawer.getBoundingClientRect();
          return {
            tree: {
              docked: tree.parentElement.matches(":state(docked)"),
              beside: t.width > 0 && t.left >= main.right,
              shown: tree.checkVisibility(),
            },
            drawer: {
              docked: drawer.matches(":state(docked)"),
              beside: d.width > 0 && d.right <= main.left,
            },
            opener: getComputedStyle(document.querySelector(".pages-opener")).display !== "none",
          };
        })()`);
        assert.equal(
          layout.tree.docked,
          width >= px(docks.tree),
          "the Contents drawer docks from its dock",
        );
        assert.equal(layout.tree.shown, layout.tree.docked, "the tree shows only docked");
        if (layout.tree.docked) {
          assert.ok(layout.tree.beside, "the docked tree is beside main, at its end");
        }
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
    // The guide's docked Contents drawer moved to the start column, before main.
    const page = await withSheet(
      "@media (width >= 70rem) { body > #contents { grid-column: 1 !important; } }",
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

describe("the fixture site with its Contents drawer left open", () => {
  test("a drawer a followed link leaves open fails the section tree check", async () => {
    // The guide's Contents drawer, whose close() the shell's script calls at a link's click,
    // closing nothing.
    const page = await withChange(`document.getElementById("contents").close = () => {};`);
    try {
      await assert.rejects(placesSectionTree(page, `${server.origin}guide/`), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/guide\/: at 390px following a link in the Contents drawer closes it/,
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

describe("the fixture site with no Help dialog", () => {
  test("the keys help check fails, naming the page", async () => {
    // The shell's dialog#help removed before any of the page's scripts run.
    const page = await browser.open("about:blank");
    await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `document.addEventListener("DOMContentLoaded", () => document.querySelector("dialog#help")?.remove());`,
    });
    try {
      await assert.rejects(opensKeysHelp(page, server.origin), (error: Error) => {
        assert.match(error.message, /\/fixture-site\/: \? opens Help/);
        return true;
      });
    } finally {
      await page.close();
    }
  });
});

describe("the fixture site with its keys help wrong", () => {
  test("a shell binding missing fails the keys help check", async () => {
    // The Settings button's S binding removed before keys.js reads the page's bindings.
    const page = await browser.open("about:blank");
    await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `document.addEventListener("DOMContentLoaded", () => document.querySelector("[commandfor=settings][data-keys]")?.removeAttribute("data-keys"));`,
    });
    try {
      await assert.rejects(opensKeysHelp(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: the page binds the shell's keys, and Help lists them; S Settings missing/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });

  test("a binding Help's list leaves out fails the keys help check", async () => {
    // Help's last row removed from sl-shortcuts' shadow root each time Help opens, once it renders.
    const page = await withChange(`
      const help = document.querySelector("dialog#help");
      const list = help.querySelector("sl-shortcuts");
      help.addEventListener("toggle", async (event) => {
        if (event.newState !== "open") return;
        await list.updateComplete;
        list.shadowRoot.querySelector("tbody tr:last-child")?.remove();
      });`);
    try {
      await assert.rejects(opensKeysHelp(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: Help lists exactly the page's bindings, as the keys module holds them/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });

  test("a header control that binds a key without showing it fails the keys help check", async () => {
    // The Settings button as the Theme button's markup before v0.3.1 had it: its label alone, no
    // kbd.
    const page = await browser.open("about:blank");
    await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `document.addEventListener("DOMContentLoaded", () => { const settings = document.querySelector("header [commandfor=settings]"); settings.removeAttribute("aria-label"); settings.textContent = "Settings"; });`,
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
  for (const { change, script, message } of [
    {
      change: "the Help button's glyph removed",
      script: `document.querySelector("header [commandfor=help] svg").remove();`,
      message: /\/fixture-site\/: the Help button shows its glyph and its key hint/,
    },
    {
      change: "the Settings button's word shown beside its glyph",
      script: `document.querySelector("header [commandfor=settings]").prepend("Settings ");`,
      message: /\/fixture-site\/: the Settings button shows its glyph and its key hint, no word/,
    },
    {
      change: "Help's Close showing the Help button's glyph",
      script: `document.querySelector("#help [command=close] svg").replaceWith(
        document.querySelector("header [commandfor=help] svg").cloneNode(true));`,
      message: /\/fixture-site\/: the Close of Help shows its glyph and its key hint/,
    },
    {
      change: "Settings' Close showing ? for its hint",
      script: `document.querySelector("#settings [command=close] kbd").textContent = "?";`,
      message: /\/fixture-site\/: the Close of Settings shows its glyph and its key hint, Esc/,
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

describe("the fixture site with its shortcut dialogs wrong", () => {
  for (const { change, script, message } of [
    {
      change: "Settings named by no heading",
      script: `document.querySelector("dialog#settings").removeAttribute("aria-labelledby");`,
      message:
        /\/fixture-site\/: the shortcut dialog #settings, opened on s, lacks a name from a heading inside it/,
    },
    {
      change: "Settings' Close showing ? in place of Esc",
      script: `document.querySelector("#settings [command=close] kbd").textContent = "?";`,
      message: /\/fixture-site\/: the shortcut dialog #settings, opened on s, lacks a Close/,
    },
    {
      change: "Settings' Close moved to a trailing footer",
      script: `const settings = document.querySelector("dialog#settings");
      const footer = document.createElement("footer");
      footer.append(...settings.querySelectorAll(".dialog-header > :not(h2)"));
      settings.append(footer);`,
      message:
        /\/fixture-site\/: the shortcut dialog #settings, opened on s, lacks its header row, a header\.dialog-header holding its heading and its Close/,
    },
    {
      change: "Help's heading outside its header row",
      script: `document.querySelector("dialog#help").prepend(document.getElementById("help-title"));`,
      message: /\/fixture-site\/: the shortcut dialog #help, opened on \?, lacks its header row/,
    },
    {
      change: "the Help button showing no key",
      script: `document.querySelector("header [commandfor=help] kbd").remove();`,
      message:
        /\/fixture-site\/: the shortcut dialog #help, opened on \?, lacks its opener's key, \? in a kbd/,
    },
    {
      change: "the Settings button's hint showing another name",
      script: `document.getElementById("settings-hint").textContent = "Theme";`,
      message:
        /\/fixture-site\/: the shortcut dialog #settings, opened on s, lacks its opener's interest hint/,
    },
  ]) {
    test(`${change} fails the shortcut dialog check`, async () => {
      const page = await withChange(script);
      try {
        await assert.rejects(followsShortcutDialogs(page, server.origin), (error: Error) => {
          assert.match(error.message, message);
          return true;
        });
      } finally {
        await page.close();
      }
    });
  }

  test("Help holding the foundation's keys help list fails the request check", async () => {
    // A [data-keys-list] in Help, which keys.js fills by loading its keys-help.js as Help opens.
    const page = await withChange(
      `document.querySelector("dialog#help").append(document.createElement("div"));
      document.querySelector("dialog#help > div:last-child").setAttribute("data-keys-list", "");`,
    );
    try {
      await assert.rejects(requestsUnderBase(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: the foundation's theme-menu\.js and keys-help\.js are never requested/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });
});

describe("the fixture site with its glyph buttons too small", () => {
  test("a glyph button under 24px a side fails the target size check", async () => {
    // The glyph buttons' padding and border dropped and their text, so their glyph, small.
    const page = await withSheet(
      ".glyph-button { padding: 0 !important; border: 0 !important; font-size: 0.5rem !important; }",
    );
    try {
      await assert.rejects(hasTargetSize(page, server.origin), (error: Error) => {
        assert.match(
          error.message,
          /\/fixture-site\/: at 390px in the regular space the \w+ button is [\d.]+px by [\d.]+px, under 24px a side/,
        );
        return true;
      });
    } finally {
      await page.close();
    }
  });
});

describe("the fixture site with its header's row broken", () => {
  for (const { change, css, message } of [
    {
      change: "the group wrapping its buttons",
      css: ".header-actions { flex-wrap: wrap; inline-size: 2rem; }",
      message: /\/fixture-site\/: at 390px the header's buttons, [\w, ]+, share one line/,
    },
    {
      change: "the group laid over the nav's row below 40rem",
      css:
        "@media (width < 40rem) { .header-actions { position: absolute; " +
        "inset-block-start: 0; inset-inline-end: var(--space-m); } }",
      message:
        /\/fixture-site\/: at 390px the header's buttons are on their own row below the site nav/,
    },
    {
      change: "the nav wrapping its links below 40rem",
      css: "@media (width < 40rem) { body > header > sl-site-nav { max-inline-size: 6rem; } }",
      message: /\/fixture-site\/: at 390px the site nav keeps its links on one line, not \d+/,
    },
    {
      change: "the header wrapping the group under the nav from 40rem",
      css:
        "@media (width >= 40rem) { body > header { flex-wrap: wrap; } " +
        "body > header > sl-site-nav { flex-basis: 100%; } " +
        ".header-actions { margin-inline-start: auto; } }",
      message: /\/fixture-site\/: at 640px the header's buttons are on the site nav's first line/,
    },
    {
      change: "the group at the header's inline end below 40rem",
      css: "@media (width < 40rem) { .header-actions { margin-inline-start: auto; } }",
      message:
        /\/fixture-site\/: at 390px the header's buttons start at the site nav's inline start/,
    },
    {
      change: "the group before the nav from 40rem",
      css: "@media (width >= 40rem) { .header-actions { order: -1; } }",
      message: /\/fixture-site\/: at 640px the header's buttons end at its inline end/,
    },
    {
      change: "the header too wide for a phone",
      css: "body > header { min-inline-size: 30rem; }",
      message: /\/fixture-site\/: \d+px wide in a \d+px viewport, past it/,
    },
  ]) {
    test(`${change} fails the header row check`, async () => {
      const page = await withSheet(css);
      try {
        await assert.rejects(keepsHeaderRow(page, server.origin), (error: Error) => {
          assert.match(error.message, message);
          return true;
        });
      } finally {
        await page.close();
      }
    });
  }
});

describe("the fixture site with its pagers wrong", () => {
  for (const [change, script, message] of [
    [
      "the bottom pager removed",
      `document.querySelector("main > nav.pager:last-child")?.remove();`,
      /\/fixture-site\/: a pager at main's top and foot links the pages before and after it/,
    ],
    [
      "a pager's links swapped",
      `for (const nav of document.querySelectorAll("nav.pager")) nav.append(nav.firstElementChild);`,
      /\/fixture-site\/a\.html: a pager at main's top and foot links the pages before and after it/,
    ],
    [
      "the top pager's previous link following nowhere",
      `document.querySelector("main > nav.pager:first-child a[rel=prev]")?.addEventListener("click", (event) => event.preventDefault());`,
      /\/fixture-site\/a\.html: following nav\.pager:first-child a\[rel=prev\] lands on/,
    ],
    [
      "every pager's L binding removed",
      `for (const a of document.querySelectorAll("a[data-keys=l]")) a.removeAttribute("data-keys");`,
      /\/fixture-site\/: a pager at main's top and foot links the pages before and after it/,
    ],
  ] as const) {
    test(`${change} fails the crawl, naming the page`, async () => {
      const page = await withChange(script);
      try {
        await assert.rejects(crawl(page, server.origin, root), (error: Error) => {
          assert.match(error.message, message);
          return true;
        });
      } finally {
        await page.close();
      }
    });
  }

  for (const [change, css] of [
    ["the pager's title shown below 40rem", ".pager-title { all: revert !important; }"],
    ["the pager's title out of its name below 40rem", ".pager-title { display: none !important; }"],
    ["the pager's key hint shown below 40rem", ".pager-key { display: inline !important; }"],
  ] as const) {
    test(`${change} fails the crawl, naming the page`, async () => {
      const page = await withSheet(`@media (width < 40rem) { ${css} }`);
      try {
        await assert.rejects(crawl(page, server.origin, root), (error: Error) => {
          assert.match(
            error.message,
            /\/fixture-site\/: at 390px the pager's next link shows only its arrow and word, its title still in its name/,
          );
          return true;
        });
      } finally {
        await page.close();
      }
    });
  }

  test("the top pager's binding dropped fails the keys help check on a paged page", async () => {
    // The top pager's L dropped, so keys lists the bottom pager's in its place.
    const page = await withChange(
      `document.querySelector("main > nav.pager:first-child a[data-keys=l]")?.removeAttribute("data-keys");`,
    );
    try {
      await assert.rejects(
        opensKeysHelp(page, server.origin, `${server.origin}a.html`),
        (error: Error) => {
          assert.match(
            error.message,
            /\/fixture-site\/a\.html: Help lists H and L as its pager's previous and next page/,
          );
          return true;
        },
      );
    } finally {
      await page.close();
    }
  });

  test("H moving to another page with the keys off fails the keys help check", async () => {
    // A handler that follows the previous link on H whatever the switch in Settings says.
    const page = await withChange(
      `document.addEventListener("keydown", (event) => { if (event.key === "h") document.querySelector("a[rel=prev]")?.click(); });`,
    );
    try {
      await assert.rejects(
        opensKeysHelp(page, server.origin, `${server.origin}a.html`),
        (error: Error) => {
          assert.match(
            error.message,
            /\/fixture-site\/a\.html: with the keys off, neither H nor L moves/,
          );
          return true;
        },
      );
    } finally {
      await page.close();
    }
  });
});
