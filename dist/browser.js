// A site's browser checks, each a function over a page of the tooling's browser driver, as the
// tooling's own helpers are (until(page, …)): it loads the site's build, served under its base
// (served.ts), and asserts with node's assert, throwing on the first failure, so a site's test
// calls it inside its own node:test test and owns the browser, the server, and the page.
//
// The shell checks run on a site's index, the page its shell builds, and the root's one page: the
// Theme button and T open the theme menu, whose CSS module script the build rewrote, so its sheet
// is adopted with no stylesheet fetched for it; stepping the color, space, and type rows each to a
// profile past its default, which the full entry registers, sets that facet's attribute on the
// root; the page's one module script, its entry, is render-blocking; every request the page makes
// resolves under the base, and none fails; in a 1600px viewport the site's layout holds main to a
// reading width, centered; and a choice the menu never saves leaves nothing stored, so a reload
// shows none of it. shell lists them by name, for a site to make a test of each.
//
// The crawl runs on a Markdown site: from the index, every link into the site is followed,
// breadth first, and each page reached loads with a 2xx, its one module script render-blocking,
// every request under the base and none failed, its main held to a reading width, centered, in a
// 1600px viewport, and its title its source's front matter name, or, for a source with no name,
// its first h1's text. A page whose source has front matter opens its main with the front
// matter's table, one row per key in source order, each key and value as the source holds it,
// and shows no key's line as body text; a page whose source has none shows no table. Every
// in-site link reaches a built page, and an element with its fragment's id when it has one. The
// crawl checks a page for every file content.json records, and no other: a page no link from the
// index reaches is crawled from once the links run out, and returned, for the test's diagnostics.
// Adapted from spike-html-hosting (0a98c8e): test/browser/site.test.ts, its one page a crawl of
// the site's pages.
// Adapted from spike-html-hosting (16c97c6): test/browser/site.test.ts, its checks functions over
// a page, and the stored choice checked unsaved.
// Adapted from spike-html-hosting-architecture (a20a1e0): test/browser/site.test.ts, its crawl a
// function over a page, its sources read from the site's root.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { until } from "@jaimestill/spike-html-apps-tooling/browser.js";
import { parse } from "yaml";
import { pageUrl } from "./markdown-pages.js";
/** Clicks the element the selector names at its center, as a person's mouse does. */
async function click(page, selector) {
    const { x, y } = await page.evaluate(`(() => {
    const rect = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  })()`);
    for (const type of ["mousePressed", "mouseReleased"]) {
        await page.cdp("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
    }
}
/** Presses a key as a US keyboard types it: keyDown, with its text for a letter, then keyUp. */
async function press(page, key) {
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
/** Records the page's network log from its next request; take reads the log and starts a new
 * one. */
async function record(page) {
    let log = { requests: [], responses: [], failures: [] };
    const urls = new Map();
    page.on("Network.requestWillBeSent", ({ requestId, request }) => {
        log.requests.push(request.url);
        urls.set(requestId, request.url);
    });
    page.on("Network.responseReceived", ({ response }) => log.responses.push({ url: response.url, status: response.status }));
    page.on("Network.loadingFailed", ({ requestId, errorText }) => log.failures.push({ url: urls.get(requestId) ?? requestId, errorText }));
    await page.cdp("Network.enable");
    return () => {
        const taken = log;
        log = { requests: [], responses: [], failures: [] };
        return taken;
    };
}
/** Asserts a page's log: the page itself loaded with a 2xx, no request failed or answered an
 * error, and every request resolved under the base, site. */
function assertLoaded(url, site, { requests, responses, failures }) {
    const status = responses.find((response) => response.url === url)?.status;
    assert.ok(status !== undefined && status >= 200 && status < 300, `${url} loaded with ${status}`);
    assert.deepEqual(failures, [], `${url}: no request failed`);
    assert.deepEqual(responses.filter(({ status }) => status >= 400), [], `${url}: no request answered an error`);
    assert.deepEqual(requests.filter((request) => !request.startsWith(site)), [], `${url}: every request resolves under the base`);
}
/** The page's module scripts, each by whether it blocks rendering: the build's entry alone,
 * render-blocking, is [true]. */
const BLOCKING = `[...document.querySelectorAll('script[type="module"]')]
  .map((script) => script.blocking.contains("render"))`;
/** Sets a viewport wider than any reading width, so main's cap shows. */
const wide = (page) => page.cdp("Emulation.setDeviceMetricsOverride", {
    width: 1600,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
});
/** Asserts the loaded page's main is held to a reading width, centered, well inside the
 * viewport. */
async function assertReadingWidth(page, url) {
    const { width, left, right, viewport } = await page.evaluate(`(() => {
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
export const opensThemeMenu = async (page, site) => {
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
    assert.ok(requests.some((url) => /\/assets\/theme-menu-[\w-]+\.js$/.test(url)), "the menu's chunk loaded");
    assert.deepEqual(requests.filter((url) => /theme-menu[\w-]*\.css$/.test(url)), [], "no stylesheet is fetched for the menu");
    await press(page, "Escape");
    await until(page, `!document.querySelector("sl-theme-menu dialog")`);
    // The Theme button's data-keys="t", which keys.js binds.
    await press(page, "t");
    await until(page, MODAL);
};
/** Stepping each facet's row, color, space, and type, to the profile after its default sets the
 * facet's attribute on the root; every row offers more than its default, as the full entry
 * registers every built-in profile. */
export const stepsEachFacet = async (page, site) => {
    await page.goto(site);
    await press(page, "t");
    await until(page, MODAL);
    // Each facet's row, by its section, and the root attribute preferences.js sets for it.
    const facets = [
        ["color", "data-palette"],
        ["space", "data-space"],
        ["type", "data-type"],
    ];
    const rows = await page.evaluate(`
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
        if (index > 0)
            await press(page, "j");
        if (facet === "space")
            await press(page, "j");
        await press(page, "l");
        const { values, checked } = rows[facet];
        const chosen = values[(values.indexOf(checked) + 1) % values.length];
        assert.equal(await page.evaluate(`document.documentElement.getAttribute("${attribute}")`), chosen, `choosing ${chosen} in the ${facet} row sets ${attribute}`);
    }
};
/** The page's one module script, the build's entry, is render-blocking. */
export const blocksRender = async (page, site) => {
    await page.goto(site);
    assert.deepEqual(await page.evaluate(BLOCKING), [true], `${site}: its entry blocks render`);
};
/** Every request the page makes, the menu's chunk on its first open included, resolves under the
 * base, and none fails or answers an error. */
export const requestsUnderBase = async (page, site) => {
    const take = await record(page);
    await page.goto(site);
    await click(page, "button[commandfor=theme]");
    await until(page, MODAL);
    assertLoaded(site, site, take());
};
/** In a 1600px viewport, main holds its reading width, centered. */
export const holdsReadingWidth = async (page, site) => {
    await wide(page);
    await page.goto(site);
    await assertReadingWidth(page, site);
};
/** A choice the menu never saves, stepped and then cancelled, stores nothing, and a reload shows
 * none of it: the site leaves the reader's choice to the menu's Save. */
export const staysUnsaved = async (page, site) => {
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
    assert.notEqual(await page.evaluate(`document.documentElement.getAttribute("data-palette")`), chosen, `the cancelled ${chosen} doesn't persist past a reload`);
};
/** The shell checks, by the name a site's test gives each. */
export const shell = {
    "the Theme button and T open the theme menu, its sheet adopted": opensThemeMenu,
    "stepping each facet sets its attribute on the root": stepsEachFacet,
    "the page's one module script is render-blocking": blocksRender,
    "every request resolves under the base, and none fails": requestsUnderBase,
    "main holds its centered reading width at 1600px": holdsReadingWidth,
    "the theme menu stays unsaved: no stored choice persists": staysUnsaved,
};
/** A front matter value's text, as its cell's textContent: a sequence's or a mapping's nested
 * table its items', or its keys' and values', text run together, and null nothing. */
const text = (value) => {
    if (value === null || value === undefined)
        return "";
    if (Array.isArray(value))
        return value.map(text).join("");
    if (typeof value === "object") {
        return Object.entries(value)
            .map(([key, item]) => key + text(item))
            .join("");
    }
    return String(value);
};
/** Each copied file's page of the site at root, by its path under the base (x.md at x.html,
 * dir/README.md at dir/, the root's README.md at the base itself), to its source's front matter,
 * null when it has none, read with yaml as the build reads it. */
function sources(root) {
    const content = JSON.parse(readFileSync(join(root, "content.json"), "utf8"));
    return new Map(Object.keys(content.files)
        .filter((path) => path.endsWith(".md"))
        .map((path) => {
        const page = pageUrl("README.md", path).replace(/^\.\/$/, "");
        const source = readFileSync(join(root, "content", path), "utf8");
        const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
        const data = match ? (parse(match[1]) ?? {}) : null;
        return [page, data];
    }));
}
/** Crawls every page of the Markdown site at root, whose URL under the base is site, from its
 * index, checking each as this module's header lists; resolves to what it reached. */
export async function crawl(page, site, root) {
    const pages = sources(root);
    /** Each page reached, by its URL, to the ids its elements carry. */
    const reached = new Map();
    /** Each in-site link: the page it's on, and its href, resolved. */
    const links = [];
    /** The copied files' pages no link from the index reaches: once the links run out, the crawl
     * starts again from the first page not reached, so each is checked as a linked one is. */
    const unreachable = [];
    const next = () => {
        const url = [...pages.keys()].map((path) => `${site}${path}`).find((u) => !reached.has(u));
        if (url !== undefined)
            unreachable.push(url.slice(site.length));
        return url;
    };
    const queue = [site];
    const take = await record(page);
    await wide(page);
    for (let url = queue.shift() ?? next(); url !== undefined; url = queue.shift() ?? next()) {
        if (reached.has(url))
            continue;
        take();
        await page.goto(url);
        assertLoaded(url, site, take());
        assert.deepEqual(await page.evaluate(BLOCKING), [true], `${url}: its entry blocks render`);
        const path = url.slice(site.length);
        assert.ok(pages.has(path), `${url} is a copied file's page`);
        const data = pages.get(path) ?? null;
        const shown = await page.evaluate(`(() => {
      const table = document.querySelector("main > table.front-matter:first-child");
      return {
        title: document.title,
        h1: document.querySelector("main h1")?.textContent.trim() ?? null,
        tables: document.querySelectorAll("table.front-matter").length,
        rows: table && [...table.tBodies[0].rows].map((row) =>
          [...row.cells].map((cell) => cell.textContent)),
        body: [...document.querySelectorAll("main p, main :is(h1, h2, h3, h4, h5, h6)")]
          .filter((element) => !element.closest("table.front-matter"))
          .map((element) => element.textContent),
      };
    })()`);
        await assertReadingWidth(page, url);
        const name = data?.name;
        assert.equal(shown.title, typeof name === "string" ? name : shown.h1, `${url}'s title`);
        assert.ok(shown.title, `${url} has a title`);
        if (data === null || Object.keys(data).length === 0) {
            assert.equal(shown.tables, 0, `${url}: no front matter, no table`);
        }
        else {
            assert.equal(shown.tables, 1, `${url}: one front matter table`);
            assert.deepEqual(shown.rows, Object.entries(data).map(([key, value]) => [key, text(value)]), `${url}: its main opens with its front matter's table, a row per key in order`);
            for (const [key, value] of Object.entries(data)) {
                const line = `${key}: ${text(value)}`;
                assert.deepEqual(shown.body.filter((body) => body.includes(line)), [], `${url}: ${line} isn't body text`);
            }
        }
        const { ids, hrefs } = await page.evaluate(`({
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
    assert.deepEqual([...reached.keys()].map((url) => url.slice(site.length)).sort(), [...pages.keys()].sort(), "the crawl checked every copied file's page, and no other");
    return { pages: reached.size, links: links.length, unreachable };
}
