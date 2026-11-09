// A site's captures: the description its capture file exports for the tooling's
// spike-html-apps-screenshots bin, and the run of that bin its browser tier makes once.
//
// description takes the site's root and its page list, each page its built path under dist/, and
// describes each page captured whole, in tiles, at 390px, 1120px, and 1376px, a phone's width and
// the layout's two docks, and the index also with Help open, opened by the Help button's click and
// ready once its sl-shortcuts has rendered its rows, and with Settings open, opened by the Settings
// button's click and ready once its sl-settings has rendered its rows, each at the three widths. A
// page's name is its built path without .html, a directory's index its directory: index.html is
// --page index, a/index.html --page a, and a/b.html --page a/b; a state's name, which names its
// files, holds its width and turns the name's slashes to dashes. A page's path is its absolute URL
// path under the base, /<repository>/ for the index, /<repository>/a/ and /<repository>/a/b.html
// for the others, which is its caption too, and which the bin's messages name. The profile's
// facets, palette, space, and type, at flexoki, regular, and mono; --all's profiles, every palette
// at the defaults, then compact and sans at flexoki; the profiles each page registers, from the
// foundation's registry, every built-in one, as the shell loads the full entry. The site is served
// as its browser tier serves it, by served(), so a capture makes the requests the deployed site
// makes. contentPages lists a Markdown site's copied pages, every tree's, from its content.json; a
// site with hand pages lists those beside them.
//
// capture runs the bin on a capture file as mise run screenshots does: the index alone, light
// alone, to the terminal, with TMPDIR a scratch directory of its own and node's compile cache,
// which writes there too, off; it returns what the run printed and left there, and removes the
// scratch directory. leavesNoCapture asserts the run exits 0, prints the index's nine states'
// captures under that TMPDIR, and leaves it empty; keepsCaptures that with --keep it leaves every
// capture it printed, so the first run's empty TMPDIR is the output's cleanup, not a capture that
// never wrote.
// Adapted from spike-html-apps-foundation (d5037b4): scripts/screenshots.config.ts, its theme
// menu's open step, now Settings', viewports, facets, --all, and registry read.
// Adapted from spike-html-apps-components (19d4f59): scripts/screenshots.config.ts, its pages
// mapped from a list and its server the browser tier's.
// Adapted from spike-html-hosting-architecture (a09e7db): scripts/screenshots.config.ts, its
// description a function of the site's root and page list, each page's path its absolute URL path.
// Adapted from spike-html-hosting (be1422c): scripts/screenshots.config.ts, its one index a list of
// one.
// Adapted from spike-html-hosting-architecture (a09e7db): test/browser/screenshots.test.ts, its run
// a function of the site's root and capture file, and its assertions functions.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { until } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type {
  DescribedPage,
  DescribedState,
  Description,
  Step,
  Viewport,
} from "@jaimestill/spike-html-apps-tooling/screenshots.js";

import { copiedFiles } from "./content.ts";
import { pageFile } from "./markdown-pages.ts";
import { base, command, served } from "./served.ts";

// The widths each page is captured at: a phone's, below the settings' 48rem breakpoint; 70rem,
// where the section tree docks; and 86rem, where the site index docks too, the three-column
// layout (markdown-pages.ts's docks, at the 16px rem). browser.ts's target size check measures at
// each.
export const WIDTHS: Viewport[] = [
  { width: 390, height: 844 },
  { width: 1120, height: 700 },
  { width: 1376, height: 860 },
];

/** Opens Help: the Help button's command="show-modal", ready once the dialog's sl-shortcuts has
 * rendered a row of the page's bindings. */
const openHelp: Step = async (page) => {
  await page.evaluate(`document.querySelector("body > header button[commandfor=help]").click()`);
  await until(page, `document.querySelector("dialog#help")?.open`);
  await until(
    page,
    `!!document.querySelector("dialog#help sl-shortcuts")?.shadowRoot?.querySelector("tbody tr")`,
  );
};

/** Opens Settings: the Settings button's command="show-modal", ready once the dialog's sl-settings
 * has rendered its theme rows. */
const openSettings: Step = async (page) => {
  await page.evaluate(
    `document.querySelector("body > header button[commandfor=settings]").click()`,
  );
  await until(page, `document.querySelector("dialog#settings")?.open`);
  await until(
    page,
    `!!document.querySelector("dialog#settings sl-settings")?.shadowRoot?.querySelector(".theme-menu-row")`,
  );
};

/** A page's states: the whole page at each width, and, for the index, Help open and Settings open
 * at each, nine. A state's name, which names its files, holds the width and no
 * directory, so a page name's slashes are dashes there. */
