// A site's browser checks, each a function over a page of the tooling's browser driver, as the
// tooling's own helpers are (until(page, …)): it loads the site's build, served under its base
// (served.ts), and asserts with node's assert, throwing on the first failure, so a site's test
// calls it inside its own node:test test and owns the browser, the server, and the page.
//
// The shell checks run on a site's index, the page its shell builds, and the root's one page: the
// Theme button and T open the theme menu, whose CSS module script the build rewrote, so its sheet
// is adopted with no stylesheet fetched for it; stepping the color, space, and type rows each to a
// profile past its default, which the full entry registers, sets that facet's attribute on the
// root; the page's one module script, its entry, is render-blocking; once it loads, every element
// on the page whose name holds a hyphen, a custom element's, is defined, so a shell that fails to
// load a component's module fails naming its tag, where the capture run's wait for each element's
// definition would hang; every request the page makes resolves under the base, and none fails; in
// a 1600px viewport the site's layout holds main to a reading width, centered; in a 390px one
// nothing scrolls sideways; at a phone's width, a px below and at each of the layout's docks
// (markdown-pages.ts's docks), and at 1400px, no navigation link's word breaks across lines and
// every docked side column is at least 16rem wide; and a choice the menu never saves leaves
// nothing stored, so a reload shows none of it. shell lists them by name, for a site to make a
// test of each.
//
// The palette check, highlightsEachPalette, runs on a page with highlighted code, which the site's
// test names, since not every site's index holds code: stepping the theme menu to each palette the
// foundation's registry lists, in light and in dark, recolors every highlighted token to the color
// its palette's syntax theme gives it there, read from the token's own --shiki-<palette> variable,
// which the build wrote from the theme; a registered palette whose code renders plain, with no
// syntax theme for it or no rule selecting it, fails, named.
//
// The crawl runs on a Markdown site: from the index, every link into the site is followed,
// breadth first, and each page reached loads with a 2xx, its one module script render-blocking,
// every custom element on it defined, every request under the base and none failed, its main
// held to a reading width, centered, in a 1600px viewport, nothing scrolling sideways in a 390px
// one, its navigation laid out as the shell check has it at the same widths, and its title its
// source's front matter name, or, for a source with no name, its first h1's text. Its Pages button
// is hidden at 1600px, where the site index is docked, and at 390px is shown and opens the Pages
// drawer as a modal by its click and by P, its aria-expanded true while the drawer is open and
// false once Escape closes it. Each page's main opens with its page header, whose dl holds a dt
// and a dd per front matter key, in source order, each key and value as the source holds it, and
// none for a source with no front matter; no front matter table remains, and no key's line shows
// as body text. Each page's site index, in its Pages drawer, links every page the build writes,
// each once, and no other. Every in-site link reaches a built page, and an element with its
// fragment's id when it has one. The crawl checks a page for every file content.json records, and
// no other: a page no link from the index reaches is crawled from once the links run out, and
// returned, for the test's diagnostics.
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
import { parse } from "yaml";

import type { Content } from "./content.ts";
import { docks, frontMatterText, pageUrl } from "./markdown-pages.ts";

/** A check on a fresh page of the site whose URL under the base, as served() gives it, is site. */
export type Check = (page: Page, site: string) => Promise<void>;

