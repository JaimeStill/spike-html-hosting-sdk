// A site's browser checks, each a function over a page of the tooling's browser driver, as the
// tooling's own helpers are (until(page, …)): it loads the site's build, served under its base
// (served.ts), and asserts with node's assert, throwing on the first failure, so a site's test
// calls it inside its own node:test test and owns the browser, the server, and the page.
//
// The shell checks run on a page of the site, its index unless the site's test gives another: a
// Markdown site's index, the page its shell builds, a hand page at the base, or a hand page at any
// path under it, each checked under the site's base. On that page: the Settings button and S open
// the theme menu, which stands in for the Settings dialog until it holds the reader's settings,
// whose CSS module script the build rewrote, so its sheet is adopted with no stylesheet
// fetched for it; stepping the color, space, and type rows each to a profile past its default,
// which the full entry registers, sets that facet's attribute on the root; the page's one module
// script, its entry, is render-blocking; once it loads, every element on the page whose name holds
// a hyphen, a custom element's, is defined, so a shell that fails to load a component's module
// fails naming its tag, where the capture run's wait for each element's definition would hang;
// every request the page makes resolves under the base, and none fails; in a 1600px viewport the
// site's layout holds main to a reading width, centered; at 1200px, between the layout's docks,
// main is centered on a page with no section tree, and the tree is docked beside it on a page with
// one; at 390px, between the docks, and at 1600px, main starts directly under the header, the gap
// from the header's bottom, or the section tree bar's where it sits between them, never below zero
// and no more than on a page taller than the viewport, however short the page; ? opens the shell's
// keys help dialog, which the foundation's keys module fills with the page's bindings, P, ?, S, and
// the tree's H and L, and its character-key switch turns them off, so L moves to no section and P
// opens no drawer, and on again; in a 390px viewport each header button, Pages where the shell has
// one, Help, and Settings, and the keys help's Close each show one glyph, the icons layer's svg for
// list-unordered-16, question-16, gear-16, and x-16, and the key hint in a kbd, both rendered, and
// no word, each named by its aria-label; every rendered glyph button, the page's and its
// components' in their shadow roots, is at least 24 CSS px a side (WCAG 2.5.8), at 390px and at
// 1600px, in the regular and the compact space profiles; the header's buttons, its header-actions
// group, share one line at the header's inline end, on the site nav's first line, at the capture
// widths, 390px, 1120px, and 1376px; nothing scrolls sideways at 390px; at a phone's width, a
// px below and at each of the layout's docks (markdown-pages.ts's docks), and at 1400px, no
// navigation link's word breaks across lines and every docked side column is at least 16rem wide;
// and a choice the menu never saves leaves nothing stored, so a reload shows none of it. shell
// lists them by name, for a site to make a test of each.
//
// The palette check, highlightsEachPalette, runs on a page with highlighted code, which the site's
// test names, since not every site's index holds code: stepping the theme menu to each palette the
// foundation's registry lists, in light and in dark, recolors every highlighted token to the color
// its palette's syntax theme gives it there, read from the token's own --shiki-<palette> variable,
// which the build wrote from the theme; a registered palette whose code renders plain, with no
// syntax theme for it or no rule selecting it, fails, named.
//
// The crawl runs on a Markdown site, one tree or several: from the index, every link into the site
// is followed, breadth first, and each copied file's page reached loads with a 2xx, its one module
// script render-blocking, every custom element on it defined, every request under the base and none
// failed, its main held to a reading width, centered, in a 1600px viewport, nothing scrolling
// sideways in a 390px one, its navigation laid out as the shell check has it at the same widths,
// its layout between the docks, its main under the header, its keys help and glyph buttons, their
// size, and its header's row as the shell checks have them, and its title its source's front matter
// name, or, for a source with no name, its first h1's text. Its Pages button is hidden at 1600px,
// where the site index is docked, and at 390px is shown and opens the Pages drawer as a modal by
// its click and by P, its aria-expanded true while the drawer is open and false once Escape closes
// it. Each page's main opens with its page header, whose dl holds a dt and a dd per front matter
// key, in source order, each key and value as the source holds it, and none for a source with no
// front matter; no front matter table remains, and no key's line shows as body text. Each page's
// site index, in its Pages drawer, links every copied file's page, each once, and no other. Every
// in-site link reaches a built page, and an element with its fragment's id when it has one. The
// crawl checks a page for every Markdown file content.json records, every tree's: a page no link
// from the index reaches is crawled from once the links run out, and returned, for the test's
// diagnostics. A page reached that no record names is a hand page the site also builds, a hand
// index at the base or a hand page elsewhere: it loads with a 2xx, every request under the base and
// none failed, its ids are the targets of the fragments linking it, and its links are followed, but
// the copied pages' checks are left to the shell checks, which a site runs on each hand page by its
// URL; it is returned too.
// Adapted from spike-html-hosting (0a98c8e): test/browser/site.test.ts, its one page a crawl of
// the site's pages.
// Adapted from spike-html-hosting (16c97c6): test/browser/site.test.ts, its checks functions over
// a page, and the stored choice checked unsaved.
// Adapted from spike-html-hosting-architecture (a20a1e0): test/browser/site.test.ts, its crawl a
// function over a page, its sources read from the site's root.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { SETTLED, until } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Page } from "@jaimestill/spike-html-apps-tooling/browser.js";
import gearIcon from "@jaimestill/spike-html-hosting-icons/octicon/gear-16";
import listUnorderedIcon from "@jaimestill/spike-html-hosting-icons/octicon/list-unordered-16";
import questionIcon from "@jaimestill/spike-html-hosting-icons/octicon/question-16";
import xIcon from "@jaimestill/spike-html-hosting-icons/octicon/x-16";
import { parse } from "yaml";

