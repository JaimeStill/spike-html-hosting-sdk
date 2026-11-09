// A site's browser checks, each a function over a page of the tooling's browser driver, as the
// tooling's own helpers are (until(page, …)): it loads the site's build, served under its base
// (served.ts), and asserts with node's assert, throwing on the first failure, so a site's test
// calls it inside its own node:test test and owns the browser, the server, and the page.
//
// The shell checks run on a page of the site, its index unless the site's test gives another: a
// Markdown site's index, the page its shell builds, a hand page at the base, or a hand page at any
// path under it, each checked under the site's base. On that page: the Settings button and S open
// the Settings dialog, a shortcut dialog holding the components' sl-settings, whose shadow root
// adopts the sheets the build rewrote from its CSS module scripts, the foundation's theme-menu.css
// among them, with no stylesheet fetched for them, and Escape closes it; stepping the color, space,
// and type rows of the settings each to a profile past its default, which the full entry
// registers, sets that facet's attribute on the root at once, and a change is stored at once, kept
// as the dialog closes, and applied after a reload, with no Save; the page's one module script,
// its entry, is render-blocking; once it loads, every element on the page whose name holds a
// hyphen, a custom element's, is defined, so a shell that fails to load a component's module
// fails naming its tag, where the capture run's wait for each element's definition would hang;
// every request the page makes, with Settings and Help opened, resolves under the base, none
// fails, and the foundation's theme-menu.js and keys-help.js, which sl-settings and sl-shortcuts
// stand in for, are never requested; in a 1600px viewport the site's layout holds main to a
// reading width, centered; at 1200px, between the layout's docks, main is centered on a page with
// no section tree, and the tree is docked beside it on a page with one; a page's section tree is in
// its Contents drawer, docked as a column beside main from the tree's dock and at 1600px, where J
// and K move through its sections, marking each, and below the dock, at
// 390px and a px under it, a closed drawer, whose show() opens it and in which following a link
// closes it and marks the link's section, and a page with no tree has no Contents drawer; at
// 390px, between the docks, and at 1600px, main starts directly under the header, the gap from
// the header's bottom never below zero and no more than on a page taller than the viewport,
// however short the page; ? opens Help, whose sl-shortcuts lists exactly the page's bindings as
// the foundation's keys module holds them, the shell's P, ?, S, and the tree's J and K among
// them, and, where the page has a pager, its H and L, each once, named as its previous and next
// page, and neither on a page with none, Escape closes it, and the character-key switch in
// Settings turns them off, so J moves to no section, P opens no drawer, and H and L move to no
// page, and on again; every dialog a
// keyed show-modal opener opens follows the components' shortcut dialog pattern, named by a heading
// inside it, closed by a Close glyph button showing Esc, its opener showing its key and named, with
// an interest hint showing the name; in a 390px viewport each header button, Pages where the
// shell has one, Help, and Settings, and each shortcut dialog's Close each show one glyph, the
// icons layer's svg for list-unordered-16, question-16, gear-16, and x-16, and the key hint in a
// kbd, Esc for a Close, both rendered, and no word, each named by its aria-label; every rendered
// glyph button, the page's and its components' in their shadow roots, and with each shortcut
// dialog open its own, is at least 24 CSS px a side (WCAG 2.5.8), at 390px and at 1600px, in the
// regular and the compact space profiles; the header's buttons, its header-actions group, share
// one line at the header's inline end, on the site nav's first line, at the capture widths, 390px,
// 1120px, and 1376px; nothing scrolls sideways at 390px; and at a phone's width, a px below and at
// each of the layout's docks (markdown-pages.ts's docks), and at 1400px, no navigation link's word
// breaks across lines and every docked side column is at least 16rem wide. A check that changes
// the reader's stored theme or keys settings removes them after. shell lists them by name, for a
// site to make a test of each.
//
// The palette check, highlightsEachPalette, runs on a page with highlighted code, which the site's
// test names, since not every site's index holds code: stepping the settings, in the Settings
// dialog, to each palette the foundation's registry lists, in light and in dark, recolors every
// highlighted token to the color its palette's syntax theme gives it there, read from the token's
// own --shiki-<palette> variable, which the build wrote from the theme; a registered palette whose
// code renders plain, with no syntax theme for it or no rule selecting it, fails, named.
//
// The crawl runs on a Markdown site, one tree or several: from the index, every link into the site
// is followed, breadth first, and each copied file's page reached loads with a 2xx, its one module
// script render-blocking, every custom element on it defined, every request under the base and none
// failed, its main held to a reading width, centered, in a 1600px viewport, nothing scrolling
// sideways in a 390px one, its navigation laid out as the shell check has it at the same widths,
// its layout between the docks, its section tree in its Contents drawer, its main under the
// header, its Help and the switch in Settings,
// its shortcut dialogs, its glyph buttons and their size, and its header's row as the shell checks
// have them, and its title its source's front matter name, or, for a source with no name, its
// first h1's text. Its Pages button is hidden at 1600px,
// where the site index is docked, and at 390px is shown and opens the Pages drawer as a modal by
// its click and by P, its aria-expanded true while the drawer is open and false once Escape closes
// it. Each page has a pager at main's top and at its foot, each a nav named apart, linking the
// pages before and after it in its site index's order, none past either end, each link showing
// its arrow glyph, filled, its word, the page's title, and its key hint, binding H or L, and named
// "Previous page: <title>" or "Next page: <title>"; each link, followed, lands on its page, and H
// and L, pressed, on the previous and the next. Each page's head holds a meta per front matter key, named by the key, in source order, its
// content the value as frontMatterText gives it, and none for a source with no front matter; no
// page header, no front matter table, and no visible list of its keys remains, and no key's
// "key: value" line is the page's text. Each page's
// site index, in its Pages drawer, links every copied file's page, each once, and no other. Every
// in-site link reaches a built page, and an element with its fragment's id when it has one. The
// crawl checks a page for every Markdown file content.json records, every tree's: a page no link
// from the index reaches is crawled from once the links run out, and returned, for the test's
// diagnostics. A page reached that no record names is a hand page the site also builds, a hand
// index at the base or a hand page elsewhere: it loads with a 2xx, every request under the base and
// none failed, it has no pager and binds neither H nor L, its ids are the targets of the fragments
// linking it, and its links are followed, but
// the copied pages' checks are left to the shell checks, which a site runs on each hand page by its
// URL; it is returned too.
// Adapted from spike-html-hosting (0a98c8e): test/browser/site.test.ts, its one page a crawl of
// the site's pages.
// Adapted from spike-html-hosting (16c97c6): test/browser/site.test.ts, its checks functions over
// a page, and the stored choice checked.
// Adapted from spike-html-hosting-architecture (a20a1e0): test/browser/site.test.ts, its crawl a
// function over a page, its sources read from the site's root.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { SETTLED, until } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Page } from "@jaimestill/spike-html-apps-tooling/browser.js";
import arrowLeftIcon from "@jaimestill/spike-html-hosting-icons/octicon/arrow-left-16";
import arrowRightIcon from "@jaimestill/spike-html-hosting-icons/octicon/arrow-right-16";
import gearIcon from "@jaimestill/spike-html-hosting-icons/octicon/gear-16";
import listUnorderedIcon from "@jaimestill/spike-html-hosting-icons/octicon/list-unordered-16";
import questionIcon from "@jaimestill/spike-html-hosting-icons/octicon/question-16";
import xIcon from "@jaimestill/spike-html-hosting-icons/octicon/x-16";
import { parse } from "yaml";

import { copiedFiles } from "./content.ts";
import { docks, frontMatterText, pageUrl, pagerLabels } from "./markdown-pages.ts";

/** A check on a fresh page of the site whose URL under the base, as served() gives it, is site:
 * the page at url, a URL under site, site itself, its index, when none is given. */
export type Check = (page: Page, site: string, url?: string) => Promise<void>;

/** The center of the element the expression gives, once it is in the viewport and the element a
 * click there reaches, it or one inside it, so nothing covers it; else the state that keeps it
 * from being clicked: the page's scroll, the element's box, the viewport's width, and what a click
 * there reaches instead, as a string. The element may be in an open shadow root: the point's
 * element is followed down through each shadow root it hosts, as a click there reaches it. */
const target = (element: string): string => `(() => {
  const element = ${element};
  if (!element) return "none in the page";
  const rect = element.getBoundingClientRect();
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  const inside = rect.width > 0 && rect.height > 0 && x >= 0 && y >= 0 &&
    x < innerWidth && y < innerHeight;
  let hit = inside ? document.elementFromPoint(x, y) : null;
  while (hit?.shadowRoot) {
    const inner = hit.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === hit) break;
    hit = inner;
  }
  if (hit && element.contains(hit)) return { x, y };
  const reached = hit ? hit.localName + (hit.id ? "#" + hit.id : "") : "nothing in the viewport";
  return "at scroll " + scrollY + ", its box " +
    [rect.x, rect.y, rect.width, rect.height].map(Math.round).join(" ") + " in a " +
    innerWidth + "px viewport, a click at its center reaches " + reached;
})()`;

/** Clicks the element the expression gives, named name in an error, at its center, as a person's
 * mouse does, once it is in the viewport and nothing covers it there, waiting as until() does;
 * else throws, naming the state that keeps it from being clicked. A click whose press and release
 * land on no element of its own is a click on nothing, so the wait is what makes a click on a page
 * still settling reach its element, never a fixed sleep. */
