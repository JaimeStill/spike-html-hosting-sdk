// The capture description at its seam, with no browser: description's pages, each named by its
// built path without .html, a directory's index by its directory, at its absolute URL path under
// the base, which is its caption; each page's states at 390px, 1120px, and 1376px, the index's
// Help and theme-menu states among them, named with the page name's slashes as dashes.
// contentPages lists the fixture site's pages from its content.json, in the build's order. The
// browser tier holds the facets and --all to the profiles the fixture site's index registers.

import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, test } from "node:test";

import { contentPages, description } from "../../src/screenshots.ts";

const root = join(import.meta.dirname, "../fixtures/site");

describe("description", () => {
  const described = description({
    root,
    pages: ["index.html", "a.html", "dir/index.html", "dir/b.html"],
  });

  test("names each page by its built path, at its URL path under the base", () => {
    assert.deepEqual(
      described.pages.map(({ name, path, caption }) => ({ name, path, caption })),
      [
        { name: "index", path: "/fixture-site/", caption: "/fixture-site/" },
        { name: "a", path: "/fixture-site/a.html", caption: "/fixture-site/a.html" },
        { name: "dir", path: "/fixture-site/dir/", caption: "/fixture-site/dir/" },
        { name: "dir/b", path: "/fixture-site/dir/b.html", caption: "/fixture-site/dir/b.html" },
      ],
    );
  });

  test("captures every page at 390, 1120, and 1376, and the index's Help and theme menu open", () => {
    const states = Object.fromEntries(
      described.pages.map(({ name, states }) => [name, states?.map((state) => state.name)]),
    );
    assert.deepEqual(states, {
      index: [
        "index-390",
        "index-1120",
        "index-1376",
        "index-help-390",
        "index-help-1120",
        "index-help-1376",
        "index-theme-menu-390",
        "index-theme-menu-1120",
        "index-theme-menu-1376",
      ],
      a: ["a-390", "a-1120", "a-1376"],
      dir: ["dir-390", "dir-1120", "dir-1376"],
      "dir/b": ["dir-b-390", "dir-b-1120", "dir-b-1376"],
    });
    const index = described.pages[0].states ?? [];
    assert.deepEqual(
      index.map(({ caption, viewport, full, open }) => [
        caption,
        `${viewport?.width}x${viewport?.height}`,
        full,
        typeof open,
      ]),
      [
        ["/fixture-site/, 390px", "390x844", true, "undefined"],
        ["/fixture-site/, 1120px", "1120x700", true, "undefined"],
        ["/fixture-site/, 1376px", "1376x860", true, "undefined"],
        ["/fixture-site/, Help open, 390px", "390x844", false, "function"],
        ["/fixture-site/, Help open, 1120px", "1120x700", false, "function"],
        ["/fixture-site/, Help open, 1376px", "1376x860", false, "function"],
        ["/fixture-site/, the theme menu open, 390px", "390x844", false, "function"],
        ["/fixture-site/, the theme menu open, 1120px", "1120x700", false, "function"],
        ["/fixture-site/, the theme menu open, 1376px", "1376x860", false, "function"],
      ],
    );
  });

  test("refuses a page that isn't a built .html path", () => {
    assert.throws(() => description({ root, pages: ["a.md"] }), /a\.md isn't a built page/);
  });
});

describe("contentPages", () => {
  test("lists content.json's Markdown files as their built pages, sorted", () => {
    assert.deepEqual(contentPages(root), [
      "index.html",
      "a.html",
      "guide/index.html",
      "orphan.html",
    ]);
  });
});
