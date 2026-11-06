// The render-blocking entry: Vite drops the entry script's blocking attribute as it rewrites the
// tag, so renderBlocking puts it back on each page's built entry. A site's page loads the
// foundation's registrations, its preferences module, which applies the reader's stored theme
// choice to the root element before first paint, and its keys module render-blocking; the build
// makes every module script of a page one entry, and this keeps that entry render-blocking, so it
// runs before first paint as they did.
//
// Vite writes a page's one entry tag only while its scripts' modules build into one chunk: when a
// page's own entry chunk does nothing but import, Vite writes a tag for each chunk it imports
// instead, and rolldown's automatic splitting can put a module every page shares, as it does
// Vite's preload helper once the components' section tree joins the foundation's modules, in a
// chunk of its own. So the plugin groups every module a page's entry loads statically, rolldown's
// $initial tag, into one chunk, index, which each page's tag loads; a module loaded only by a
// dynamic import, as the theme menu is, keeps a chunk of its own.
//
// One chunk holds every page's modules, so the build keeps rolldown's strict execution order: each
// module's body is wrapped, and runs only when a page's entry, a chunk of its own that calls the
// wrappers of what the page imports, loads it, with rolldown's small runtime chunk beside it. A
// site whose pages share one shell loads the same modules on each, but a site whose pages differ,
// a hand index or a hand page beside its rendered pages' shell, would otherwise run on every page
// each page's scripts, the shell's Pages drawer wiring among them on a page with no drawer.
// Each page keeps its one entry tag, render-blocking, which loads index and the runtime
// statically, so they block render as the tag does.
// Adapted from spike-html-apps (529ec52): vite.external.config.ts, its plugins.
// Adapted from spike-html-hosting-architecture (18eaa89): vite.config.ts, its renderBlocking
// plugin, exported.

import type { Plugin } from "vite";

/** The built page's entry script, as Vite writes its tag, and the same tag render-blocking. */
const entryTag = '<script type="module" crossorigin src=';
const blockingTag = '<script type="module" blocking="render" crossorigin src=';

/** Builds each page's statically loaded modules into one chunk, each run only where a page imports
 * it, and marks each built page's one
 * entry script, which loads it, render-blocking; fails the build when a page holds no
 * such tag, or more than one, so a change in how Vite writes it can't pass unnoticed. */
export function renderBlocking(): Plugin {
  return {
    name: "site:render-blocking",
    apply: "build",
    config() {
      return {
        build: {
          rolldownOptions: {
            output: {
              codeSplitting: { groups: [{ name: "index", tags: ["$initial"] }] },
              strictExecutionOrder: true,
            },
          },
        },
      };
    },
    transformIndexHtml: {
      order: "post",
      handler(page, { path }) {
        const found = page.split(entryTag).length - 1;
        if (found !== 1) {
          throw new Error(`site: want one entry tag ${entryTag}… in ${path}, found ${found}`);
        }
        return page.replace(entryTag, blockingTag);
      },
    },
  };
}