async function clickOn(page: Page, element: string, name: string): Promise<void> {
  const point = `(${target(element)})`;
  // Past the wait, the state read once more is what the error names.
  await until(page, `typeof ${point} === "object"`).catch(() => undefined);
  const at: { x: number; y: number } | string = await page.evaluate(point);
  if (typeof at === "string") throw new Error(`${name} isn't clickable: ${at}`);
  const { x, y } = at;
  for (const type of ["mousePressed", "mouseReleased"]) {
    await page.cdp("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
  }
}

/** Clicks the element the selector names in the document, as clickOn() does. */
const click = (page: Page, selector: string): Promise<void> =>
  clickOn(page, `document.querySelector(${JSON.stringify(selector)})`, selector);

/** The protocol's Shift modifier bit. */
const SHIFT = 8;

/** Presses a key as a US keyboard types it: keyDown, with its text for a letter or ?, then keyUp;
 * ? is Shift and the slash key. */
async function press(page: Page, key: string): Promise<void> {
  const letter = /^[a-z]$/.test(key);
  const event = letter
    ? {
        key,
        code: `Key${key.toUpperCase()}`,
        windowsVirtualKeyCode: key.toUpperCase().charCodeAt(0),
      }
    : key === "?"
      ? { key, code: "Slash", modifiers: SHIFT, windowsVirtualKeyCode: 191 }
      : { key, code: key, windowsVirtualKeyCode: key === "Escape" ? 27 : 0 };
  await page.cdp("Input.dispatchKeyEvent", {
    type: "keyDown",
    ...event,
    ...(letter || key === "?" ? { text: key } : {}),
  });
  await page.cdp("Input.dispatchKeyEvent", { type: "keyUp", ...event });
}

/** The Settings dialog, a shortcut dialog, is open, modal. */
const SETTINGS = `!!document.querySelector("dialog#settings")?.matches(":modal")`;

/** The Settings dialog's sl-settings, the reader's settings. */
const SETTINGS_ELEMENT = `document.querySelector("dialog#settings sl-settings")`;

/** The settings have rendered their theme rows in their shadow root. */
const SETTINGS_RENDERED = `!!${SETTINGS_ELEMENT}?.shadowRoot?.querySelector(".theme-menu-row")`;

/** Focus is on the settings' theme row of the section, as the dialog's open puts it on color. */
const onRow = (section: string): string =>
  `${SETTINGS_ELEMENT}?.shadowRoot?.activeElement?.closest("[data-section]")?.dataset.section === ${JSON.stringify(section)}`;

/** Opens the Settings dialog by the Settings button's click, or by S, and waits for its settings
 * to render and focus their first row, color; fails naming the page and how it was opened. */
async function openSettings(page: Page, url: string, by: "button" | "s"): Promise<void> {
  const opens = `${url}: ${by === "s" ? "S" : "the Settings button"} opens the Settings dialog`;
  await page.evaluate(`scrollTo({ top: 0, behavior: "instant" })`);
  if (by === "s") await press(page, "s");
  else {
    await click(page, "header button[commandfor=settings]").catch((error: Error) =>
      assert.fail(`${opens}; ${error.message}`),
    );
  }
  await until(page, SETTINGS).catch(() => assert.fail(opens));
  // The dialog's toggle event, at which the settings focus their first row, is a task after the
  // open: settled, it has run, so it moves no focus a key pressed next has moved.
  await page.evaluate(SETTLED);
  await until(page, `${SETTINGS_RENDERED} && ${onRow("color")}`).catch(() =>
    assert.fail(`${opens}, its settings rendered and its color row focused`),
  );
}

/** Closes the open Settings dialog by Escape. */
async function closeSettings(page: Page, url: string): Promise<void> {
  await press(page, "Escape");
  await until(page, `!${SETTINGS}`).catch(() =>
    assert.fail(`${url}: Escape closes the Settings dialog`),
  );
}

/** The localStorage key the foundation's preferences.js stores the reader's choice under. */
const KEY = "spike-html-apps-foundation.preferences";

/** A page's network log: every request, response, and failed load. */
interface Log {
  requests: string[];
  responses: { url: string; status: number }[];
  failures: { url: string; errorText: string }[];
}

/** Records the page's network log from its next request; take reads the log and starts a new
 * one. */
async function record(page: Page): Promise<() => Log> {
  let log: Log = { requests: [], responses: [], failures: [] };
  const urls = new Map<string, string>();
  page.on(
    "Network.requestWillBeSent",
    ({ requestId, request }: { requestId: string; request: { url: string } }) => {
      log.requests.push(request.url);
      urls.set(requestId, request.url);
    },
  );
  page.on(
    "Network.responseReceived",
    ({ response }: { response: { url: string; status: number } }) =>
      log.responses.push({ url: response.url, status: response.status }),
  );
  page.on(
    "Network.loadingFailed",
    ({ requestId, errorText }: { requestId: string; errorText: string }) =>
      log.failures.push({ url: urls.get(requestId) ?? requestId, errorText }),
  );
  await page.cdp("Network.enable");
  return () => {
    const taken = log;
    log = { requests: [], responses: [], failures: [] };
    return taken;
  };
}

/** Asserts a page's log: the page itself loaded with a 2xx, no request failed or answered an
 * error, and every request resolved under the base, site. */
function assertLoaded(url: string, site: string, { requests, responses, failures }: Log): void {
  const status = responses.find((response) => response.url === url)?.status;
  assert.ok(status !== undefined && status >= 200 && status < 300, `${url} loaded with ${status}`);
  assert.deepEqual(failures, [], `${url}: no request failed`);
  assert.deepEqual(
    responses.filter(({ status }) => status >= 400),
    [],
    `${url}: no request answered an error`,
  );
  assert.deepEqual(
    requests.filter((request) => !request.startsWith(site)),
    [],
    `${url}: every request resolves under the base`,
  );
}

/** The page's module scripts, each by whether it blocks rendering: the build's entry alone,
 * render-blocking, is [true]. */
const BLOCKING = `[...document.querySelectorAll('script[type="module"]')]
  .map((script) => script.blocking.contains("render"))`;

/** The loaded page's custom elements no definition upgraded: each tag whose name holds a hyphen,
 * once, that customElements doesn't define, as the capture run's RENDERED wait reads the page. */
const UNDEFINED = `[...new Set([...document.querySelectorAll("*")].map((element) => element.localName))]
  .filter((name) => name.includes("-") && !customElements.get(name))`;

/** Asserts every custom element on the loaded page is defined, naming the tags that aren't. */
async function assertDefined(page: Page, url: string): Promise<void> {
  const tags: string[] = await page.evaluate(UNDEFINED);
  assert.deepEqual(tags, [], `${url}: every custom element is defined; ${tags.join(", ")} is not`);
}

/** Sets a viewport wider than any reading width, so main's cap shows. */
const wide = (page: Page): Promise<unknown> =>
  page.cdp("Emulation.setDeviceMetricsOverride", {
    width: 1600,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

/** Sets a phone's viewport, 390px wide, where no page may scroll sideways. */
const narrow = (page: Page): Promise<unknown> =>
  page.cdp("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
  });

/** Asserts the loaded page, in a 390px viewport, is no wider than it: nothing scrolls sideways,
 * naming the widest elements that overflow it. */
async function assertNoSidewaysScroll(page: Page, url: string): Promise<void> {
  await narrow(page);
  const { scroll, viewport, wide }: { scroll: number; viewport: number; wide: string[] } =
    await page.evaluate(`(() => {
      const viewport = document.documentElement.clientWidth;
      const wide = [...document.body.querySelectorAll("*")]
        .filter((element) => element.getBoundingClientRect().right > viewport + 0.5)
        .map((element) => [element.localName, ...element.classList].join("."));
      return { scroll: document.documentElement.scrollWidth, viewport, wide: wide.slice(0, 5) };
    })()`);
  assert.ok(
    scroll <= viewport,
    `${url}: ${scroll}px wide in a ${viewport}px viewport, past it: ${wide.join(", ")}`,
  );
}

/** A dock's width in px, its rem the initial font size's, 16px, as a media query reads it. */
const px = (dock: string): number => parseFloat(dock) * 16;

/** The side columns' minimum width, 16rem, in px. */
const COLUMN = px("16rem");

/** The widths the navigation is checked at: a phone's; a px below each of the layout's docks, and
 * the dock itself, the narrowest width it docks at; and 1400px, a laptop's, between the docks and
 * the widest of the three. */
const NAVIGATION = [
  390,
  px(docks.tree) - 1,
  px(docks.tree),
  px(docks.index) - 1,
  px(docks.index),
  1400,
].sort((a, b) => a - b);

/** The loaded page's navigation as laid out: each word of a navigation link's text, the site
 * nav's in its shadow root, the section tree's, and the site index's, that renders on more than
 * one line, broken inside it, by its range's client rects, a word on one line being one line's
 * rects; and each docked side column's width, each drawer's in its docked state, the Contents
 * drawer's holding the section tree and the Pages drawer's the site index. A word is a run of
 * neither space nor hyphen, with the hyphen that ends it: a hyphenated compound, as
 * "artifact-keyed", may wrap after its hyphen, where the line breaking the components keep
 * (overflow-wrap and word-break normal) wraps it, but no word breaks elsewhere. A link not
 * rendered, in a closed drawer, has no rects. */
const NAVIGATION_LAYOUT = `(() => {
  const links = [
    ...[...document.querySelectorAll("sl-site-nav")]
      .flatMap((nav) => [...(nav.shadowRoot?.querySelectorAll("a") ?? [])]),
    ...document.querySelectorAll("sl-section-tree a, sl-site-index a"),
  ];
  const broken = [];
  for (const link of links) {
    const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      for (const word of text.data.matchAll(/[^\\s-]+-?/g)) {
        const range = document.createRange();
        range.setStart(text, word.index);
        range.setEnd(text, word.index + word[0].length);
        const lines = new Set([...range.getClientRects()]
          .filter((rect) => rect.width > 0)
          .map((rect) => Math.round(rect.top)));
        if (lines.size > 1) broken.push(word[0]);
      }
    }
  }
  const columns = [...document.querySelectorAll("sl-drawer")]
    .filter((element) => element.matches(":state(docked)"))
    .map((element) => ({
      name: element.localName + (element.id ? "#" + element.id : ""),
      width: element.getBoundingClientRect().width,
    }));
  return { broken, columns };
})()`;

/** Asserts the loaded page's navigation at each of the NAVIGATION widths: no link's word breaks
 * across lines, and each docked side column is at least 16rem wide. */
async function assertNavigation(page: Page, url: string): Promise<void> {
  for (const width of NAVIGATION) {
    await page.cdp("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await page.evaluate(SETTLED);
    const { broken, columns }: { broken: string[]; columns: { name: string; width: number }[] } =
      await page.evaluate(NAVIGATION_LAYOUT);
    assert.deepEqual(
      broken,
      [],
      `${url}: at ${width}px no navigation link breaks inside a word; ${broken.join(", ")} does`,
    );
    for (const column of columns) {
      assert.ok(
        column.width >= COLUMN - 0.5,
        `${url}: at ${width}px the docked ${column.name} is ${column.width}px wide, under 16rem`,
      );
    }
  }
}

/** The Pages button's state: whether it renders, its aria-expanded, and whether the Pages drawer
 * is open as a modal dialog. */
const PAGES = `(() => {
  const opener = document.querySelector(".pages-opener");
  const drawer = document.querySelector("sl-drawer#pages");
  return {
    shown: !!opener && getComputedStyle(opener).display !== "none",
    expanded: opener?.getAttribute("aria-expanded") ?? null,
    modal: !!drawer?.shadowRoot?.querySelector("dialog")?.matches(":modal"),
  };
})()`;

/** Asserts the loaded page's Pages button: hidden in a 1600px viewport, where the site index's
 * drawer is docked; in a 390px one shown, opening the drawer as a modal by its click and by P,
 * with aria-expanded true while it is open, and false again once Escape closes it. */
async function assertPagesButton(page: Page, url: string): Promise<void> {
  type Pages = { shown: boolean; expanded: string | null; modal: boolean };
  await wide(page);
  await page.evaluate(SETTLED);
  let pages: Pages = await page.evaluate(PAGES);
  assert.equal(pages.shown, false, `${url}: the Pages button is hidden at 1600px`);
  await narrow(page);
  await page.evaluate(SETTLED);
  pages = await page.evaluate(PAGES);
  assert.deepEqual(
    pages,
    { shown: true, expanded: "false", modal: false },
    `${url}: the Pages button is shown at 390px, the drawer closed`,
  );
  for (const open of [() => click(page, ".pages-opener"), () => press(page, "p")]) {
    await open();
    await until(page, `${PAGES}.modal`);
    pages = await page.evaluate(PAGES);
    assert.equal(pages.expanded, "true", `${url}: aria-expanded is true while the drawer is open`);
    await press(page, "Escape");
    await until(page, `!${PAGES}.modal`);
    // The dialog's close event, which the drawer's own follows, is a task after Escape's.
    await until(page, `${PAGES}.expanded === "false"`, 2000).catch(() =>
      assert.fail(`${url}: aria-expanded is false once the drawer closes`),
    );
  }
}

/** Asserts the loaded page's main is held to a reading width, centered, well inside the
 * viewport. */
async function assertReadingWidth(page: Page, url: string): Promise<void> {
  const { width, left, right, viewport }: Record<string, number> = await page.evaluate(`(() => {
    const rect = document.querySelector("main").getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    return { width: rect.width, left: rect.left, right: viewport - rect.right, viewport };
  })()`);
  assert.ok(width < viewport * 0.75, `${url}: main's ${width}px is capped in ${viewport}px`);
  assert.ok(Math.abs(left - right) <= 1, `${url}: main is centered, ${left}px and ${right}px`);
}

/** A width between the layout's docks, 75rem: the section tree docked and the site index the
 * Pages drawer, so only a page's tree may take a side column. */
const BETWEEN = 1200;

/** Sets a viewport between the layout's docks, BETWEEN wide. */
const between = (page: Page): Promise<unknown> =>
  page.cdp("Emulation.setDeviceMetricsOverride", {
    width: BETWEEN,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

/** Asserts the loaded page between the docks: with no section tree, main centered, as no side
 * column is docked; with one, the tree docked beside main, at its end. */
async function assertBetweenDocks(page: Page, url: string): Promise<void> {
  assert.ok(px(docks.tree) <= BETWEEN && BETWEEN < px(docks.index), "BETWEEN is between the docks");
  await between(page);
  await page.evaluate(SETTLED);
  const shown: { tree: boolean; beside: boolean; left: number; right: number } =
    await page.evaluate(`(() => {
      const main = document.querySelector("main").getBoundingClientRect();
      const tree = document.querySelector("sl-section-tree");
      return {
        tree: !!tree,
        beside: !!tree && tree.getBoundingClientRect().left >= main.right,
        left: main.left,
        right: document.documentElement.clientWidth - main.right,
      };
    })()`);
  if (shown.tree) {
    assert.ok(shown.beside, `${url}: at ${BETWEEN}px the section tree is docked beside main`);
  } else {
    assert.ok(
      Math.abs(shown.left - shown.right) <= 1,
      `${url}: at ${BETWEEN}px, with no section tree, main is centered, ` +
        `${shown.left}px and ${shown.right}px`,
    );
  }
}

/** The widths the section tree is checked docked at, its dock and 1600px, and in the closed
 * Contents drawer at, a phone's and a px below its dock. */
const DOCKED = [px(docks.tree), 1600];
const UNDOCKED = [390, px(docks.tree) - 1];

/** The loaded page's section tree as laid out, null with none: the count of trees; whether its
 * parent is the Contents drawer, sl-drawer#contents labeled "Contents", and that drawer's dock;
 * whether the tree carries a dock of its own; whether the drawer is docked, and open as a modal
 * dialog; whether the tree renders; whether it is beside main, at its end; and the href of its
 * first link, the first section J moves to. */
const CONTENTS = `(() => {
  const tree = document.querySelector("sl-section-tree");
  if (!tree) return null;
  const drawer = tree.parentElement;
  const main = document.querySelector("main").getBoundingClientRect();
  return {
    trees: document.querySelectorAll("sl-section-tree").length,
    drawer: drawer.matches('sl-drawer#contents[label="Contents"]'),
    dock: drawer.getAttribute("dock"),
    treeDock: tree.hasAttribute("dock"),
    docked: drawer.matches(":state(docked)"),
    modal: !!drawer.shadowRoot?.querySelector("dialog")?.matches(":modal"),
    shown: tree.checkVisibility(),
    beside: tree.getBoundingClientRect().left >= main.right,
    first: tree.querySelector('a[href^="#"]')?.getAttribute("href") ?? null,
  };
})()`;

/** The section tree's last link, which the check follows in the open drawer. */
const LAST_LINK = `[...document.querySelectorAll('sl-section-tree a[href^="#"]')].at(-1)`;

/** Sets a viewport width wide, 900px tall, scrolled to the page's top, the section tree's held
 * stop released by the scroll. */
async function atWidth(page: Page, width: number): Promise<void> {
  await page.cdp("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await page.evaluate(`scrollTo({ top: 0, behavior: "instant" })`);
  await page.evaluate(SETTLED);
}

/**
 * Asserts the loaded page's section tree, where it has one: one tree, in the Contents drawer,
 * sl-drawer#contents labeled "Contents" and docked from the layout's tree dock, the tree with no
 * dock of its own. At its dock and at 1600px the drawer is docked, the tree rendered as a column
 * beside main, at its end, and, under reduced motion so each move is instant, J marks the first
 * section and scrolls to it, and K returns to the page's top, no section marked; H and L are the
 * pager's, which move to another page, so the check presses neither. At a phone's width and a px below the dock the drawer is closed,
 * the tree not rendered; its show() opens it as a modal with the tree rendered, and following the
 * tree's last link closes it, its fragment the URL's and its section marked. A page with no tree
 * has no Contents drawer. The fragment and the emulated motion are put back after.
 */
async function assertContents(page: Page, url: string): Promise<void> {
  type Contents = {
    trees: number;
    drawer: boolean;
    dock: string | null;
    treeDock: boolean;
    docked: boolean;
    modal: boolean;
    shown: boolean;
    beside: boolean;
    first: string | null;
  };
  const initial: Contents | null = await page.evaluate(CONTENTS);
  if (initial === null) {
    assert.equal(
      await page.evaluate(`document.getElementById("contents")`),
      null,
      `${url}: with no section tree, it has no Contents drawer`,
    );
    return;
  }
  assert.equal(initial.trees, 1, `${url}: one section tree`);
  assert.ok(initial.drawer, `${url}: its section tree is in the Contents drawer`);
  assert.equal(initial.dock, docks.tree, `${url}: the Contents drawer docks from ${docks.tree}`);
  assert.equal(initial.treeDock, false, `${url}: the section tree takes no dock of its own`);
  const scrolled = `Math.round(document.documentElement.scrollTop)`;
  await page.cdp("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  try {
    for (const width of DOCKED) {
      await atWidth(page, width);
      const contents: Contents = await page.evaluate(CONTENTS);
      assert.deepEqual(
        { docked: contents.docked, modal: contents.modal, shown: contents.shown },
        { docked: true, modal: false, shown: true },
        `${url}: at ${width}px the Contents drawer is docked, the section tree shown`,
      );
      assert.ok(contents.beside, `${url}: at ${width}px the section tree is beside main`);
      assert.equal(await page.evaluate(MARKED), null, `${url}: at the top no section is marked`);
      await press(page, "j");
      await page.evaluate(SETTLED);
      assert.equal(
        await page.evaluate(MARKED),
        contents.first,
        `${url}: at ${width}px J marks the first section`,
      );
      await press(page, "k");
      await page.evaluate(SETTLED);
      assert.deepEqual(
        { marked: await page.evaluate(MARKED), at: await page.evaluate(scrolled) },
        { marked: null, at: 0 },
        `${url}: at ${width}px K returns to the page's top`,
      );
    }
    for (const width of UNDOCKED) {
      await atWidth(page, width);
      let contents: Contents = await page.evaluate(CONTENTS);
      assert.deepEqual(
        { docked: contents.docked, modal: contents.modal, shown: contents.shown },
        { docked: false, modal: false, shown: false },
        `${url}: at ${width}px the Contents drawer is closed, the section tree hidden`,
      );
      await page.evaluate(`document.getElementById("contents").show()`);
      await until(page, `${CONTENTS}.modal`).catch(() =>
        assert.fail(`${url}: at ${width}px show() opens the Contents drawer`),
      );
      contents = await page.evaluate(CONTENTS);
      assert.ok(contents.shown, `${url}: at ${width}px the open drawer shows the section tree`);
      const href: string = await page.evaluate(`${LAST_LINK}.getAttribute("href")`);
      await clickOn(page, LAST_LINK, "the section tree's last link").catch((error: Error) =>
        assert.fail(`${url}: at ${width}px ${error.message}`),
      );
      await until(page, `!${CONTENTS}.modal`).catch(() =>
        assert.fail(`${url}: at ${width}px following a link in the Contents drawer closes it`),
      );
      await until(page, `${MARKED} === ${JSON.stringify(href)}`).catch(() =>
        assert.fail(`${url}: at ${width}px the followed link's section, ${href}, is marked`),
      );
      assert.equal(
        await page.evaluate(`location.hash`),
        href,
        `${url}: at ${width}px the followed link's fragment is the URL's`,
      );
      await page.evaluate(`history.replaceState(null, "", location.pathname + location.search)`);
    }
  } finally {
    await page.cdp("Emulation.setEmulatedMedia", { features: [] });
  }
}

/** The widths main is checked to start under the header at, each with the viewport setter its
 * check uses: a phone's, where the body is one column; BETWEEN, a grid with the drawer undocked;
 * and 1600px, a grid with it docked. */
const UNDER: [number, (page: Page) => Promise<unknown>][] = [
  [390, narrow],
  [BETWEEN, between],
  [1600, wide],
];

/** The loaded page's gap between the header and main, scrolled to the top: main's top less the
 * header's bottom, nothing sitting between them, each drawer docked beside main or closed; and the
 * layout's own gap there, the same
 * gap once a spacer at main's end makes the page taller than the viewport, so the body's
 * min-height leaves no room for rows, alignment, or auto margins to push main down, and removed
 * after. */
const UNDER_HEADER = `(() => {
  scrollTo({ top: 0, behavior: "instant" });
  const main = document.querySelector("main");
  const above = document.querySelector("body > header");
  const gap = () => main.getBoundingClientRect().top - above.getBoundingClientRect().bottom;
  const gaps = { above: above.localName, gap: gap() };
  const spacer = document.createElement("div");
  spacer.style.blockSize = "200vh";
  main.append(spacer);
  gaps.allowed = gap();
  spacer.remove();
  return gaps;
})()`;

/** Asserts the loaded page's main starts directly under the header at each of the UNDER widths:
 * not into it, and no further below it than on a page taller than the viewport, so a short page's
 * grid rows, stretched to the body's min-height, can't push main down. */
async function assertUnderHeader(page: Page, url: string): Promise<void> {
  for (const [width, viewport] of UNDER) {
    await viewport(page);
    await page.evaluate(SETTLED);
    const { above, gap, allowed }: { above: string; gap: number; allowed: number } =
      await page.evaluate(UNDER_HEADER);
    assert.ok(gap >= -0.5, `${url}: at ${width}px main starts under the ${above}, not into it`);
    assert.ok(
      gap <= allowed + 0.5,
      `${url}: at ${width}px main starts directly under the ${above}, ` +
        `${gap}px below it, past the layout's ${allowed}px`,
    );
  }
}

/** The Help dialog, a shortcut dialog, is open, modal. */
const HELP = `!!document.querySelector("dialog#help")?.matches(":modal")`;

/** Help's shortcuts list, sl-shortcuts, as it renders in its shadow root: each row's keys, as its
 * kbd elements read, its action, the row's button's label, and whether it is marked off. */
const HELP_ROWS = `[...(document.querySelector("dialog#help sl-shortcuts")?.shadowRoot
    ?.querySelectorAll("tbody tr") ?? [])]
  .map((tr) => ({
    keys: [...tr.cells[0].querySelectorAll("kbd")].map((kbd) => kbd.textContent).join(" "),
    action: tr.cells[1].textContent.trim(),
    off: tr.classList.contains("off"),
  }))`;

/** The localStorage key the foundation's keys.js stores the reader's keys settings under. */
const KEYS_SETTINGS = "spike-html-apps-foundation.keys";

/**
 * The page's bindings, as the foundation's keys module holds them with Help closed, read apart
 * from Help's list, each as HELP_ROWS reads a row: first each data-keys element outside Help that
 * can act, enabled, not inert, and rendered, in document order, its keys upper-cased as the keys
 * grammar labels a character key and named by its aria-label, else its text; then each binding
 * register() added, from the module's store at its well-known global key, which every copy
 * shares, named by its label. A sequence an earlier binding has is left out, as the module lists
 * it once. A binding of a character key alone is off while the reader's switch, stored under
 * KEYS_SETTINGS, has the character keys off.
 */
const PAGE_BINDINGS = `(() => {
  const help = document.querySelector("dialog#help");
  const store = globalThis[Symbol.for("spike-html-apps-foundation.keys")] ?? { registered: [] };
  let enabled = true;
  try {
    enabled = JSON.parse(localStorage.getItem(${JSON.stringify(KEYS_SETTINGS)}) ?? "{}")?.enabled !== false;
  } catch {}
  const label = (keys) => (keys.length === 1 ? keys.toUpperCase() : keys);
  const seen = new Set();
  const listed = [];
  const add = (keys, action) => {
    if (seen.has(keys)) return;
    seen.add(keys);
    listed.push({ keys: label(keys), action, off: !enabled && [...keys].length === 1 });
  };
  for (const element of document.querySelectorAll("[data-keys]")) {
    if (help?.contains(element) || element.matches(":disabled") || element.closest("[inert]")) continue;
    if (!element.checkVisibility()) continue;
    add(element.dataset.keys, element.getAttribute("aria-label")?.trim() || element.textContent.trim());
  }
  for (const { keys, label } of store.registered) add(keys, label);
  return listed;
})()`;

/** The header's controls that bind a key, each as its data-keys and the text of the kbd elements
 * it shows, joined by a space. */
const HEADER_KEYS = `[...document.querySelectorAll("header [data-keys]")].map((control) => ({
    keys: control.dataset.keys,
    shown: [...control.querySelectorAll("kbd")].map((kbd) => kbd.textContent).join(" "),
  }))`;

/** A row of Help's shortcuts list, as HELP_ROWS reads it. */
type HelpRow = { keys: string; action: string; off: boolean };

/** The rows Help lists for the loaded page's pager, as HELP_ROWS reads them: H for the top pager's
 * previous link and L for its next, where it has them, each its word, "page:", and its title, as
 * the pager shows it; none with no pager. The bottom pager binds the same keys, which keys lists
 * once, under the first in document order. */
const PAGER_ROWS = `[...document.querySelectorAll("main > nav.pager:first-child a[data-keys]")]
  .map((a) => ({
    keys: a.dataset.keys.toUpperCase(),
    action: a.querySelector(".pager-word")?.textContent + " page: " +
      a.querySelector(".pager-title")?.textContent,
    off: false,
  }))`;

/** The href of the section tree's link marked as the section in view, or null. */
const MARKED = `document.querySelector("sl-section-tree a[aria-current]")?.getAttribute("href") ?? null`;

/** The shell's glyph buttons, by the selector that finds each: its name, its aria-label; its key
 * hint, the kbd it shows; and its glyph, the icons module whose svg the build fills its marker
 * with. The Pages button is the shell's where it has one, which a hand page may leave out. */
const GLYPHS: Record<string, { name: string; hint: string; icon: string }> = {
  "header .pages-opener[data-keys=p]": { name: "Pages", hint: "P", icon: listUnorderedIcon },
  "header button[commandfor=help][data-keys]": { name: "Help", hint: "?", icon: questionIcon },
  "header button[commandfor=settings][data-keys]": { name: "Settings", hint: "S", icon: gearIcon },
  "dialog#help button[commandfor=help][command=close]": { name: "Close", hint: "Esc", icon: xIcon },
  "dialog#settings button[commandfor=settings][command=close]": {
    name: "Close",
    hint: "Esc",
    icon: xIcon,
  },
};

/** The shell's shortcut dialogs, each by its id, as its name in a message, with its opener in the
 * header. */
const DIALOGS = [
  { id: "help", name: "Help", opener: "header button[commandfor=help]" },
  { id: "settings", name: "Settings", opener: "header button[commandfor=settings]" },
];

/** Each glyph button the page has, by its GLYPHS selector, as shown: its aria-label; its svg
 * elements counted; its first svg's markup, a class the marker carried dropped; its hints, the
 * text of each kbd inside an aria-hidden element; the words it shows, its text outside its svg and
 * aria-hidden elements; and, where the button renders, whether its glyph and its hint render. */
const glyphsShown = (selectors: string[]): string => `(() => {
  const markup = (svg) => {
    const glyph = svg.cloneNode(true);
    glyph.removeAttribute("class");
    return glyph.outerHTML;
  };
  return ${JSON.stringify(selectors)}.flatMap((selector) => {
    const button = document.querySelector(selector);
    if (!button) return [];
    const svgs = [...button.querySelectorAll("svg")];
    const words = button.cloneNode(true);
    for (const hidden of words.querySelectorAll('svg, [aria-hidden="true"]')) hidden.remove();
    const kbd = button.querySelector("kbd");
    const rect = svgs[0]?.getBoundingClientRect();
    return [{
      selector,
      name: button.getAttribute("aria-label"),
      svgs: svgs.length,
      glyph: svgs[0] ? markup(svgs[0]) : null,
      hints: [...button.querySelectorAll('[aria-hidden="true"] kbd')].map((k) => k.textContent),
      words: words.textContent.trim(),
      rendered: !button.checkVisibility() ||
        (!!rect && rect.width > 0 && rect.height > 0 && !!kbd?.checkVisibility()),
    }];
  });
})()`;

/** Each icon's svg as the page's parser serializes it, so it compares with a filled glyph's. */
const PARSED_ICONS = `${JSON.stringify(Object.values(GLYPHS).map(({ icon }) => icon))}
  .map((svg) => {
    const template = document.createElement("template");
    template.innerHTML = svg;
    return template.content.firstElementChild.outerHTML;
  })`;

/** Asserts the loaded page's glyph buttons, in a 390px viewport, where the Pages button shows:
 * each header button the shell has, Pages, Help, and Settings, and, with each shortcut dialog open
 * by its button, its Close, shows one glyph, the icons module's svg (1em square, currentColor,
 * aria-hidden and focusable="false"), and its key hint in a kbd, Esc for a Close, both rendered,
 * and no word, named by its aria-label. The Help and Settings buttons and their dialogs' Closes
 * are every shell's. The page is scrolled to its top before each dialog opens, and each dialog is
 * closed after. */
async function assertGlyphs(page: Page, url: string): Promise<void> {
  await narrow(page);
  // At the top, where the header's buttons are clicked, as a check before may have scrolled.
  await page.evaluate(`scrollTo({ top: 0, behavior: "instant" })`);
  await page.evaluate(SETTLED);
  const parsed: string[] = await page.evaluate(PARSED_ICONS);
  const icons = new Map(Object.keys(GLYPHS).map((selector, i) => [selector, parsed[i]]));
  type Shown = {
    selector: string;
    name: string | null;
    svgs: number;
    glyph: string | null;
    hints: string[];
    words: string;
    rendered: boolean;
  };
  const expect = (selector: string): Shown => {
    const { name, hint } = GLYPHS[selector];
    const glyph = icons.get(selector) ?? null;
    return { selector, name, svgs: 1, glyph, hints: [hint], words: "", rendered: true };
  };
  const header = Object.keys(GLYPHS).filter((selector) => selector.startsWith("header "));
  const shown: Shown[] = await page.evaluate(glyphsShown(header));
  const names = shown.map(({ selector }) => GLYPHS[selector].name);
  assert.ok(
    names.includes("Help") && names.includes("Settings"),
    `${url}: the header has its Help and Settings buttons`,
  );
  for (const button of shown) {
    assert.deepEqual(
      button,
      expect(button.selector),
      `${url}: the ${GLYPHS[button.selector].name} button shows its glyph and its key hint, ` +
        "no word, named by its aria-label",
    );
  }
  for (const dialog of DIALOGS) {
    const open = `!!document.querySelector("dialog#${dialog.id}")?.matches(":modal")`;
    const close = Object.keys(GLYPHS).filter((selector) =>
      selector.startsWith(`dialog#${dialog.id} `),
    );
    try {
      const opens = `${url}: the ${dialog.name} button opens ${dialog.name}`;
      // No dialog is open, the one a check before closed among them, and the page is at its top,
      // so the button is in the viewport: a section move the check before left scrolling smoothly
      // may land after the scroll to the top above, so the top is taken again until it holds.
      await until(page, `!document.querySelector("dialog[open]")`).catch(() =>
        assert.fail(`${opens}; a dialog is still open before its click`),
      );
      await until(page, `scrollY === 0 || void scrollTo({ top: 0, behavior: "instant" })`).catch(
        () => assert.fail(`${opens}; the page doesn't stay at its top before its click`),
      );
      await click(page, dialog.opener).catch((error: Error) =>
        assert.fail(`${opens}; ${error.message}`),
      );
      await until(page, open).catch(() => assert.fail(opens));
      const closing: Shown[] = await page.evaluate(glyphsShown(close));
      assert.deepEqual(
        closing,
        close.map(expect),
        `${url}: the Close of ${dialog.name} shows its glyph and its key hint, Esc, no word, named Close`,
      );
    } finally {
      await press(page, "Escape");
      await until(page, `!${open}`);
    }
  }
}

/**
 * The page's shortcut dialogs, each a dialog a keyed show-modal opener opens, a
 * button[data-keys][commandfor][command=show-modal], as its id, its opener's key, and what it
 * lacks of the components' shortcut dialog pattern: its opener's name, an aria-label; its opener's
 * key, upper-cased, shown in its kbd; its opener's interest hint, the element its interestfor
 * names, holding that name; the dialog itself; a name from a heading inside it, an h1 to h6 its
 * aria-labelledby names; and a Close, a glyph button inside it with command=close for it, showing
 * Esc in a kbd.
 */
const SHORTCUT_DIALOGS = `[...document.querySelectorAll('button[data-keys][commandfor][command="show-modal"]')]
  .map((opener) => {
    const id = opener.getAttribute("commandfor");
    const keys = opener.dataset.keys;
    const lacks = [];
    const name = opener.getAttribute("aria-label")?.trim() ?? "";
    if (!name) lacks.push("its opener's name, an aria-label");
    const shown = [...opener.querySelectorAll("kbd")].map((kbd) => kbd.textContent.trim()).join(" ");
    if (shown !== keys.toUpperCase()) lacks.push("its opener's key, " + keys.toUpperCase() + " in a kbd");
    const hint = document.getElementById(opener.getAttribute("interestfor") ?? "");
    if (!name || hint?.textContent.trim() !== name) {
      lacks.push("its opener's interest hint, holding its name");
    }
    const dialog = document.getElementById(id);
    if (!(dialog instanceof HTMLDialogElement)) return { id, keys, lacks: [...lacks, "a dialog"] };
    const named = (dialog.getAttribute("aria-labelledby") ?? "").split(/\\s+/)
      .map((ref) => document.getElementById(ref))
      .some((heading) => !!heading && dialog.contains(heading) &&
        /^h[1-6]$/.test(heading.localName) && heading.textContent.trim() !== "");
    if (!named) lacks.push("a name from a heading inside it, by aria-labelledby");
    const closes = [...dialog.querySelectorAll('button.glyph-button[command="close"]')]
      .filter((close) => close.getAttribute("commandfor") === id &&
        [...close.querySelectorAll("kbd")].some((kbd) => kbd.textContent.trim() === "Esc"));
    if (closes.length === 0) lacks.push("a Close, a glyph button for it showing Esc in a kbd");
    return { id, keys, lacks };
  })`;

/** Asserts the loaded page has a shortcut dialog, a keyed show-modal opener's, and that each it
 * has follows the pattern, failing naming each dialog and what it lacks. */
async function assertShortcutDialogs(page: Page, url: string): Promise<void> {
  const dialogs: { id: string; keys: string; lacks: string[] }[] =
    await page.evaluate(SHORTCUT_DIALOGS);
  assert.ok(dialogs.length > 0, `${url}: a keyed opener opens a shortcut dialog`);
  const failing = dialogs
    .filter(({ lacks }) => lacks.length > 0)
    .map(({ id, keys, lacks }) => `#${id}, opened on ${keys}, lacks ${lacks.join("; ")}`);
  assert.deepEqual(failing, [], `${url}: the shortcut dialog ${failing.join(", and ")}`);
}

/** The ids of the dialogs the page's keyed show-modal openers open, each once. */
const OPENED_DIALOGS = `[...new Set([...document.querySelectorAll(
  'button[data-keys][commandfor][command="show-modal"]')].map((opener) => opener.getAttribute("commandfor")))]
  .filter((id) => document.getElementById(id) instanceof HTMLDialogElement)`;

/** WCAG 2.5.8's minimum target size, in CSS px a side. */
const TARGET = 24;

/** The space profiles the target size is checked in: the default, regular, and compact, whose
 * tighter --space-* steps make the smallest glyph button. */
const SPACES = ["regular", "compact"];

/** Each glyph button the loaded page renders, the page's and those in its components' shadow
 * roots, each as its name, its aria-label or its text, and its box's width and height. */
const TARGETS = `(() => {
  const roots = [document];
  const found = [];
  for (let i = 0; i < roots.length; i++) {
    for (const element of roots[i].querySelectorAll("*")) {
      if (element.shadowRoot) roots.push(element.shadowRoot);
      if (!element.matches(".glyph-button") || !element.checkVisibility()) continue;
      const { width, height } = element.getBoundingClientRect();
      const name = element.getAttribute("aria-label") ?? element.textContent.trim();
      found.push({ name, width, height });
    }
  }
  return found;
})()`;

/** Asserts every glyph button the loaded page renders, at 390px, where the Pages button shows, and
 * at 1600px, where both drawers are docked, is at least 24 CSS px a side, in the regular and the
 * compact space profiles; and, with each dialog a keyed show-modal opener opens shown as a modal
 * in turn, each glyph button it renders too, its Close among them, then closed. The root's own
 * data-space is put back after. */
async function assertTargetSize(page: Page, url: string): Promise<void> {
  const space: string | null = await page.evaluate(attribute("data-space"));
  const dialogs: string[] = await page.evaluate(OPENED_DIALOGS);
  /** Asserts the size of each glyph button rendered, in the dialog with the id when one is open. */
  const measure = async (width: number, profile: string, dialog?: string): Promise<void> => {
    await page.evaluate(SETTLED);
    const targets: { name: string; width: number; height: number }[] = await page.evaluate(TARGETS);
    const where = dialog === undefined ? "" : ` with #${dialog} open`;
    assert.ok(targets.length > 0, `${url}: at ${width}px it renders a glyph button`);
    if (dialog !== undefined) {
      assert.ok(
        targets.some(({ name }) => name === "Close"),
        `${url}: at ${width}px${where} its Close renders`,
      );
    }
    for (const target of targets) {
      assert.ok(
        target.width >= TARGET - 0.5 && target.height >= TARGET - 0.5,
        `${url}: at ${width}px in the ${profile} space${where} the ${target.name} button is ` +
          `${target.width}px by ${target.height}px, under ${TARGET}px a side`,
      );
    }
  };
  try {
    for (const [width, viewport] of [
      [390, narrow],
      [1600, wide],
    ] as const) {
      await viewport(page);
      for (const profile of SPACES) {
        await page.evaluate(`document.documentElement.setAttribute("data-space", "${profile}")`);
        await measure(width, profile);
        for (const id of dialogs) {
          const dialog = `document.getElementById(${JSON.stringify(id)})`;
          await page.evaluate(`${dialog}.showModal()`);
          try {
            await measure(width, profile, id);
          } finally {
            await page.evaluate(`${dialog}.close()`);
          }
        }
      }
    }
  } finally {
    await page.evaluate(
      space === null
        ? `document.documentElement.removeAttribute("data-space")`
        : `document.documentElement.setAttribute("data-space", ${JSON.stringify(space)})`,
    );
  }
}

/** The widths the header's row is checked at, the captures' (screenshots.ts's WIDTHS): a phone's,
 * and a laptop's on each side of the drawer's dock. */
const HEADER_WIDTHS = [390, 1120, 1376];

/** The loaded page's header as laid out: whether it holds its header-actions group; each rendered
 * button of the group, by its aria-label, and its box's top and bottom; the group's inline end and
 * the header's content box's; the group's top and bottom; and the site nav's first link's top and
 * bottom, its first line, or null with no nav. */
const HEADER_ROW = `(() => {
  const header = document.querySelector("body > header");
  const group = header?.querySelector(":scope > .header-actions");
  if (!group) return null;
  const box = header.getBoundingClientRect();
  const style = getComputedStyle(header);
  const g = group.getBoundingClientRect();
  const first = header.querySelector(":scope > sl-site-nav")?.shadowRoot?.querySelector("a");
  const line = first?.getBoundingClientRect();
  return {
    buttons: [...group.querySelectorAll(":scope > button")]
      .filter((button) => button.checkVisibility())
      .map((button) => {
        const { top, bottom } = button.getBoundingClientRect();
        return { name: button.getAttribute("aria-label"), top, bottom };
      }),
    end: g.right,
    inline: box.right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth),
    top: g.top,
    bottom: g.bottom,
    line: line ? { top: line.top, bottom: line.bottom } : null,
  };
})()`;

/** Asserts the loaded page's header at each of HEADER_WIDTHS: it holds its header-actions group,
 * whose rendered buttons share one line, the group at the header's inline end and on the site
 * nav's first line, however many lines the nav wraps to; and, at 390px, nothing scrolls
 * sideways. */
async function assertHeaderRow(page: Page, url: string): Promise<void> {
  type Row = {
    buttons: { name: string; top: number; bottom: number }[];
    end: number;
    inline: number;
    top: number;
    bottom: number;
    line: { top: number; bottom: number } | null;
  };
  for (const width of HEADER_WIDTHS) {
    await page.cdp("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await page.evaluate(`scrollTo({ top: 0, behavior: "instant" })`);
    await page.evaluate(SETTLED);
    const row: Row | null = await page.evaluate(HEADER_ROW);
    assert.ok(row, `${url}: its header holds its header-actions group`);
    const names = row.buttons.map(({ name }) => name).join(", ");
    assert.ok(
      Math.max(...row.buttons.map(({ top }) => top)) <
        Math.min(...row.buttons.map(({ bottom }) => bottom)),
      `${url}: at ${width}px the header's buttons, ${names}, share one line`,
    );
    assert.ok(
      Math.abs(row.end - row.inline) <= 0.5,
      `${url}: at ${width}px the header's buttons end at its inline end, ${row.end}px, ` +
        `not ${row.inline}px`,
    );
    if (row.line) {
      assert.ok(
        row.top < row.line.bottom && row.bottom > row.line.top,
        `${url}: at ${width}px the header's buttons are on the site nav's first line`,
      );
    }
  }
  await assertNoSidewaysScroll(page, url);
}

/** The settings' character-key switch, its checkbox in sl-settings' shadow root. */
const SWITCH = `${SETTINGS_ELEMENT}?.shadowRoot?.querySelector("input[type=checkbox][name=enabled]")`;

/** Turns the character-key switch in the Settings dialog, open by the Settings button, through its
 * checkbox, then closes the dialog with Escape; opens Help by the Help button, since ? may be off,
 * and resolves to its rows after the turn, closing it with Escape. */
async function turnCharacterKeys(page: Page, url: string): Promise<HelpRow[]> {
  await openSettings(page, url, "button");
  await page.evaluate(`${SWITCH}.scrollIntoView({ block: "nearest", behavior: "instant" })`);
  await clickOn(page, SWITCH, "the settings' character-key switch").catch((error: Error) =>
    assert.fail(`${url}: ${error.message}`),
  );
  await closeSettings(page, url);
  await page.evaluate(`scrollTo({ top: 0, behavior: "instant" })`);
  await click(page, "header button[commandfor=help]");
  await until(page, HELP);
  await until(page, `${HELP_ROWS}.length > 0`);
  await page.evaluate(SETTLED);
  const rows: HelpRow[] = await page.evaluate(HELP_ROWS);
  await press(page, "Escape");
  await until(page, `!${HELP}`);
  return rows;
}

/**
 * Asserts the loaded page's keys help, between the docks: ? opens Help, the shell's dialog#help,
 * whose sl-shortcuts lists exactly the page's bindings as the foundation's keys module holds them
 * (PAGE_BINDINGS), each once, among them the shell's: P, the Pages button's, where the shell has
 * one, shown as the drawer isn't docked; ?, the Help button's; S, the Settings button's; and,
 * where the page has a section tree, J and K, its next and previous section; and, where the page
 * has a pager, H and L, each once, named "Previous page: <title>" and "Next page: <title>" by the
 * top pager's links, where it has them, and neither on a page with none. Escape closes Help.
 * Turning the character-key switch in the Settings dialog off marks each of them off in Help, and
 * J then marks no other section, P opens no drawer, and H and L leave the page where it is; turning
 * it on again, J moves to another section. The reader's keys settings are cleared after, so no
 * other check runs with the keys off. Every control in the header that binds a key shows it in a
 * kbd, upper-cased as Help's rows show it.
 */
async function assertKeysHelp(page: Page, url: string): Promise<void> {
  await between(page);
  await page.evaluate(`scrollTo({ top: 0, behavior: "instant" })`);
  await page.evaluate(SETTLED);
  const controls: { keys: string; shown: string }[] = await page.evaluate(HEADER_KEYS);
  assert.deepEqual(
    controls.map(({ keys }) => ({ keys, shown: keys.toUpperCase() })),
    controls,
    `${url}: every header control that binds a key shows it in a kbd`,
  );
  try {
    await press(page, "?");
    await until(page, HELP).catch(() => assert.fail(`${url}: ? opens Help`));
    await until(page, `${HELP_ROWS}.length > 0`).catch(() =>
      assert.fail(`${url}: Help's sl-shortcuts lists the page's bindings`),
    );
    // Past the dialog's toggle event, a task after the open, so the list is read as it stays.
    await page.evaluate(SETTLED);
    const tree: boolean = await page.evaluate(`!!document.querySelector("sl-section-tree")`);
    const pages: boolean = await page.evaluate(`${PAGES}.shown`);
    const pager: HelpRow[] = await page.evaluate(PAGER_ROWS);
    const rows: HelpRow[] = await page.evaluate(HELP_ROWS);
    const bindings: HelpRow[] = await page.evaluate(PAGE_BINDINGS);
    assert.deepEqual(
      rows,
      bindings,
      `${url}: Help lists exactly the page's bindings, as the keys module holds them`,
    );
    const shell = [
      ...(pages ? [{ keys: "P", action: "Pages", off: false }] : []),
      { keys: "?", action: "Help", off: false },
      { keys: "S", action: "Settings", off: false },
      ...(tree
        ? [
            { keys: "J", action: "Next section", off: false },
            { keys: "K", action: "Previous section", off: false },
          ]
        : []),
    ];
    const missing = shell.filter(
      (binding) =>
        !rows.some(({ keys, action }) => keys === binding.keys && action === binding.action),
    );
    assert.deepEqual(
      missing,
      [],
      `${url}: the page binds the shell's keys, and Help lists them; ` +
        missing.map(({ keys, action }) => `${keys} ${action}`).join(", ") +
        " missing",
    );
    assert.deepEqual(
      rows.filter(({ keys }) => /^[HL]$/.test(keys)),
      pager,
      `${url}: Help lists H and L as its pager's previous and next page, once each, and none ` +
        "on a page with no pager",
    );
    await press(page, "Escape");
    await until(page, `!${HELP}`).catch(() => assert.fail(`${url}: Escape closes Help`));

    assert.deepEqual(
      await turnCharacterKeys(page, url),
      rows.map((row) => ({ ...row, off: [...row.keys].length === 1 })),
      `${url}: the switch in Settings turns every character key off`,
    );
    const marked: string | null = await page.evaluate(MARKED);
    const at: string = await page.evaluate(`location.href`);
    await press(page, "j");
    await press(page, "p");
    await press(page, "h");
    await press(page, "l");
    await page.evaluate(SETTLED);
    assert.equal(await page.evaluate(MARKED), marked, `${url}: with the keys off, J doesn't move`);
    assert.equal(
      await page.evaluate(`location.href`),
      at,
      `${url}: with the keys off, neither H nor L moves to another page`,
    );
    assert.equal(
      await page.evaluate(`${PAGES}.modal`),
      false,
      `${url}: with the keys off, P doesn't open the drawer`,
    );

    assert.deepEqual(
      await turnCharacterKeys(page, url),
      rows,
      `${url}: the switch in Settings turns the character keys on again`,
    );
    if (tree) {
      await press(page, "j");
      await page.evaluate(SETTLED);
      assert.notEqual(
        await page.evaluate(MARKED),
        marked,
        `${url}: with the keys on again, J moves to another section`,
      );
    }
  } finally {
    await page.evaluate(`localStorage.removeItem(${JSON.stringify(KEYS_SETTINGS)})`);
  }
}

/** The settings' shadow root's adopted sheets, each as the names of the layers it declares. */
const SETTINGS_SHEETS = `[...${SETTINGS_ELEMENT}.shadowRoot.adoptedStyleSheets].map((sheet) =>
  [...sheet.cssRules].filter((rule) => rule instanceof CSSLayerBlockRule).map((rule) => rule.name))`;

/** Removes the reader's stored theme choice, so no other check runs with a choice a check made. */
const forgetChoice = (page: Page): Promise<unknown> =>
  page.evaluate(`localStorage.removeItem(${JSON.stringify(KEY)})`);

/** The Settings button and S each open the Settings dialog, its sl-settings rendered and its color
 * row focused, and Escape closes it; the settings' shadow root adopts its sheets, the constructed
 * CSSStyleSheets the build made of their CSS module scripts, the foundation's theme-menu.css in
 * its layer among them, and no stylesheet is fetched for them. */
export const opensSettings: Check = async (page, site, url = site) => {
  const take = await record(page);
  await page.goto(url);
  await openSettings(page, url, "button");
  const layers: string[][] = await page.evaluate(SETTINGS_SHEETS);
  assert.ok(
    layers.some((names) => names.includes("foundation.theme-menu")),
    `${url}: the settings adopt the theme menu's sheet, in its layer`,
  );
  assert.deepEqual(
    take().requests.filter((request) => /(settings|theme-menu)[\w-]*\.css$/.test(request)),
    [],
    `${url}: no stylesheet is fetched for the settings`,
  );
  await closeSettings(page, url);
  // The Settings button's data-keys="s", which keys.js binds.
  await openSettings(page, url, "s");
  await closeSettings(page, url);
};

/** The settings' theme rows, by their section: each row's radios' values, and its checked one. */
const ROWS = `Object.fromEntries([...${SETTINGS_ELEMENT}.shadowRoot.querySelectorAll("[data-section]")]
  .map((row) => [row.dataset.section, {
    values: [...row.querySelectorAll("input")].map((radio) => radio.value),
    checked: row.querySelector(":checked").value,
  }]))`;

/** Stepping each facet's row of the settings, color, space, and type, to the profile after its
 * default sets the facet's attribute on the root at once, with no Save; every row offers more
 * than its default, as the full entry registers every built-in profile. The choice is forgotten
 * after. */
export const stepsEachFacet: Check = async (page, site, url = site) => {
  await page.goto(url);
  try {
    await openSettings(page, url, "s");

    // Each facet's row, by its section, and the root attribute preferences.js sets for it.
    const facets = [
      ["color", "data-palette"],
      ["space", "data-space"],
      ["type", "data-type"],
    ];
    const rows: Record<string, { values: string[]; checked: string }> = await page.evaluate(ROWS);
    for (const [facet] of facets) {
      assert.ok(rows[facet].values.length > 1, `the ${facet} row offers ${rows[facet].values}`);
    }

    // Focus opens on the first row, color; l steps a row to its next radio, j moves down a row.
    // Each facet's row steps once, past the scheme row, to the radio after its default.
    for (const [index, [facet, attribute]] of facets.entries()) {
      if (index > 0) await press(page, "j");
      if (facet === "space") await press(page, "j");
      await until(page, onRow(facet));
      await press(page, "l");
      const { values, checked } = rows[facet];
      const chosen = values[(values.indexOf(checked) + 1) % values.length];
      assert.equal(
        await page.evaluate(`document.documentElement.getAttribute("${attribute}")`),
        chosen,
        `choosing ${chosen} in the ${facet} row sets ${attribute}`,
      );
    }
    await closeSettings(page, url);
  } finally {
    await forgetChoice(page);
  }
};

/** The page's one module script, the build's entry, is render-blocking. */
export const blocksRender: Check = async (page, site, url = site) => {
  await page.goto(url);
  assert.deepEqual(await page.evaluate(BLOCKING), [true], `${url}: its entry blocks render`);
};

/** Once the page loads, every element on it whose name holds a hyphen is defined: a shell that
 * fails to load a component's module leaves its element undefined, named. */
export const definesEveryElement: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertDefined(page, url);
};

/** Every request the page makes, with its Settings and Help dialogs opened, resolves under the
 * base, and none fails or answers an error; and the foundation's theme-menu.js and keys-help.js,
 * which the settings and the shortcuts list stand in for, are never requested. */
export const requestsUnderBase: Check = async (page, site, url = site) => {
  const take = await record(page);
  await page.goto(url);
  await openSettings(page, url, "button");
  await closeSettings(page, url);
  await page.evaluate(`scrollTo({ top: 0, behavior: "instant" })`);
  await click(page, "header button[commandfor=help]");
  await until(page, HELP).catch(() => assert.fail(`${url}: the Help button opens Help`));
  await until(page, `${HELP_ROWS}.length > 0`).catch(() =>
    assert.fail(`${url}: Help's sl-shortcuts lists the page's bindings`),
  );
  await page.evaluate(SETTLED);
  const log = take();
  assertLoaded(url, site, log);
  assert.deepEqual(
    log.requests.filter((request) => /\/(theme-menu|keys-help)[\w-]*\.js$/.test(request)),
    [],
    `${url}: the foundation's theme-menu.js and keys-help.js are never requested`,
  );
};

/** In a 1600px viewport, main holds its reading width, centered. */
export const holdsReadingWidth: Check = async (page, site, url = site) => {
  await wide(page);
  await page.goto(url);
  await assertReadingWidth(page, url);
};

/** Between the layout's docks, main is centered on a page with no section tree, and the tree is
 * docked beside it on a page with one. */
export const holdsBetweenDocks: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertBetweenDocks(page, url);
};

/** On a page with a section tree, the tree is in the Contents drawer: a column docked beside main
 * from the layout's tree dock, J and K moving through its sections, and below it a closed drawer,
 * which following a link in it closes. A page with none has no drawer. */
export const placesSectionTree: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertContents(page, url);
};

/** At 390px, between the docks, and at 1600px, main starts directly under the header, however
 * short the page. */
export const startsUnderHeader: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertUnderHeader(page, url);
};

/** ? opens Help, listing exactly the page's bindings, Escape closes it, and the character-key
 * switch in the Settings dialog turns them off and on again. */
export const opensKeysHelp: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertKeysHelp(page, url);
};

/** Each dialog a keyed show-modal opener opens follows the components' shortcut dialog pattern: a
 * name from a heading inside it, a Close showing Esc, and an opener that shows its key and has a
 * name its interest hint shows; it fails naming each dialog and what it lacks. */
export const followsShortcutDialogs: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertShortcutDialogs(page, url);
};

/** Each header button, Pages where the shell has one, Help, and Settings, and each shortcut
 * dialog's Close, shows its glyph and its key hint, and no word, named by its aria-label. */
export const showsGlyphs: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertGlyphs(page, url);
};