/** Clicks the element the selector names at its center, as a person's mouse does. */
async function click(page: Page, selector: string): Promise<void> {
  const { x, y } = await page.evaluate(`(() => {
    const rect = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  })()`);
  for (const type of ["mousePressed", "mouseReleased"]) {
    await page.cdp("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
  }
}

/** Presses a key as a US keyboard types it: keyDown, with its text for a letter, then keyUp. */
async function press(page: Page, key: string): Promise<void> {
  const letter = /^[a-z]$/.test(key);
  const event = letter
    ? {
        key,
        code: `Key${key.toUpperCase()}`,
        windowsVirtualKeyCode: key.toUpperCase().charCodeAt(0),
      }
    : { key, code: key, windowsVirtualKeyCode: key === "Escape" ? 27 : 0 };
  await page.cdp("Input.dispatchKeyEvent", {
    type: "keyDown",
    ...event,
    ...(letter ? { text: key } : {}),
  });
  await page.cdp("Input.dispatchKeyEvent", { type: "keyUp", ...event });
}

/** The theme menu's dialog is open, modal. */
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

/** The Theme button and T each open the theme menu, which adopts its sheet, the constructed
 * CSSStyleSheet the build made of its CSS module script, onto the document, in its layer; no
 * stylesheet is fetched for it, and its chunk loads on the first open. */
export const opensThemeMenu: Check = async (page, site) => {
  const take = await record(page);
  await page.goto(site);
  // The entry ran before first paint: sl-theme-menu is defined, the menu itself not loaded.
  assert.equal(await page.evaluate(`!!customElements.get("sl-theme-menu")`), true);
  assert.equal(await page.evaluate("document.adoptedStyleSheets.length"), 0);

  await click(page, "button[commandfor=theme]");
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
  // The Theme button's data-keys="t", which keys.js binds.
  await press(page, "t");
  await until(page, MODAL);
};

/** Stepping each facet's row, color, space, and type, to the profile after its default sets the
 * facet's attribute on the root; every row offers more than its default, as the full entry
 * registers every built-in profile. */
export const stepsEachFacet: Check = async (page, site) => {
  await page.goto(site);
  await press(page, "t");
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
export const blocksRender: Check = async (page, site) => {
  await page.goto(site);
  assert.deepEqual(await page.evaluate(BLOCKING), [true], `${site}: its entry blocks render`);
};

/** Once the page loads, every element on it whose name holds a hyphen is defined: a shell that
 * fails to load a component's module leaves its element undefined, named. */
export const definesEveryElement: Check = async (page, site) => {
  await page.goto(site);
  await assertDefined(page, site);
};

/** Every request the page makes, the menu's chunk on its first open included, resolves under the
 * base, and none fails or answers an error. */
export const requestsUnderBase: Check = async (page, site) => {
  const take = await record(page);
  await page.goto(site);
  await click(page, "button[commandfor=theme]");
  await until(page, MODAL);
  assertLoaded(site, site, take());
};

/** In a 1600px viewport, main holds its reading width, centered. */
export const holdsReadingWidth: Check = async (page, site) => {
  await wide(page);
  await page.goto(site);
  await assertReadingWidth(page, site);
};

/** In a 390px viewport, nothing on the page scrolls sideways. */
export const fitsNarrowWidth: Check = async (page, site) => {
  await page.goto(site);
  await assertNoSidewaysScroll(page, site);
};

/** At a phone's width, a px below and at each of the layout's docks, and at 1400px, no navigation
 * link breaks inside a word, and every docked side column is at least 16rem wide. */
export const keepsNavigationWords: Check = async (page, site) => {
  await page.goto(site);
  await assertNavigation(page, site);
};

/** A choice the menu never saves, stepped and then cancelled, stores nothing, and a reload shows
 * none of it: the site leaves the reader's choice to the menu's Save. */
export const staysUnsaved: Check = async (page, site) => {
  await page.goto(site);
  const stored = `localStorage.getItem(${JSON.stringify(KEY)})`;
  assert.equal(await page.evaluate(stored), null, "nothing is stored before a choice");
  await press(page, "t");
  await until(page, MODAL);
  await press(page, "l");
  const chosen = await page.evaluate(`document.documentElement.getAttribute("data-palette")`);
  await press(page, "Escape");
  await until(page, `!document.querySelector("sl-theme-menu dialog")`);
  assert.equal(await page.evaluate(stored), null, "a cancelled choice stores nothing");
  await page.goto(site);
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
 * token's color differs from the page's text color. It fails naming the palette and the scheme
 * for a registered palette whose code renders plain: no token carries a color for it, as on a
 * build with no syntax theme for it, or a token keeps the page's text color, as where no rule
 * selects the palette's. It runs on url, a page with highlighted code, which a site's test gives:
 * its index, when the index holds some. The menu is cancelled after, so nothing is stored.
 */
export const highlightsEachPalette: Check = async (page, url) => {
  await page.goto(url);
  const palettes: string[] = await page.evaluate(PALETTES);
  assert.ok(palettes.length > 0, `${url}: the registry lists a color profile`);
  await press(page, "t");
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
  "the Theme button and T open the theme menu, its sheet adopted": opensThemeMenu,
  "stepping each facet sets its attribute on the root": stepsEachFacet,
  "the page's one module script is render-blocking": blocksRender,
  "every custom element on the page is defined": definesEveryElement,
  "every request resolves under the base, and none fails": requestsUnderBase,
  "main holds its centered reading width at 1600px": holdsReadingWidth,
  "nothing scrolls sideways at 390px": fitsNarrowWidth,
  "no navigation link breaks inside a word, and each docked column is 16rem or wider":
    keepsNavigationWords,
  "the theme menu stays unsaved: no stored choice persists": staysUnsaved,
};

/** Each copied file's page of the site at root, by its path under the base (x.md at x.html,
 * dir/README.md at dir/, the root's README.md at the base itself), to its source's front matter,
 * null when it has none, read with yaml as the build reads it. */
function sources(root: string): Map<string, Record<string, unknown> | null> {
  const content: Content = JSON.parse(readFileSync(join(root, "content.json"), "utf8"));
  return new Map(
    Object.keys(content.files)
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

/** What a crawl reached: its pages and in-site links counted, and the paths under the base of the
 * pages no link from the index reaches. */
export interface Crawled {
  pages: number;
  links: number;
  unreachable: string[];
}

/** Crawls every page of the Markdown site at root, whose URL under the base is site, from its
 * index, checking each as this module's header lists; resolves to what it reached. */
export async function crawl(page: Page, site: string, root: string): Promise<Crawled> {
  const pages = sources(root);
  /** Each page reached, by its URL, to the ids its elements carry. */
  const reached = new Map<string, Set<string>>();
  /** Each in-site link: the page it's on, and its href, resolved. */
  const links: { from: string; href: string }[] = [];
  /** The copied files' pages no link from the index reaches: once the links run out, the crawl
   * starts again from the first page not reached, so each is checked as a linked one is. */
  const unreachable: string[] = [];
  const next = (): string | undefined => {
    const url = [...pages.keys()].map((path) => `${site}${path}`).find((u) => !reached.has(u));
    if (url !== undefined) unreachable.push(url.slice(site.length));
    return url;
  };
  const queue = [site];
  const take = await record(page);
  await wide(page);
  for (let url = queue.shift() ?? next(); url !== undefined; url = queue.shift() ?? next()) {
    if (reached.has(url)) continue;
    take();
    await page.goto(url);
    assertLoaded(url, site, take());
    assert.deepEqual(await page.evaluate(BLOCKING), [true], `${url}: its entry blocks render`);
    await assertDefined(page, url);
    const path = url.slice(site.length);
    assert.ok(pages.has(path), `${url} is a copied file's page`);
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
      `${url}: its site index links every page the build writes, each once`,
    );
    assert.ok(shown.drawer, `${url}: its site index is in the Pages drawer`);

    const { ids, hrefs }: { ids: string[]; hrefs: string[] } = await page.evaluate(`({
      ids: [...document.querySelectorAll("[id]")].map((element) => element.id),
      hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.href),
    })`);
    reached.set(url, new Set(ids));
    for (const href of hrefs.filter((href) => href.startsWith(site))) {
      links.push({ from: url, href });
      queue.push(href.split("#")[0]);
    }
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
    [...reached.keys()].map((url) => url.slice(site.length)).sort(),
    [...pages.keys()].sort(),
    "the crawl checked every copied file's page, and no other",
  );
  return { pages: reached.size, links: links.length, unreachable };
}
