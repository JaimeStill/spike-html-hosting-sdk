// The render-blocking entry, src/render-blocking.ts's renderBlocking, its transform run on built
// pages as Vite writes them: the one entry tag gains blocking="render", and a page with none, or
// with more than one, fails the build, naming the page. Each site's browser tier loads its built
// pages themselves.

import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { IndexHtmlTransformContext } from "vite";

import { renderBlocking } from "../../src/render-blocking.ts";

/** The plugin's transform on page, built at path, as Vite runs it after its own. */
function transform(page: string, path = "/index.html"): unknown {
  const hook = renderBlocking().transformIndexHtml;
  assert.ok(hook && typeof hook === "object", "transformIndexHtml isn't an ordered hook");
  assert.equal(hook.order, "post");
  const context = { path, filename: path } as IndexHtmlTransformContext;
  return hook.handler.call({} as never, page, context);
}

const entry = '<script type="module" crossorigin src="/assets/index-abc.js"></script>';

describe("the render-blocking entry", () => {
  test("is a build-only plugin", () => {
    assert.equal(renderBlocking().apply, "build");
  });

  test("marks the page's one entry script render-blocking", () => {
    assert.equal(
      transform(`<head>${entry}</head>`),
      '<head><script type="module" blocking="render" crossorigin src="/assets/index-abc.js">' +
        "</script></head>",
    );
  });

  test("fails on a page with no entry tag, or more than one, naming it", () => {
    assert.throws(() => transform("<head></head>", "/a.html"), /in \/a\.html, found 0$/);
    assert.throws(() => transform(entry + entry, "/b.html"), /in \/b\.html, found 2$/);
  });
});