/** Every glyph button the page renders, and each shortcut dialog's, its Close among them, with the
 * dialog open, is at least 24 CSS px a side, at 390px and at 1600px, in the regular and the
 * compact space profiles. */
export const hasTargetSize: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertTargetSize(page, url);
};

/** At 390px, 1120px, and 1376px, the header's buttons share one line at its inline end, on the
 * site nav's first line, and at 390px nothing scrolls sideways. */
export const keepsHeaderRow: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertHeaderRow(page, url);
};

/** In a 390px viewport, nothing on the page scrolls sideways. */
export const fitsNarrowWidth: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertNoSidewaysScroll(page, url);
};

/** At a phone's width, a px below and at each of the layout's docks, and at 1400px, no navigation
 * link breaks inside a word, and every docked side column is at least 16rem wide. */
export const keepsNavigationWords: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertNavigation(page, url);
};

/** A change in the settings is stored at once, with no Save: stepping the color row stores the
 * new palette while the dialog is open, closing it by Escape keeps it, and a reload applies it.
 * Nothing is stored before, and the choice is forgotten after. */
export const storesAtOnce: Check = async (page, site, url = site) => {
  await page.goto(url);
  const stored = `JSON.parse(localStorage.getItem(${JSON.stringify(KEY)}) ?? "null")?.color ?? null`;
  try {
    assert.equal(await page.evaluate(stored), null, `${url}: nothing is stored before a change`);
    await openSettings(page, url, "s");
    await press(page, "l");
    const chosen: string | null = await page.evaluate(attribute("data-palette"));
    assert.ok(chosen, `${url}: stepping the color row applies a palette`);
    assert.equal(await page.evaluate(stored), chosen, `${url}: the change is stored at once`);
    await closeSettings(page, url);
    assert.equal(await page.evaluate(stored), chosen, `${url}: closing the dialog keeps it`);
    await page.goto(url);
    assert.equal(
      await page.evaluate(attribute("data-palette")),
      chosen,
      `${url}: the stored ${chosen} applies after a reload`,
    );
  } finally {
    await forgetChoice(page);
  }
};

