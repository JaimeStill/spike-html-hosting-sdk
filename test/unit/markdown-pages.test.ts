// The Markdown pages' rendering, on small files: each copied file's page path, the links it
// rewrites (to a copied file's page, relative to the linking page, its fragment kept; to an
// external file's blob at the pinned commit), the links it passes through, and the build failing
// on a relative link it can't place. The front matter is parsed, never rendered as body text,
// and shown in the page header as a dl of its keys and values in source order, escaped; a file
// with none shows an empty header and takes its title from its first h1, and one with neither a
// name nor an h1 fails the build. Headings carry GitHub's ids, counted per page, and the section
// tree lists the h2s and their h3s by those ids. The site index nests every page by directory,
// each directory labeled by its index page or its name, and marks none current. Each body table
// is in a named region a keyboard focuses. Each site's browser tier crawls its built pages
// themselves.
// Adapted from spike-html-hosting-architecture (de46c65): test/unit/markdown-pages.test.ts, on
// src/markdown-pages.ts.

import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  pageFile,
  pageHeader,
  pageUrl,
  render,
  sectionTree,
  siteIndex,
} from "../../src/markdown-pages.ts";
import type { Source } from "../../src/markdown-pages.ts";

const source: Source = {
  pages: new Set(["README.md", "a.md", "dir/README.md", "dir/b.md"]),
  external: new Set(["LICENSE"]),
  repository: "https://github.com/owner/repo",
  ref: "0123456789abcdef0123456789abcdef01234567",
};

/** The href of each link the body renders, in order. */
const hrefs = (html: string): string[] => [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);

/** A copied file of front matter and the body. */
const file = (body: string): string => `---\nkey: k\nname: The name\n---\n\n${body}`;