import { copiedFiles } from "./content.ts";
import { docks, frontMatterText, pageUrl } from "./markdown-pages.ts";

/** A check on a fresh page of the site whose URL under the base, as served() gives it, is site:
 * the page at url, a URL under site, site itself, its index, when none is given. */
export type Check = (page: Page, site: string, url?: string) => Promise<void>;

/** The center of the element the selector names, once it is in the viewport and the element a
 * click there reaches, it or one inside it, so nothing covers it; else the state that keeps it
 * from being clicked: the page's scroll, the element's box, the viewport's width, and what a click
 * there reaches instead, as a string. */
const target = (selector: string): string => `(() => {
  const element = document.querySelector(${JSON.stringify(selector)});
  if (!element) return "none in the page";
  const rect = element.getBoundingClientRect();
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  const inside = rect.width > 0 && rect.height > 0 && x >= 0 && y >= 0 &&
    x < innerWidth && y < innerHeight;
  const hit = inside ? document.elementFromPoint(x, y) : null;
  if (hit && element.contains(hit)) return { x, y };
  const reached = hit ? hit.localName + (hit.id ? "#" + hit.id : "") : "nothing in the viewport";
  return "at scroll " + scrollY + ", its box " +
    [rect.x, rect.y, rect.width, rect.height].map(Math.round).join(" ") + " in a " +
    innerWidth + "px viewport, a click at its center reaches " + reached;
})()`;

/** Clicks the element the selector names at its center, as a person's mouse does, once it is in
 * the viewport and nothing covers it there, waiting as until() does; else throws, naming the
 * state that keeps it from being clicked. A click whose press and release land on no element of
 * its own is a click on nothing, so the wait is what makes a click on a page still settling
 * reach its element, never a fixed sleep. */