/** The foundation registry's color profiles, in registration order, read from its store at the
 * well-known global key every copy of registry.js shares, as profiles("color") gives them. */
const PALETTES = `[...(globalThis[Symbol.for("spike-html-apps-foundation.registry")]?.color ?? [])]`;

/** Each highlighted token on the page, in palette's syntax theme: its text, the color it renders,
 * and the color its --shiki-<palette> variable resolves to where it stands, read through a probe
 * in its block whose inline color, which outranks every layered rule, is the variable's value, so
 * light-dark() resolves against the block's color-scheme as the token's own rule would; and the
 * blocks' plain color, the page's text color a token takes when no rule colors it. A token
 * carrying no variable for the palette, from a build with no syntax theme for it, is left out. */
const tokens = (palette: string): string => `(() => {
  const name = ${JSON.stringify(`--shiki-${palette}`)};
  const blocks = [...document.querySelectorAll(".shiki")];
  const probe = document.createElement("span");
  const resolved = new Map();
  const found = [];
  for (const block of blocks) {
    block.append(probe);
    for (const span of block.querySelectorAll("span")) {
      if (span === probe) continue;
      const style = getComputedStyle(span);
      const value = style.getPropertyValue(name).trim();
      if (value === "") continue;
      if (!resolved.has(value)) {
        probe.style.color = value;
        resolved.set(value, getComputedStyle(probe).color);
      }
      found.push({ text: span.textContent, color: style.color, want: resolved.get(value) });
    }
    probe.remove();
    resolved.clear();
  }
  return {
    blocks: blocks.length,
    plain: blocks.length > 0 ? getComputedStyle(blocks[0]).color : null,
    found,
  };
})()`;

