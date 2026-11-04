// The capture description at its seam, with no browser: description's pages, each named by its
// built path without .html, a directory's index by its directory, at its absolute URL path under
// the base, which is its caption; each page's states, the index's theme-menu states among them,
// named with the page name's slashes as dashes; the facets and --all; and its server a start
// function. contentPages lists the fixture site's pages from its content.json, in the build's
// order.

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

  test("captures every page wide and narrow, and the index's theme menu open", () => {
    const states = Object.fromEntries(
      described.pages.map(({ name, states }) => [name, states?.map((state) => state.name)]),
    );
    assert.deepEqual(states, {
      index: ["index-wide", "index-narrow", "index-theme-menu-wide", "index-theme-menu-narrow"],
      a: ["a-wide", "a-narrow"],
      dir: ["dir-wide", "dir-narrow"],
      "dir/b": ["dir-b-wide", "dir-b-narrow"],
    });
    const index = described.pages[0].states ?? [];
    assert.deepEqual(
      index.map(({ caption, full, open }) => [caption, full, typeof open]),
      [
        ["/fixture-site/, wide", true, "undefined"],
        ["/fixture-site/, narrow", true, "undefined"],
        ["/fixture-site/, the theme menu open, wide", false, "function"],
        ["/fixture-site/, the theme menu open, narrow", false, "function"],
      ],
    );
  });

  test("gives the foundation's facets, --all's profiles, and a start function", () => {
    assert.deepEqual(
      described.facets?.map(({ flag }) => flag),
      ["palette", "space", "type"],
    );
    assert.deepEqual(described.all, [
      { palette: "flexoki" },
      { palette: "primer" },
      { palette: "catppuccin" },
      { palette: "everforest" },
      { space: "compact" },
      { type: "sans" },
    ]);
    assert.equal(typeof described.server, "function");
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