async function click(page: Page, selector: string): Promise<void> {
  const point = `(${target(selector)})`;
  // Past the wait, the state read once more is what the error names.
  await until(page, `typeof ${point} === "object"`).catch(() => undefined);
  const at: { x: number; y: number } | string = await page.evaluate(point);
  if (typeof at === "string") throw new Error(`${selector} isn't clickable: ${at}`);
  const { x, y } = at;
  for (const type of ["mousePressed", "mouseReleased"]) {
    await page.cdp("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
  }
}

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

/** The theme menu's dialog is open, modal: the Settings button and S open it, cancelling the
 * show-modal they send dialog#settings, until that dialog holds the reader's settings. */
const MODAL = `document.querySelector("sl-theme-menu dialog")?.matches(":modal")`;

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
 * rects; and each docked side column's width, the section tree's and the drawer's in their
 * docked state. A word is a run of neither space nor hyphen, with the hyphen that ends it: a
 * hyphenated compound, as "artifact-keyed", may wrap after its hyphen, where the line breaking
 * the components keep (overflow-wrap and word-break normal) wraps it, but no word breaks
 * elsewhere. A link not rendered, in the bar or the closed drawer, has no rects. */
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
  const columns = [...document.querySelectorAll("sl-section-tree, sl-drawer")]
    .filter((element) => element.matches(":state(docked)"))
    .map((element) => ({ name: element.localName, width: element.getBoundingClientRect().width }));
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

/** The widths main is checked to start under the header at, each with the viewport setter its
 * check uses: a phone's, where the body is one column; BETWEEN, a grid with the drawer undocked;
 * and 1600px, a grid with it docked. */
const UNDER: [number, (page: Page) => Promise<unknown>][] = [
  [390, narrow],
  [BETWEEN, between],
  [1600, wide],
];

/** The loaded page's gap between the header and main, scrolled to the top: main's top less the
 * bottom of the box above it, the header's, or the section tree's where it is the bar between
 * them, a docked tree being beside main, not above it; and the layout's own gap there, the same
 * gap once a spacer at main's end makes the page taller than the viewport, so the body's
 * min-height leaves no room for rows, alignment, or auto margins to push main down, and removed
 * after. */
const UNDER_HEADER = `(() => {
  scrollTo({ top: 0, behavior: "instant" });
  const main = document.querySelector("main");
  const tree = document.querySelector("sl-section-tree");
  const above = tree && !tree.matches(":state(docked)") && tree.getBoundingClientRect().height > 0
    ? tree
    : document.querySelector("body > header");
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

/** The keys help dialog is open, modal. */
const HELP = `!!document.querySelector("dialog#help")?.matches(":modal")`;

/** The keys help dialog's bindings table: each row's keys, as its kbd elements read, and its
 * action, the row's button's label; and which rows are marked off. */
const HELP_ROWS = `[...document.querySelectorAll("#help [data-keys-table] tbody tr:not([data-keys-fixed])")]
  .map((tr) => ({
    keys: [...tr.cells[0].querySelectorAll("kbd")].map((kbd) => kbd.textContent).join(" "),
    action: tr.cells[1].textContent.trim(),
    off: tr.hasAttribute("data-keys-off"),
  }))`;

/** The header's controls that bind a key, each as its data-keys and the text of the kbd elements
 * it shows, joined by a space. */
const HEADER_KEYS = `[...document.querySelectorAll("header [data-keys]")].map((control) => ({
    keys: control.dataset.keys,
    shown: [...control.querySelectorAll("kbd")].map((kbd) => kbd.textContent).join(" "),
  }))`;

/** A row of the keys help dialog's bindings table, as HELP_ROWS reads it. */
type HelpRow = { keys: string; action: string; off: boolean };

/** The href of the section tree's link marked as the section in view, or null. */
const MARKED = `document.querySelector("sl-section-tree a[aria-current]")?.getAttribute("href") ?? null`;

/** The shell's glyph buttons, by the selector that finds each: its name, its aria-label; its key
 * hint, the kbd it shows; and its glyph, the icons module whose svg the build fills its marker
 * with. The Pages button is the shell's where it has one, which a hand page may leave out. */
const GLYPHS: Record<string, { name: string; hint: string; icon: string }> = {
  "header .pages-opener[data-keys=p]": { name: "Pages", hint: "P", icon: listUnorderedIcon },
  "header button[commandfor=help][data-keys]": { name: "Help", hint: "?", icon: questionIcon },
  "header button[commandfor=settings][data-keys]": { name: "Settings", hint: "S", icon: gearIcon },
  "dialog#help button[commandfor=help][command=close]": { name: "Close", hint: "?", icon: xIcon },
};

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
 * each header button the shell has, Pages, Help, and Settings, and, with the keys help dialog
 * open, its Close, shows one glyph, the icons module's svg (1em square, currentColor, aria-hidden
 * and focusable="false"), and its key hint in a kbd, both rendered, and no word, named by its
 * aria-label. The Help and Settings buttons and the dialog's Close are every shell's. The page is
 * scrolled to its top first, and the dialog is closed after. */
async function assertGlyphs(page: Page, url: string): Promise<void> {
  await narrow(page);
  // At the top, where the Help button is clicked, as a check before may have scrolled the page.
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
  const close = Object.keys(GLYPHS).filter((selector) => selector.startsWith("dialog#help "));
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
  try {
    const opens = `${url}: the Help button opens the keys help`;
    // No dialog is open, the keys help the check before closed among them, and the page is at its
    // top, so the Help button is in the viewport: a section move the check before left scrolling
    // smoothly may land after the scroll to the top above, so the top is taken again until it holds.
    await until(page, `!document.querySelector("dialog[open]")`).catch(() =>
      assert.fail(`${opens}; a dialog is still open before its click`),
    );
    await until(page, `scrollY === 0 || void scrollTo({ top: 0, behavior: "instant" })`).catch(() =>
      assert.fail(`${opens}; the page doesn't stay at its top before its click`),
    );
    await click(page, "header button[commandfor=help]").catch((error: Error) =>
      assert.fail(`${opens}; ${error.message}`),
    );
    await until(page, HELP).catch(() => assert.fail(opens));
    const closing: Shown[] = await page.evaluate(glyphsShown(close));
    assert.deepEqual(
      closing,
      close.map(expect),
      `${url}: the keys help's Close shows its glyph and its key hint, no word, named Close`,
    );
  } finally {
    await press(page, "Escape");
    await until(page, `!${HELP}`);
  }
}

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