/** A settings theme row's radios' values, and its checked one, by its section. */
const row = (section: string): string => `(() => {
  const row = ${SETTINGS_ELEMENT}.shadowRoot.querySelector('[data-section="${section}"]');
  return {
    values: [...row.querySelectorAll("input")].map((radio) => radio.value),
    checked: row.querySelector(":checked").value,
  };
})()`;

/** The root's attribute. */
const attribute = (name: string): string => `document.documentElement.getAttribute("${name}")`;

/**
 * The page's highlighted code, its .shiki blocks, takes each registered palette's syntax theme:
 * for each palette profiles("color") lists, the color row of the settings in the Settings dialog,
 * opened by S, which lists the same, is stepped to it, and its scheme row to light and then to dark; in each, every token carrying the
 * palette's --shiki-<palette> variable renders the color the variable resolves to there, and some
 * token's color differs from the page's text color. It fails naming the palette and the scheme for
 * a registered palette whose code renders plain: no token carries a color for it, as on a build
 * with no syntax theme for it, or a token keeps the page's text color, as where no rule selects the
 * palette's. It runs on url, a page with highlighted code, which a site's test gives, or on site,
 * its index, when the index holds some. The dialog is closed after, and the choice, which each
 * step stored at once, forgotten.
 */
export const highlightsEachPalette: Check = async (page, site, url = site) => {
  await page.goto(url);
  const palettes: string[] = await page.evaluate(PALETTES);
  assert.ok(palettes.length > 0, `${url}: the registry lists a color profile`);
  try {
    await openSettings(page, url, "s");
    await steps(page, url, palettes);
    await closeSettings(page, url);
  } finally {
    await forgetChoice(page);
  }
};

