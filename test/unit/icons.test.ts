// The icon fill, src/icons.ts's fillIcons, with the icons layer as the SDK's own install resolves
// it: each glyph marker, an empty <svg data-icon="<set>/<name>"></svg>, is replaced by its icon's
// svg, the module's string whole, a class on the marker carried onto it; a page with no marker, or
// with an svg that isn't one, is unchanged; and a name the icons layer doesn't resolve, or one
// that isn't <set>/<name>, fails, naming the page and the icon. Through markdownPages, in a scratch
// site root in TMPDIR whose node_modules links the icons layer, the fill runs on a hand page as on
// a rendered one, adding no script, and resolves the icons from the site's root, failing in a site
// that doesn't install them. That a build fills both kinds of page is the trees fixture's to show,
// in the browser tier.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, test } from "node:test";

import question from "@jaimestill/spike-html-hosting-icons/octicon/question-16";
import x from "@jaimestill/spike-html-hosting-icons/octicon/x-16";
import type { IndexHtmlTransformContext, UserConfig } from "vite";

import { fillIcons, siteIcons } from "../../src/icons.ts";
import { markdownPages } from "../../src/markdown-pages.ts";

const root = join(import.meta.dirname, "../..");
const icons = siteIcons(root);

const scratches: string[] = [];
after(() => {
  for (const scratch of scratches) rmSync(scratch, { recursive: true, force: true });
});

describe("the icon fill", () => {
  test("replaces each marker with its icon's svg", async () => {
    const page =
      '<button aria-label="Help"><svg data-icon="octicon/question-16"></svg>' +
      '<kbd>?</kbd></button><button aria-label="Close"><svg data-icon="octicon/x-16"> </svg>' +
      '</button><button><svg data-icon="octicon/x-16"></svg></button>';
    assert.equal(
      await fillIcons(page, "/index.html", icons),
      `<button aria-label="Help">${question}<kbd>?</kbd></button>` +
        `<button aria-label="Close">${x}</button><button>${x}</button>`,
    );
    assert.match(question, /^<svg [^>]* aria-hidden="true" focusable="false">/);
  });

  test("carries a marker's class onto the svg, and drops its other attributes", async () => {
    assert.equal(
      await fillIcons(
        '<svg class="glyph wide" data-icon="octicon/x-16" role="img"></svg>',
        "/index.html",
        icons,
      ),
      x.replace(/^<svg/, '<svg class="glyph wide"'),
    );
  });

  test("leaves a page with no marker, and an svg that isn't one, unchanged", async () => {
    const page =
      '<main><svg viewBox="0 0 1 1"></svg><svg><path d="M0 0"/></svg>' + "<p>data-icon</p></main>";
    assert.equal(await fillIcons(page, "/a.html", icons), page);
  });

  test("fails on a name the icons layer doesn't resolve, naming the page and the icon", async () => {
    await assert.rejects(
      fillIcons('<svg data-icon="octicon/no-such-icon-16"></svg>', "/dir/a.html", icons),
      /^Error: icons: \/dir\/a\.html names the icon octicon\/no-such-icon-16, which the site's @jaimestill\/spike-html-hosting-icons doesn't resolve$/,
    );
    await assert.rejects(
      fillIcons('<svg data-icon="no-such-set/x-16"></svg>', "/b.html", icons),
      /icons: \/b\.html names the icon no-such-set\/x-16/,
    );
  });

  test("fails on a name that isn't <set>/<name>, naming the page and the icon", async () => {
    for (const icon of ["x-16", "octicon/../x-16", "octicon/X-16", ""]) {
      await assert.rejects(
        fillIcons(`<svg data-icon="${icon}"></svg>`, "/a.html", icons),
        new RegExp(`icons: /a\\.html names the icon "${icon.replace(/\./g, "\\.")}", which isn't`),
      );
    }
  });
});

/** A scratch site root in TMPDIR holding files, its node_modules linking the icons layer from the
 * SDK's own install when linked. */
function scratch(files: Record<string, string>, linked: boolean): string {
  const site = mkdtempSync(join(tmpdir(), "icons-"));
  scratches.push(site);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(site, path)), { recursive: true });
    writeFileSync(join(site, path), text);
  }
  if (linked) {
    const link = join(site, "node_modules/@jaimestill/spike-html-hosting-icons");
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(join(root, "node_modules/@jaimestill/spike-html-hosting-icons"), link);
  }
  return site;
}

/** The plugin, configured in the site at site, and its page transform, as Vite runs it on the page
 * built from path under it. */
function transform(site: string): (page: string, path: string) => Promise<unknown> {
  const plugin = markdownPages({
    dir: "content",
    repository: "https://github.com/owner/repo",
    ref: "0123456789abcdef0123456789abcdef01234567",
  });
  (plugin.config as unknown as (config: UserConfig) => UserConfig).call({}, { root: site });
  const hook = plugin.transformIndexHtml;
  assert.ok(hook && typeof hook === "object", "transformIndexHtml isn't an ordered hook");
  return async (page, path) =>
    hook.handler.call({} as never, page, {
      path,
      filename: join(site, path),
    } as IndexHtmlTransformContext);
}

describe("the icon fill in the Markdown pages", () => {
  const files = { "content/README.md": "# T\n", "index.html": "<title></title><main></main>" };
  const page =
    '<html><head><script type="module" src="/a.js"></script></head><body><header>' +
    '<svg data-icon="octicon/question-16"></svg></header><main></main></body></html>';

  test("fills a hand page's markers from the site's icons, adding no script", async () => {
    const filled = await transform(scratch(files, true))(page, "/briefs/hand.html");
    assert.equal(filled, page.replace('<svg data-icon="octicon/question-16"></svg>', question));
    assert.equal(String(filled).match(/<script/g)?.length, 1);
  });

  test("fills a rendered page's markers", async () => {
    const filled = await transform(scratch(files, true))(page, "/index.html");
    assert.equal(filled, page.replace('<svg data-icon="octicon/question-16"></svg>', question));
  });

  test("fails a page in a site that doesn't install the icons layer, naming it and the icon", async () => {
    await assert.rejects(
      transform(scratch(files, false))(page, "/briefs/hand.html"),
      /icons: \/briefs\/hand\.html names the icon octicon\/question-16/,
    );
  });
});