function states(name: string, caption: string, index: boolean): DescribedState[] {
  const file = name.replaceAll("/", "-");
  const whole = WIDTHS.map((viewport): DescribedState => ({
    name: `${file}-${viewport.width}`,
    caption: `${caption}, ${viewport.width}px`,
    viewport,
    full: true,
  }));
  if (!index) return whole;
  const opened = (state: string, label: string, open: Step): DescribedState[] =>
    WIDTHS.map((viewport) => ({
      name: `${file}-${state}-${viewport.width}`,
      caption: `${caption}, ${label} open, ${viewport.width}px`,
      viewport,
      full: false,
      open,
    }));
  return [
    ...whole,
    ...opened("help", "Help", openHelp),
    ...opened("settings", "Settings", openSettings),
  ];
}

/** The page built at the path under dist/, as the bin captures it under base: its name the path
 * without .html, a directory's index its directory, and its path and caption its URL path. */
function described(built: string, base: string): DescribedPage {
  if (!built.endsWith(".html")) throw new Error(`screenshots: ${built} isn't a built page`);
  const index = built === "index.html" || built.endsWith("/index.html");
  const name =
    built === "index.html" ? "index" : built.replace(/\/index\.html$/, "").replace(/\.html$/, "");
  const path = `${base}${index ? built.replace(/index\.html$/, "") : built}`;
  return { name, caption: path, path, states: states(name, path, name === "index") };
}

/** The copied pages of the Markdown site at root, each its built path, every tree's, each under
 * its tree's directory, sorted by its copied file's path: content.json records them. A site with
 * hand pages lists them beside these. */
export function contentPages(root: string): string[] {
  return copiedFiles(root)
    .filter((file) => file.endsWith(".md"))
    .map(pageFile);
}

/** The page's registered names, by flag, read from the foundation's store at its well-known
 * global key; its color facet is palette's. */
const REGISTRY = `(() => {
  const store = globalThis[Symbol.for("spike-html-apps-foundation.registry")] ?? {};
  return { palette: store.color ?? [], space: store.space ?? [], type: store.type ?? [] };
})()`;

/** The capture description of the site at root, its pages each a built path under dist/, as
 * index.html and a/b.html, in the order they're captured. */
export function description({ root, pages }: { root: string; pages: string[] }): Description {
  const under = base(root);
  return {
    pages: pages.map((built) => described(built, under)),
    facets: [
      { flag: "palette", attribute: "data-palette", default: "flexoki" },
      { flag: "space", attribute: "data-space", default: "regular" },
      { flag: "type", attribute: "data-type", default: "mono" },
    ],
    // Every color at the defaults, then the other space and the other type at the default color.
    all: [
      ...["flexoki", "primer", "catppuccin", "everforest"].map((palette) => ({ palette })),
      { space: "compact" },
      { type: "sans" },
    ],
    profiles: (page) => page.evaluate(REGISTRY),
    server: () => served(root),
  };
}

/** A capture run: its exit status, its stderr, the capture files it printed, and its TMPDIR's
 * files after, each relative to that TMPDIR. */
export interface Captured {
  status: number | null;
  stderr: string;
  printed: string[];
  left: string[];
}

/** Runs the bin, installed at or above root, on the capture file config: the index, light, to the
 * terminal, the flags after, with TMPDIR a fresh scratch directory and node's compile cache off;
 * removes the directory once it has read what the run left there. */
export function capture(root: string, config: string, ...flags: string[]): Captured {
  const dir = mkdtempSync(join(tmpdir(), "screenshots."));
  try {
    const args = [config, "--page", "index", "--scheme", "light", "--output", "terminal"];
    const { status, stdout, stderr } = spawnSync(
      command(root, "spike-html-apps-screenshots"),
      [...args, ...flags],
      {
        cwd: root,
        env: { ...process.env, TMPDIR: dir, NODE_DISABLE_COMPILE_CACHE: "1" },
        encoding: "utf8",
      },
    );
    const printed = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.endsWith(".png"));
    for (const path of printed) assert.ok(path.startsWith(`${dir}/`), `${path} is under ${dir}`);
    return {
      status,
      stderr,
      printed: printed.map((path) => path.slice(dir.length + 1)),
      left: readdirSync(dir, { recursive: true, encoding: "utf8" }),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Asserts the capture run of the site at root on config captures the index's nine states under
 * its TMPDIR and leaves nothing there. */
export function leavesNoCapture(root: string, config: string): void {
  const { status, stderr, printed, left } = capture(root, config);
  assert.equal(status, 0, stderr);
  // The index's nine states: whole, Help open, and Settings open, at each width.
  const states = ["", "help-", "settings-"].flatMap((open) =>
    WIDTHS.map(({ width }) => `${open}${width}`),
  );
  for (const state of states) {
    assert.ok(
      printed.some((path) => path.includes(`-index-${state}--`)),
      `a capture of index-${state} among ${printed}`,
    );
  }
  assert.deepEqual(left, [], "TMPDIR is left empty");
}

/** Asserts the capture run of the site at root on config, with --keep, leaves every capture file
 * it printed. */
export function keepsCaptures(root: string, config: string): void {
  const { status, stderr, printed, left } = capture(root, config, "--keep");
  assert.equal(status, 0, stderr);
  assert.ok(printed.length > 0, "it printed its captures");
  for (const path of printed) assert.ok(left.includes(path), `${path} is kept`);
}