/** Steps the open settings' color row to each palette, and its scheme row to light and dark in
 * each, asserting the page's code takes the palette's syntax theme there, as highlightsEachPalette
 * has it. */
async function steps(page: Page, url: string, palettes: string[]): Promise<void> {
  const color: { values: string[]; checked: string } = await page.evaluate(row("color"));
  assert.deepEqual(color.values, palettes, "the settings' color row lists the registry's palettes");

  /** Steps the focused row with l until value is checked, once around it at most. */
  const stepTo = async (section: string, value: string): Promise<void> => {
    const { values }: { values: string[] } = await page.evaluate(row(section));
    for (let i = 0; i < values.length; i++) {
      const { checked }: { checked: string } = await page.evaluate(row(section));
      if (checked === value) return;
      await press(page, "l");
    }
    assert.fail(`the ${section} row never reaches ${value}`);
  };

  // Focus opens on the color row; j moves down to the scheme row, and k back up.
  for (const palette of palettes) {
    await stepTo("color", palette);
    // The palette checked at open, the default before any step, applies with no attribute, as a
    // root with none does: flexoki's code is checked there too, under :root:not([data-palette]).
    const applied: string | null = await page.evaluate(attribute("data-palette"));
    assert.equal(applied ?? color.checked, palette, `${palette} applies`);
    await press(page, "j");
    for (const scheme of ["light", "dark"]) {
      await stepTo("scheme", scheme);
      assert.equal(await page.evaluate(attribute("data-scheme")), scheme, `${scheme} applies`);
      const at = `${palette} in ${scheme}`;
      const shown: {
        blocks: number;
        plain: string | null;
        found: { text: string; color: string; want: string }[];
      } = await page.evaluate(tokens(palette));
      assert.ok(shown.blocks > 0, `${url} holds highlighted code, a .shiki block`);
      assert.ok(
        shown.found.length > 0,
        `${at}: ${url}'s code renders plain; no token carries a color for ${palette}`,
      );
      for (const { text, color, want } of shown.found) {
        assert.equal(
          color,
          want,
          `${at}: the token ${JSON.stringify(text)} is ${color}, not ${palette}'s ${want}` +
            (color === shown.plain ? ", the page's text color: its code renders plain" : ""),
        );
      }
      assert.ok(
        shown.found.some(({ color }) => color !== shown.plain),
        `${at}: ${url}'s code renders plain; every token is the page's text color`,
      );
    }
    await press(page, "k");
  }
}