/** Asserts every glyph button the loaded page renders, at 390px, where the Pages button and the
 * section tree's bar show, and at 1600px, where the drawer and the tree are docked, is at least
 * 24 CSS px a side, in the regular and the compact space profiles; the root's own data-space is
 * put back after. */
async function assertTargetSize(page: Page, url: string): Promise<void> {
  const space: string | null = await page.evaluate(attribute("data-space"));
  try {
    for (const [width, viewport] of [
      [390, narrow],
      [1600, wide],
    ] as const) {
      await viewport(page);
      for (const profile of SPACES) {
        await page.evaluate(`document.documentElement.setAttribute("data-space", "${profile}")`);
        await page.evaluate(SETTLED);
        const targets: { name: string; width: number; height: number }[] =
          await page.evaluate(TARGETS);
        assert.ok(targets.length > 0, `${url}: at ${width}px it renders a glyph button`);
        for (const target of targets) {
          assert.ok(
            target.width >= TARGET - 0.5 && target.height >= TARGET - 0.5,
            `${url}: at ${width}px in the ${profile} space the ${target.name} button is ` +
              `${target.width}px by ${target.height}px, under ${TARGET}px a side`,
          );
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

/** The localStorage key the foundation's keys.js stores the reader's keys settings under. */
const KEYS_SETTINGS = "spike-html-apps-foundation.keys";

/** Turns the keys help dialog's character-key switch, through its checkbox, with the dialog open
 * by the Help button, then closes it with Escape; resolves to the dialog's rows after the turn. */
async function turnCharacterKeys(page: Page): Promise<HelpRow[]> {
  await click(page, "button[commandfor=help][command=show-modal]");
  await until(page, HELP);
  await until(page, `!!document.querySelector("#help [data-keys-settings]")`);
  await click(page, `#help [data-keys-settings] input[name=enabled]`);
  const rows: HelpRow[] = await page.evaluate(HELP_ROWS);
  await press(page, "Escape");
  await until(page, `!${HELP}`);
  return rows;
}

/**
 * Asserts the loaded page's keys help, between the docks: ? opens the help dialog, the shell's
 * dialog#help, which the foundation's keys module fills, listing the page's bindings, each once:
 * P, the Pages button's, where the shell has one, shown as the drawer isn't docked; ?, the Help
 * button's; S, the Settings button's; and, where the page has a section tree, H and L, its previous
 * and next section. Turning its character-key switch off marks each of them off, and L then marks
 * no other section and P opens no drawer; turning it on again, L moves to another section. The
 * reader's keys settings are cleared after, so no other check runs with the keys off. Every
 * control in the header that binds a key shows it in a kbd, upper-cased as the help's rows show
 * it.
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
    await until(page, HELP).catch(() => assert.fail(`${url}: ? opens the keys help dialog`));
    await until(page, `${HELP_ROWS}.length > 0`);
    const tree: boolean = await page.evaluate(`!!document.querySelector("sl-section-tree")`);
    const pages: boolean = await page.evaluate(`${PAGES}.shown`);
    const rows: HelpRow[] = await page.evaluate(HELP_ROWS);
    const sections = [
      { keys: "H", action: "Previous section", off: false },
      { keys: "L", action: "Next section", off: false },
    ];
    assert.deepEqual(
      rows,
      [
        ...(pages ? [{ keys: "P", action: "Pages", off: false }] : []),
        { keys: "?", action: "Help", off: false },
        { keys: "S", action: "Settings", off: false },
        ...(tree ? sections : []),
      ],
      `${url}: the keys help lists the page's bindings`,
    );
    await press(page, "Escape");
    await until(page, `!${HELP}`);

    assert.deepEqual(
      await turnCharacterKeys(page),
      rows.map((row) => ({ ...row, off: true })),
      `${url}: the switch turns every character key off`,
    );
    const marked: string | null = await page.evaluate(MARKED);
    await press(page, "l");
    await press(page, "p");
    await page.evaluate(SETTLED);
    assert.equal(await page.evaluate(MARKED), marked, `${url}: with the keys off, L doesn't move`);
    assert.equal(
      await page.evaluate(`${PAGES}.modal`),
      false,
      `${url}: with the keys off, P doesn't open the drawer`,
    );

    assert.deepEqual(
      await turnCharacterKeys(page),
      rows,
      `${url}: the switch turns the character keys on again`,
    );
    if (tree) {
      await press(page, "l");
      await page.evaluate(SETTLED);
      assert.notEqual(
        await page.evaluate(MARKED),
        marked,
        `${url}: with the keys on again, L moves to another section`,
      );
    }
  } finally {
    await page.evaluate(`localStorage.removeItem(${JSON.stringify(KEYS_SETTINGS)})`);
  }
}

/** The Settings button and S each open the theme menu, which stands in for the Settings dialog
 * until it holds the reader's settings, and which adopts its sheet, the constructed CSSStyleSheet
 * the build made of its CSS module script, onto the document, in its layer; no stylesheet is
 * fetched for it, and its chunk loads on the first open. */
export const opensThemeMenu: Check = async (page, site, url = site) => {
  const take = await record(page);
  await page.goto(url);
  // The entry ran before first paint: sl-theme-menu is defined, the menu itself not loaded.
  assert.equal(await page.evaluate(`!!customElements.get("sl-theme-menu")`), true);
  assert.equal(await page.evaluate("document.adoptedStyleSheets.length"), 0);

  await click(page, "header button[commandfor=settings]");
  await until(page, MODAL);
  const sheets = await page.evaluate(`document.adoptedStyleSheets.map((sheet) =>
    [...sheet.cssRules].map((rule) => rule.name))`);
  assert.deepEqual(sheets, [["foundation.theme-menu"]], "the menu's sheet is adopted");
  const { requests } = take();
  assert.ok(
    requests.some((url) => /\/assets\/theme-menu-[\w-]+\.js$/.test(url)),
    "the menu's chunk loaded",
  );
  assert.deepEqual(
    requests.filter((url) => /theme-menu[\w-]*\.css$/.test(url)),
    [],
    "no stylesheet is fetched for the menu",
  );

  await press(page, "Escape");
  await until(page, `!document.querySelector("sl-theme-menu dialog")`);
  // The Settings button's data-keys="s", which keys.js binds.
  await press(page, "s");
  await until(page, MODAL);
};

/** Stepping each facet's row, color, space, and type, to the profile after its default sets the
 * facet's attribute on the root; every row offers more than its default, as the full entry
 * registers every built-in profile. */
export const stepsEachFacet: Check = async (page, site, url = site) => {
  await page.goto(url);
  await press(page, "s");
  await until(page, MODAL);

  // Each facet's row, by its section, and the root attribute preferences.js sets for it.
  const facets = [
    ["color", "data-palette"],
    ["space", "data-space"],
    ["type", "data-type"],
  ];
  const rows: Record<string, { values: string[]; checked: string }> = await page.evaluate(`
    Object.fromEntries([...document.querySelectorAll("sl-theme-menu [data-section]")].map(
      (row) => [row.dataset.section, {
        values: [...row.querySelectorAll("input")].map((radio) => radio.value),
        checked: row.querySelector(":checked").value,
      }]))`);
  for (const [facet] of facets) {
    assert.ok(rows[facet].values.length > 1, `the ${facet} row offers ${rows[facet].values}`);
  }

  // Focus opens on the first row, color; l steps a row to its next radio, j moves down a row.
  // Each facet's row steps once, past the scheme row, to the radio after its default.
  for (const [index, [facet, attribute]] of facets.entries()) {
    if (index > 0) await press(page, "j");
    if (facet === "space") await press(page, "j");
    await press(page, "l");
    const { values, checked } = rows[facet];
    const chosen = values[(values.indexOf(checked) + 1) % values.length];
    assert.equal(
      await page.evaluate(`document.documentElement.getAttribute("${attribute}")`),
      chosen,
      `choosing ${chosen} in the ${facet} row sets ${attribute}`,
    );
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

/** Every request the page makes, the menu's chunk on its first open included, resolves under the
 * base, and none fails or answers an error. */
export const requestsUnderBase: Check = async (page, site, url = site) => {
  const take = await record(page);
  await page.goto(url);
  await click(page, "header button[commandfor=settings]");
  await until(page, MODAL);
  assertLoaded(url, site, take());
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

/** At 390px, between the docks, and at 1600px, main starts directly under the header, however
 * short the page. */
export const startsUnderHeader: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertUnderHeader(page, url);
};

/** ? opens the keys help dialog, listing the page's bindings, whose character-key switch turns
 * them off and on again. */
export const opensKeysHelp: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertKeysHelp(page, url);
};

/** Each header button, Pages where the shell has one, Help, and Theme, and the keys help's Close,
 * shows its glyph and its key hint, and no word, named by its aria-label. */
export const showsGlyphs: Check = async (page, site, url = site) => {
  await page.goto(url);
  await assertGlyphs(page, url);
};

/** Every glyph button the page renders is at least 24 CSS px a side, at 390px and at 1600px, in
 * the regular and the compact space profiles. */
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

/** A choice the menu never saves, stepped and then cancelled, stores nothing, and a reload shows
 * none of it: the site leaves the reader's choice to the menu's Save. */
export const staysUnsaved: Check = async (page, site, url = site) => {
  await page.goto(url);
  const stored = `localStorage.getItem(${JSON.stringify(KEY)})`;
  assert.equal(await page.evaluate(stored), null, "nothing is stored before a choice");
  await press(page, "s");
  await until(page, MODAL);
  await press(page, "l");
  const chosen = await page.evaluate(`document.documentElement.getAttribute("data-palette")`);
  await press(page, "Escape");
  await until(page, `!document.querySelector("sl-theme-menu dialog")`);
  assert.equal(await page.evaluate(stored), null, "a cancelled choice stores nothing");
  await page.goto(url);
  assert.equal(await page.evaluate(stored), null, "nothing is stored after a reload");
  assert.notEqual(
    await page.evaluate(`document.documentElement.getAttribute("data-palette")`),
    chosen,
    `the cancelled ${chosen} doesn't persist past a reload`,
  );
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

/** A theme menu row's radios' values, and its checked one, by its section. */
const row = (section: string): string => `(() => {
  const row = document.querySelector('sl-theme-menu [data-section="${section}"]');
  return {
    values: [...row.querySelectorAll("input")].map((radio) => radio.value),
    checked: row.querySelector(":checked").value,
  };
})()`;

/** The root's attribute. */
const attribute = (name: string): string => `document.documentElement.getAttribute("${name}")`;

/**
 * The page's highlighted code, its .shiki blocks, takes each registered palette's syntax theme:
 * for each palette profiles("color") lists, the theme menu's color row, which lists the same, is
 * stepped to it, and its scheme row to light and then to dark; in each, every token carrying the
 * palette's --shiki-<palette> variable renders the color the variable resolves to there, and some
 * token's color differs from the page's text color. It fails naming the palette and the scheme for
 * a registered palette whose code renders plain: no token carries a color for it, as on a build
 * with no syntax theme for it, or a token keeps the page's text color, as where no rule selects the
 * palette's. It runs on url, a page with highlighted code, which a site's test gives, or on site,
 * its index, when the index holds some. The menu is cancelled after, so nothing is stored.
 */
export const highlightsEachPalette: Check = async (page, site, url = site) => {
  await page.goto(url);
  const palettes: string[] = await page.evaluate(PALETTES);
  assert.ok(palettes.length > 0, `${url}: the registry lists a color profile`);
  await press(page, "s");
  await until(page, MODAL);
  const color: { values: string[]; checked: string } = await page.evaluate(row("color"));
  assert.deepEqual(color.values, palettes, "the menu's color row lists the registry's palettes");

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
  await press(page, "Escape");
  await until(page, `!document.querySelector("sl-theme-menu dialog")`);
};

/** The shell checks, by the name a site's test gives each. */
export const shell: Record<string, Check> = {
  "the Settings button and S open the theme menu, its sheet adopted": opensThemeMenu,
  "stepping each facet sets its attribute on the root": stepsEachFacet,
  "the page's one module script is render-blocking": blocksRender,
  "every custom element on the page is defined": definesEveryElement,
  "every request resolves under the base, and none fails": requestsUnderBase,
  "main holds its centered reading width at 1600px": holdsReadingWidth,
  "between the docks main is centered with no section tree, beside a docked one": holdsBetweenDocks,
  "main starts directly under the header at 390px, between the docks, and at 1600px":
    startsUnderHeader,
  "? opens the keys help, listing the page's bindings, and its switch turns them off":
    opensKeysHelp,
  "each header button and the keys help's Close show their glyph and key hint, named, no word":
    showsGlyphs,
  "every glyph button is at least 24px a side, in the regular and the compact space": hasTargetSize,
  "the header's buttons share one line at its inline end, on its first line, at 390px and wider":
    keepsHeaderRow,
  "nothing scrolls sideways at 390px": fitsNarrowWidth,
  "no navigation link breaks inside a word, and each docked column is 16rem or wider":
    keepsNavigationWords,
  "the theme menu stays unsaved: no stored choice persists": staysUnsaved,
};

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
      await visit(url);
      continue;
    }
    assert.deepEqual(await page.evaluate(BLOCKING), [true], `${url}: its entry blocks render`);
    await assertDefined(page, url);
    const data = pages.get(path) ?? null;
    const shown: {
      title: string;
      h1: string | null;
      headers: number;
      fields: string[][] | null;
      tables: number;
      index: string[];
      drawer: boolean;
      body: string[];
    } = await page.evaluate(`(() => {
      const header = document.querySelector("main > sl-page-header:first-child");
      return {
        title: document.title,
        h1: document.querySelector("main h1")?.textContent.trim() ?? null,
        headers: document.querySelectorAll("sl-page-header").length,
        fields: header && [...header.querySelectorAll(":scope > dl > :is(dt, dd)")].map(
          (field) => [field.localName, field.textContent]),
        tables: document.querySelectorAll("table.front-matter").length,
        index: [...document.querySelectorAll("sl-site-index a[href]")].map((a) => a.href),
        drawer: document.querySelectorAll("sl-drawer#pages > sl-site-index").length === 1,
        body: [...document.querySelectorAll("main p, main :is(h1, h2, h3, h4, h5, h6)")]
          .filter((element) => !element.closest("sl-page-header"))
          .map((element) => element.textContent),
      };
    })()`);
    await assertReadingWidth(page, url);
    await assertNoSidewaysScroll(page, url);
    await assertPagesButton(page, url);
    await assertNavigation(page, url);
    await assertBetweenDocks(page, url);
    await assertUnderHeader(page, url);
    await assertKeysHelp(page, url);
    await assertGlyphs(page, url);
    await assertTargetSize(page, url);
    await assertHeaderRow(page, url);
    await wide(page);
    const name = data?.name;
    assert.equal(shown.title, typeof name === "string" ? name : shown.h1, `${url}'s title`);
    assert.ok(shown.title, `${url} has a title`);
    assert.equal(shown.headers, 1, `${url}: one page header`);
    assert.equal(shown.tables, 0, `${url}: no front matter table remains`);
    const entries = Object.entries(data ?? {});
    assert.deepEqual(
      shown.fields,
      entries.flatMap(([key, value]) => [
        ["dt", key],
        ["dd", frontMatterText(value)],
      ]),
      `${url}: its main opens with its page header, a dt and a dd per front matter key in order`,
    );
    for (const [key, value] of entries) {
      const line = `${key}: ${frontMatterText(value)}`;
      assert.deepEqual(
        shown.body.filter((body) => body.includes(line)),
        [],
        `${url}: ${line} isn't body text`,
      );
    }
    assert.deepEqual(
      shown.index.toSorted(),
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