describe("the Markdown pages", () => {
  test("build each file to its page, a README to its directory's index", () => {
    assert.deepEqual(["README.md", "a.md", "dir/README.md", "dir/b.md"].map(pageFile), [
      "index.html",
      "a.html",
      "dir/index.html",
      "dir/b.html",
    ]);
    assert.equal(pageUrl("dir/b.md", "README.md"), "../");
    assert.equal(pageUrl("README.md", "dir/README.md"), "dir/");
    assert.equal(pageUrl("dir/README.md", "dir/README.md"), "./");
    assert.equal(pageUrl("a.md", "dir/b.md"), "dir/b.html");
  });

  test("rewrite each relative link to a copied or external file, the rest passed through", () => {
    const { html } = render(
      "dir/b.md",
      file(
        "[a](../a.md) [b](b.md#x) [i](README.md) [r](../README.md#y) [l](../LICENSE#z) " +
          "[f](#f) [w](https://example.com/c.md) [m](mailto:x@example.com)",
      ),
      source,
    );
    assert.deepEqual(hrefs(html), [
      "../a.html",
      "b.html#x",
      "./",
      "../#y",
      `${source.repository}/blob/${source.ref}/LICENSE#z`,
      "#f",
      "https://example.com/c.md",
      "mailto:x@example.com",
    ]);
  });

  test("fail on a relative link to a file neither copied nor external", () => {
    for (const href of ["c.md", "../dir/c.md#x", "../../a.md", "/a.md", "NOTICE", "a.md?x"]) {
      assert.throws(
        () => render("dir/b.md", file(`[x](${href})`), source),
        /dir\/b\.md links .*neither a copied file nor a listed external one/,
        href,
      );
    }
  });

  test("parse the front matter, titling the page with its name, never rendering it as body", () => {
    const { data, title, html } = render("a.md", file("# A heading\n\nBody."), source);
    assert.deepEqual(data, { key: "k", name: "The name" });
    assert.equal(title, "The name");
    assert.equal(html, '<h1 id="a-heading">A heading</h1>\n<p>Body.</p>\n');
    assert.throws(() => render("a.md", "---\n- k\n---\n", source), /a\.md's front matter isn't/);
    assert.throws(() => render("a.md", "---\nname: 1\n---\n", source), /a\.md's front matter name/);
  });

  test("show the front matter in the page header, its keys and values in order, escaped", () => {
    const { data } = render(
      "a.md",
      "---\nz: last <b>\nname: A & B\ncount: 2\nempty:\nlist: [x, <y>]\nmap: { k: v, n: [1, 2] }\n---\n",
      source,
    );
    assert.equal(
      pageHeader(data),
      "<sl-page-header><dl>" +
        "<dt>z</dt><dd>last &lt;b&gt;</dd>" +
        "<dt>name</dt><dd>A &amp; B</dd>" +
        "<dt>count</dt><dd>2</dd>" +
        "<dt>empty</dt><dd></dd>" +
        "<dt>list</dt><dd>x, &lt;y&gt;</dd>" +
        "<dt>map</dt><dd>k: v, n: 1, 2</dd>" +
        "</dl></sl-page-header>\n",
    );
    assert.equal(
      pageHeader(render("a.md", "---\n---\n# T\n", source).data),
      "<sl-page-header></sl-page-header>\n",
    );
  });

  test("title a file with no front matter by its first h1, with an empty header", () => {
    const { data, title, html } = render(
      "a.md",
      "Intro.\n\n## Not this\n\n# The *first* `h1` [link](a.md)\n\n# Second\n",
      source,
    );
    assert.equal(data, null);
    assert.equal(pageHeader(data), "<sl-page-header></sl-page-header>\n");
    assert.equal(title, "The first h1 link");
    assert.ok(html.startsWith("<p>Intro.</p>"), html);
    // Front matter without a name falls back to the h1 too.
    assert.equal(render("a.md", "---\nkey: k\n---\n# Heading\n", source).title, "Heading");
  });

  test("fail on a file with neither a front matter name nor an h1", () => {
    for (const text of ["## Only an h2\n\nBody.\n", "---\nkey: k\n---\nBody.\n", ""]) {
      assert.throws(
        () => render("dir/b.md", text, source),
        /dir\/b\.md has neither a front matter name nor an h1/,
        JSON.stringify(text),
      );
    }
  });

  test("give headings GitHub's ids, counted from none on each page", () => {
    const body = file("# A CLI domain's commands\n\n## Same\n\n## Same\n");
    const ids = (html: string) => [...html.matchAll(/id="([^"]*)"/g)].map((m) => m[1]);
    const want = ["a-cli-domains-commands", "same", "same-1"];
    assert.deepEqual(ids(render("a.md", body, source).html), want);
    assert.deepEqual(ids(render("a.md", body, source).html), want);
  });

  test("list the h2s in the section tree, their h3s nested, by the ids the headings carry", () => {
    const { html, headings } = render(
      "a.md",
      file(
        "# Title\n\n### Before\n\n## Café & *crème*\n\n### A `b`\n\n#### Deep\n\n### C\n\n" +
          "## Same\n\n## Same\n",
      ),
      source,
    );
    const tree = sectionTree(headings);
    assert.equal(
      tree,
      "<sl-section-tree><ul>" +
        '<li><a href="#before">Before</a></li>' +
        '<li><a href="#caf%C3%A9--cr%C3%A8me">Café &amp; crème</a>' +
        '<ul><li><a href="#a-b">A b</a></li><li><a href="#c">C</a></li></ul></li>' +
        '<li><a href="#same">Same</a></li>' +
        '<li><a href="#same-1">Same</a></li>' +
        "</ul></sl-section-tree>",
    );
    // Every href names an id a heading of the page carries.
    const ids = new Set([...html.matchAll(/<h[23] id="([^"]*)"/g)].map((m) => m[1]));
    for (const href of hrefs(tree)) {
      assert.ok(ids.has(decodeURIComponent(href.slice(1))), `${href} names a heading's id`);
    }
    assert.equal(sectionTree(render("a.md", file("# Only a title\n"), source).headings), "");
  });

  test("nest the site index by directory, each labeled by its index page or its name", () => {
    const titles = new Map([
      ["README.md", "The <site>"],
      ["z.md", "Zed"],
      ["a.md", "A & B"],
      ["dir/README.md", "The directory"],
      ["dir/b.md", "B"],
      ["dir/sub/c.md", "C"],
      ["bare/d.md", "D"],
    ]);
    const index = siteIndex(titles, "dir/b.md");
    assert.equal(
      index,
      "<sl-site-index><ul>" +
        '<li><a href="../">The &lt;site&gt;</a></li>' +
        '<li><a href="../a.html">A &amp; B</a></li>' +
        '<li><span>bare</span><ul><li><a href="../bare/d.html">D</a></li></ul></li>' +
        '<li><a href="./">The directory</a><ul>' +
        '<li><a href="b.html">B</a></li>' +
        '<li><span>sub</span><ul><li><a href="sub/c.html">C</a></li></ul></li>' +
        "</ul></li>" +
        '<li><a href="../z.html">Zed</a></li>' +
        "</ul></sl-site-index>",
    );
    // From the root's index, the same entries link relative to it.
    assert.deepEqual(hrefs(siteIndex(titles, "README.md")), [
      "./",
      "a.html",
      "bare/d.html",
      "dir/",
      "dir/b.html",
      "dir/sub/c.html",
      "z.html",
    ]);
  });

  test("wrap every body table in a region a keyboard focuses, named by its header", () => {
    const { html } = render(
      "a.md",
      file("| A & *b* | `c` |\n| --- | --- |\n| 1 | 2 |\n\nText.\n\n|  |  |\n|--|--|\n| x | y |\n"),
      source,
    );
    const regions = [...html.matchAll(/<div ([^>]*)>\n<table>/g)].map((m) => m[1]);
    assert.deepEqual(regions, [
      'class="table-region" role="region" aria-label="Table: A &amp; b, c" tabindex="0"',
      'class="table-region" role="region" aria-label="Table" tabindex="0"',
    ]);
    assert.equal(html.match(/<table>/g)?.length, 2);
    assert.equal(html.match(/<\/table>\n<\/div>/g)?.length, 2, "each region closes on its table");
  });
});