/** The shell checks, by the name a site's test gives each. */
export const shell: Record<string, Check> = {
  "the Settings button and S open the Settings dialog, its settings' sheets adopted": opensSettings,
  "stepping each facet in the settings sets its attribute on the root": stepsEachFacet,
  "the page's one module script is render-blocking": blocksRender,
  "every custom element on the page is defined": definesEveryElement,
  "every request resolves under the base, none fails, and no theme menu or keys help loads":
    requestsUnderBase,
  "main holds its centered reading width at 1600px": holdsReadingWidth,
  "between the docks main is centered with no section tree, beside a docked one": holdsBetweenDocks,
  "the section tree is in the Contents drawer, docked from its dock and closed below it":
    placesSectionTree,
  "main starts directly under the header at 390px, between the docks, and at 1600px":
    startsUnderHeader,
  "? opens Help, listing the page's bindings, and the switch in Settings turns them off":
    opensKeysHelp,
  "each keyed show-modal opener's dialog follows the shortcut dialog pattern":
    followsShortcutDialogs,
  "each header button and each dialog's Close show their glyph and key hint, named, no word":
    showsGlyphs,
  "every glyph button is at least 24px a side, in the regular and the compact space": hasTargetSize,
  "the header's buttons share one line at its inline end, on its first line, at 390px and wider":
    keepsHeaderRow,
  "nothing scrolls sideways at 390px": fitsNarrowWidth,
  "no navigation link breaks inside a word, and each docked column is 16rem or wider":
    keepsNavigationWords,
  "a change in the settings is stored at once and applies after a reload": storesAtOnce,
};

/** A link of the site index or of a pager, as the crawl reads it: its href, resolved, and the title
 * it shows. */
type Linked = { href: string; title: string };

/** The loaded page's pagers, each nav.pager: where it is, main's first element child, its last, or
 * elsewhere; its name; each link's rel, href, resolved, name, data-keys, word, title, the key
 * hints in its aria-hidden kbd elements, and its svg's markup; and each link's height; with the icons the
 * arrows are filled from, as the page's parser serializes them, to compare. */
const PAGERS = `(() => {
  const main = document.querySelector("main");
  const parse = (svg) => {
    const template = document.createElement("template");
    template.innerHTML = svg;
    return template.content.firstElementChild.outerHTML;
  };
  return {
    icons: { prev: parse(${JSON.stringify(arrowLeftIcon)}), next: parse(${JSON.stringify(arrowRightIcon)}) },
    pagers: [...document.querySelectorAll("nav.pager")].map((nav) => ({
      at: nav === main?.firstElementChild ? "top" : nav === main?.lastElementChild ? "bottom" : "elsewhere",
      name: nav.getAttribute("aria-label"),
      links: [...nav.querySelectorAll("a")].map((a) => ({
        rel: a.rel,
        href: a.href,
        name: a.getAttribute("aria-label"),
        keys: a.dataset.keys ?? null,
        word: a.querySelector(".pager-word")?.textContent ?? null,
        title: a.querySelector(".pager-title")?.textContent ?? null,
        hints: [...a.querySelectorAll('[aria-hidden="true"] kbd')].map((kbd) => kbd.textContent),
        glyph: a.querySelector("svg")?.outerHTML ?? null,
      })),
      heights: [...nav.querySelectorAll("a")].map((a) => a.getBoundingClientRect().height),
    })),
  };
})()`;

/** The pager link the selector, under main, names. */
const pagerLink = (selector: string): string =>
  `document.querySelector(${JSON.stringify(`main > ${selector}`)})`;

/**
 * Asserts the loaded copied page's pagers in a 1600px viewport, against its site index, index, its
 * links in document order, the order the pagers step through: two, main's first element child,
 * named pagerLabels.top, and its last, named pagerLabels.bottom; each linking the page before it
 * in index, rel prev, and the page after it, rel next, none past either end, each link showing the
 * arrow its icons module gives, filled, its word, the page's title as the index shows it, and its
 * key hint, H or L, binding that key, named "<word> page: <title>", and at least 24px tall. A page
 * with neither neighbour has no pager. Each link, followed by a click, lands on its page, and H and
 * L, pressed, on the previous and the next. The page is loaded again after.
 */
async function assertPagers(page: Page, url: string, index: Linked[]): Promise<void> {
  type Link = {
    rel: string;
    href: string;
    name: string | null;
    keys: string | null;
    word: string | null;
    title: string | null;
    hints: string[];
    glyph: string | null;
  };
  type Pager = { at: string; name: string | null; links: Link[]; heights: number[] };
  await wide(page);
  const place = index.findIndex(({ href }) => href === url);
  assert.ok(place >= 0, `${url}: its site index lists it`);
  const neighbours = [
    { rel: "prev", word: "Previous", key: "h", linked: index[place - 1] },
    { rel: "next", word: "Next", key: "l", linked: index[place + 1] },
  ].filter((neighbour): neighbour is typeof neighbour & { linked: Linked } => !!neighbour.linked);
  const { icons, pagers }: { icons: Record<string, string>; pagers: Pager[] } =
    await page.evaluate(PAGERS);
  for (const { at, links, heights } of pagers) {
    links.forEach(({ rel }, i) =>
      assert.ok(
        heights[i] >= 24,
        `${url}: the ${at} pager's ${rel} link is at least 24px tall, ${heights[i]}px`,
      ),
    );
  }
  const links = neighbours.map(({ rel, word, key, linked }) => ({
    rel,
    href: linked.href,
    name: `${word} page: ${linked.title}`,
    keys: key,
    word,
    title: linked.title,
    hints: [key.toUpperCase()],
    glyph: icons[rel],
  }));
  assert.deepEqual(
    pagers.map(({ at, name, links }) => ({ at, name, links })),
    links.length === 0
      ? []
      : [
          { at: "top", name: pagerLabels.top, links },
          { at: "bottom", name: pagerLabels.bottom, links },
        ],
    `${url}: a pager at main's top and foot links the pages before and after it in the site index`,
  );
  try {
    for (const where of ["first-child", "last-child"]) {
      for (const { rel, href } of links) {
        const selector = `nav.pager:${where} a[rel=${rel}]`;
        await page.evaluate(
          `${pagerLink(selector)}.scrollIntoView({ block: "center", behavior: "instant" })`,
        );
        const landed = await landing(page, () =>
          clickOn(page, pagerLink(selector), selector).catch((error: Error) =>
            assert.fail(`${url}: ${error.message}`),
          ),
        );
        assert.equal(landed, href, `${url}: following ${selector} lands on ${href}`);
        await page.goto(url);
      }
    }
    for (const { keys, href } of links) {
      await page.evaluate(SETTLED);
      const landed = await landing(page, () => press(page, keys));
      assert.equal(landed, href, `${url}: ${keys.toUpperCase()} moves to ${href}`);
      await page.goto(url);
    }
  } finally {
    if ((await page.evaluate(`location.href`)) !== url) await page.goto(url);
  }
}

/** How long, in ms, a pager link or key is given to land on its page, as until() waits. */
const LANDING = 10_000;

/** Runs act, which should navigate the page, and resolves to the URL of the page it lands on once
 * that page fires its load event, or to null when none loads within LANDING. The load listener is
 * set before act, so a load can't pass unseen, and a navigation's own load, never an earlier one,
 * is what the next goto() waits past. */
async function landing(page: Page, act: () => Promise<void>): Promise<string | null> {
  let timer: NodeJS.Timeout | undefined;
  const loaded = new Promise<boolean>((resolve) => {
    page.on("Page.loadEventFired", () => resolve(true));
    timer = setTimeout(() => resolve(false), LANDING);
  });
  try {
    await act();
    return (await loaded) ? await page.evaluate(`location.href`) : null;
  } finally {
    clearTimeout(timer);
  }
}

/** The loaded hand page has no pager and binds neither H nor L. */
async function assertNoPager(page: Page, url: string): Promise<void> {
  assert.deepEqual(
    await page.evaluate(`({
      pagers: document.querySelectorAll("nav.pager").length,
      keys: document.querySelectorAll('[data-keys="h"], [data-keys="l"]').length,
    })`),
    { pagers: 0, keys: 0 },
    `${url}: a hand page has no pager and binds neither H nor L`,
  );
}

/** Each copied file's page of the site at root, every tree's, by its path under the base (x.md at
 * x.html, dir/README.md at dir/, a single tree's root README.md at the base itself, each of
 * several trees' under its directory), to its source's front matter, null when it has none, read
 * with yaml as the build reads it. */
function sources(root: string): Map<string, Record<string, unknown> | null> {
  return new Map(
    copiedFiles(root)
      .filter((path) => path.endsWith(".md"))
      .map((path) => {
        const page = pageUrl("README.md", path).replace(/^\.\/$/, "");
        const source = readFileSync(join(root, "content", path), "utf8");
        const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
        const data = match ? ((parse(match[1]) ?? {}) as Record<string, unknown>) : null;
        return [page, data];
      }),
  );
}

/** What a crawl reached: its pages, the hand pages among them, and in-site links counted; the
 * paths under the base of the copied pages no link from the index reaches; and those of the hand
 * pages it reached, in the order it reached them. */
export interface Crawled {
  pages: number;
  links: number;
  unreachable: string[];
  hand: string[];
}

/** Crawls every copied page of the Markdown site at root, whose URL under the base is site, from
 * its index, checking each as this module's header lists, and loading each hand page it reaches;
 * resolves to what it reached. */
export async function crawl(page: Page, site: string, root: string): Promise<Crawled> {
  const pages = sources(root);
  /** Each page reached, by its URL, to the ids its elements carry. */
  const reached = new Map<string, Set<string>>();
  /** Each in-site link: the page it's on, and its href, resolved. */
  const links: { from: string; href: string }[] = [];
  /** The copied files' pages no link from the index reaches: once the links run out, the crawl
   * starts again from the first page not reached, so each is checked as a linked one is. */
  const unreachable: string[] = [];
  /** The hand pages reached, by their paths under the base. */
  const hand: string[] = [];
  const next = (): string | undefined => {
    const url = [...pages.keys()].map((path) => `${site}${path}`).find((u) => !reached.has(u));
    if (url !== undefined) unreachable.push(url.slice(site.length));
    return url;
  };
  const queue = [site];
  /** Records the loaded page at url as reached, with its ids, and queues its in-site links. */
  const visit = async (url: string): Promise<void> => {
    const { ids, hrefs }: { ids: string[]; hrefs: string[] } = await page.evaluate(`({
      ids: [...document.querySelectorAll("[id]")].map((element) => element.id),
      hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.href),
    })`);
    reached.set(url, new Set(ids));
    for (const href of hrefs.filter((href) => href.startsWith(site))) {
      links.push({ from: url, href });
      queue.push(href.split("#")[0]);
    }
  };
  const take = await record(page);
  await wide(page);
  for (let url = queue.shift() ?? next(); url !== undefined; url = queue.shift() ?? next()) {
    if (reached.has(url)) continue;
    take();
    await page.goto(url);
    assertLoaded(url, site, take());
    const path = url.slice(site.length);
    if (!pages.has(path)) {
      // A hand page: what it links is followed, and its ids are what links to it reach.
      hand.push(path);
      await assertNoPager(page, url);
      await visit(url);
      continue;
    }
    assert.deepEqual(await page.evaluate(BLOCKING), [true], `${url}: its entry blocks render`);
    await assertDefined(page, url);
    const data = pages.get(path) ?? null;
    const keys = Object.keys(data ?? {});
    const shown: {
      title: string;
      h1: string | null;
      headers: number;
      meta: string[][];
      lists: string[][];
      tables: number;
      index: Linked[];
      drawer: boolean;
      text: string;
    } = await page.evaluate(`(() => {
      const keys = ${JSON.stringify(keys)};
      return {
        title: document.title,
        h1: document.querySelector("main h1")?.textContent.trim() ?? null,
        headers: document.querySelectorAll("sl-page-header").length,
        meta: [...document.head.querySelectorAll("meta[name]")]
          .filter((meta) => keys.includes(meta.name))
          .map((meta) => [meta.name, meta.getAttribute("content")]),
        lists: [...document.querySelectorAll("dl")]
          .filter((dl) => dl.checkVisibility())
          .map((dl) => [...dl.querySelectorAll(":scope > dt, :scope > div > dt")]
            .map((dt) => dt.textContent.trim())),
        tables: document.querySelectorAll("table.front-matter").length,
        index: [...document.querySelectorAll("sl-site-index a[href]")]
          .map((a) => ({ href: a.href, title: a.textContent })),
        drawer: document.querySelectorAll("sl-drawer#pages > sl-site-index").length === 1,
        text: document.body.innerText,
      };
    })()`);
    await assertReadingWidth(page, url);
    await assertNoSidewaysScroll(page, url);
    await assertPagesButton(page, url);
    await assertNavigation(page, url);
    await assertBetweenDocks(page, url);
    await assertContents(page, url);
    await assertUnderHeader(page, url);
    await assertKeysHelp(page, url);
    await assertShortcutDialogs(page, url);
    await assertGlyphs(page, url);
    await assertTargetSize(page, url);
    await assertHeaderRow(page, url);
    await assertPagers(page, url, shown.index);
    await wide(page);
    const name = data?.name;
    assert.equal(shown.title, typeof name === "string" ? name : shown.h1, `${url}'s title`);
    assert.ok(shown.title, `${url} has a title`);
    assert.equal(shown.headers, 0, `${url}: no page header`);
    assert.equal(shown.tables, 0, `${url}: no front matter table remains`);
    const entries = Object.entries(data ?? {});
    assert.deepEqual(
      shown.meta,
      entries.map(([key, value]) => [key, frontMatterText(value)]),
      `${url}: its head holds a meta per front matter key, in order, its content the value`,
    );
    if (keys.length > 0) {
      assert.deepEqual(
        shown.lists.filter((terms) => keys.every((key) => terms.includes(key))),
        [],
        `${url}: no list of its front matter shows`,
      );
    }
    for (const [key, value] of entries) {
      const line = `${key}: ${frontMatterText(value)}`;
      assert.ok(!shown.text.includes(line), `${url}: ${line} isn't the page's text`);
    }
    assert.deepEqual(
      shown.index.map(({ href }) => href).toSorted(),
      [...pages.keys()].map((path) => `${site}${path}`).sort(),
      `${url}: its site index links every copied page, each once`,
    );
    assert.ok(shown.drawer, `${url}: its site index is in the Pages drawer`);
    await visit(url);
  }

  for (const { from, href } of links) {
    const [url, fragment] = href.split("#");
    const ids = reached.get(url);
    assert.ok(ids, `${from} links ${href}, a page reached`);
    if (fragment) {
      assert.ok(ids.has(decodeURIComponent(fragment)), `${from} links ${href}, an id on it`);
    }
  }
  assert.deepEqual(
    [...reached.keys()]
      .map((url) => url.slice(site.length))
      .filter((path) => !hand.includes(path))
      .sort(),
    [...pages.keys()].sort(),
    "the crawl checked every copied file's page",
  );
  return { pages: reached.size, links: links.length, unreachable, hand };
}
