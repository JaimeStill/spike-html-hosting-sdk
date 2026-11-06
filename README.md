# spike-html-hosting-sdk

The site SDK and template of spike-html-hosting, published as `@jaimestill/spike-html-hosting-sdk`.
It holds what a GitHub Pages site consumes by tag: the template a site starts from, the package it
builds and tests with, the currency bin it runs, and the reusable workflows it calls.

Each release is a `vX.Y.Z` tag, cut by the release workflow when a version lands on main, whose
tree is the package as `pnpm pack` makes it, its build included.

## A new site

The scaffold bin makes a site from the template for a repository, in `<dir>`, `./<repo>` by
default, which must be new or empty:

```sh
pnpm dlx github:JaimeStill/spike-html-hosting-sdk#v0.5.0 <repo> [dir]
```

or, with npm, which fetches the package's `github:` peers only when told it may:

```sh
npm exec --allow-git=all -- github:JaimeStill/spike-html-hosting-sdk#v0.5.0 <repo> [dir]
```

It copies the template, names the site's package and its index's title after `<repo>`, whose
Pages base is `/<repo>/`, pins the SDK and calls the reusable workflows at the tag it ran from,
marks each file with the release it came from, and writes `pnpm-lock.yaml` with
`pnpm install --lockfile-only`, which reads the network. It never runs `git init`. Then, in the
site, `git init`, since the check's actionlint finds the workflows from the repository's root,
then `mise run install` and `mise run check`.

The new site's `content/` holds a sample copied tree, this README at a commit of this
repository, recorded in `content.json`; replace both with the tree the site publishes, each
file's git blob hash recorded at the source's commit, and list in `vite.config.ts`'s `external`
any file the pages link that the site doesn't copy.

## Install

A site made by hand installs the package from its tag, beside its peers and the components its
shell loads, each pinned exactly:

```sh
pnpm add -D --save-exact github:JaimeStill/spike-html-hosting-sdk#v0.5.0 \
  github:JaimeStill/spike-html-apps-foundation#v0.3.0 \
  github:JaimeStill/spike-html-apps-tooling#v0.3.0 \
  github:JaimeStill/spike-html-hosting-components#v0.4.0 \
  github:JaimeStill/spike-html-hosting-icons#v0.1.0 \
  vite eslint
```

spike-html-hosting-components is no peer of the package, whose modules import none of it: the
pages' markup is written for its elements, and the shell loads them, as the pages below describe.
The components peer the icons layer, spike-html-hosting-icons, as the SDK does, so a site pins it
beside them: it isn't on the npm registry, so a site that leaves it out fails its install, or,
with `autoInstallPeers` off, its build.

## The package

It ships built ES modules and their `.d.ts` declarations, never TypeScript source, and the files a
site reads as they are, each through package.json's `exports`:

| Export | What it is |
| --- | --- |
| `./css-module-scripts.js` | `cssModuleScripts()`, the Vite plugin that rewrites each CSS module script the foundation's modules hold to a constructed `CSSStyleSheet` |
| `./render-blocking.js` | `renderBlocking()`, the Vite plugin that keeps each page's entry script render-blocking, each page running only its own scripts |
| `./markdown-pages.js` | `markdownPages(options)`, the Vite plugin that renders one copied Markdown tree, or several, into pages, its fenced code highlighted and its GitHub alerts callouts, and fills every page's glyph markers, `<svg data-icon="<set>/<name>"></svg>`, with the icons layer's svgs, with `Options` and `TreeOptions`, a tree's source; its renderer, `render()`; the markup it writes for the components, `pageHeader`, `sectionTree`, and `siteIndex`, with `frontMatterText`, a front matter value's text; and `docks`, the widths the layout docks the side columns from |
| `./syntax.js` | `SyntaxTheme`, a palette's syntax theme; `builtinSyntax`, one for each of the foundation's palettes; `checkSyntax(theme)`, the syntax theme check; and `createSyntax(themes, langs)`, the highlighter the plugin makes |
| `./eslint.js` | `config`, a site's ESLint configuration with the leftover check, and `build`, the globs it reads as the build |
| `./content.js` | `checkContent(root)`, the content check; `Content`, content.json's record, one `Tree` or `{ trees: Tree[] }`; `treeDir(repository)`, a tree's directory; `copiedFiles(root)`, every copied file's path under `content/`; and `blob(bytes)`, git's blob hash |
| `./served.js` | `served(root)`, Vite's preview of a site's build under its `/<repo>/` base; `base(root)`, that base from package.json's name; and `command(root, name)`, an installed command's path |
| `./browser.js` | the browser checks, each a `Check`, `(page, site, url?) => Promise<void>`: `shell`, the shell checks by name, each exported too, among them `fitsNarrowWidth`, `definesEveryElement`, `keepsNavigationWords`, `holdsBetweenDocks`, `startsUnderHeader`, `opensKeysHelp`, and `showsGlyphs`; `highlightsEachPalette`, the palette check; and `crawl(page, site, root)`, the Markdown crawl, resolving to its `Crawled` |
| `./screenshots.js` | `description({ root, pages })`, the capture file's description; `contentPages(root)`, a Markdown site's copied pages, every tree's, from content.json; and `capture`, `leavesNoCapture`, and `keepsCaptures`, the capture run the browser tier makes once |
| `./tsconfig.json` | the tsconfig base a site's tsconfig.json and tsconfig.test.json extend |
| `./prettier.json` | the Prettier configuration |
| `./site.css` | the site stylesheet, its `site` layer |

Its peers are vite, eslint, and, at their `github:` tags, spike-html-apps-foundation,
spike-html-apps-tooling, and spike-html-hosting-icons, the icons layer, which a site installs; its
own dependencies are exact pins, among them vite-plugin-standard-css-modules, which
`cssModuleScripts()` configures, and rolldown, whose `rolldown/utils` the plugin parses with and
doesn't declare. A site declares neither: the plugin finds rolldown through pnpm's default hoist,
`node_modules/.pnpm/node_modules`, so a site that turns the hoist off declares rolldown itself, at
the version Vite resolves. Beside the build the package carries its template, its bins, and its
reusable workflows:

| File | What it is |
| --- | --- |
| `template/` | the site the scaffold copies |
| `bin/new.js` | `spike-html-hosting-sdk`, the scaffold bin, which `pnpm dlx` and `npm exec` run as the package's bin named after it |
| `bin/currency.sh` | `spike-html-hosting-currency`, the bin that reports every pin of the site in the current directory behind its latest |
| `.github/workflows/site-ci.yml` | the reusable workflow a site's CI calls: the check on pull requests |
| `.github/workflows/site-pages.yml` | the reusable workflow a site's Pages deploy calls: the check, then the build deployed |

### Use

A site's `vite.config.ts`, as the template's, builds under the base its package name gives, the
one `served()` serves it under, and runs the CSS module script rewrite first, then the Markdown
pages and the render-blocking entry:

```ts
import { cssModuleScripts } from "@jaimestill/spike-html-hosting-sdk/css-module-scripts.js";
import { markdownPages } from "@jaimestill/spike-html-hosting-sdk/markdown-pages.js";
import { renderBlocking } from "@jaimestill/spike-html-hosting-sdk/render-blocking.js";
import { base } from "@jaimestill/spike-html-hosting-sdk/served.js";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: base(root),
  appType: "mpa",
  plugins: [
    cssModuleScripts(),
    markdownPages({ dir: "content", repository: content.url, ref: content.commit }),
    renderBlocking(),
  ],
});
```

`cssModuleScripts` parses the foundation's modules under `node_modules/@jaimestill/` and makes
each sheet they import with `{ type: "css" }` one constructed `CSSStyleSheet`, which Vite alone
doesn't support. `markdownPages` fills the site's `index.html` shell, one `<title>` and one
empty `<main></main>`, with each Markdown file under `dir`, and fails the build on a relative
link it can't place; `external` lists files the source holds that aren't copied. It writes each
page's header, section tree, and site index, as the pages below describe, and highlights each
fenced block at build, as the syntax themes below describe. `renderBlocking` builds every module
a page's entry loads statically into one chunk, `index`, so each page keeps one entry tag however
rolldown would split the modules every page shares, and fails the build on a page with no entry
script, or more than one; a module loaded only by a dynamic import, as the theme menu is, keeps a
chunk of its own. Since one chunk holds every page's modules, it keeps rolldown's
`output.strictExecutionOrder`: each module's body is wrapped and runs only where a page's entry
imports it, so each page runs only its own scripts, and a hand page beside the rendered pages never
runs the shell's Pages drawer wiring. A page loads three JS files, its entry, the shared `index`
chunk, and rolldown's runtime, the last two statically from the entry, so they block render as its
one render-blocking tag does.

`markdownPages` also fills every glyph marker, an empty `<svg data-icon="<set>/<name>"></svg>`,
in every page the build writes, the rendered pages' shell and a site's hand pages alike, with that
icon's `svg` from spike-html-hosting-icons, resolved from the site's root, so a site wires nothing
beyond the plugin. The page gains the icon's markup and no script. A `class` on the marker carries
onto the `svg`, and any other attribute is dropped; a name that isn't `<set>/<name>`, or that the
icons layer doesn't resolve, fails the build, naming the page and the icon:

```html
<svg data-icon="octicon/question-16"></svg>
```

A site's `eslint.config.js` spreads the configuration, which lints the site's code under the
config's directory and runs the leftover check, no CSS module script left in the build, over
`dist/`. Lint after the build, so the check reads it:

```js
import { config } from "@jaimestill/spike-html-hosting-sdk/eslint.js";

export default [...config];
```

A site's unit tier holds its copied tree to `content.json`, each file under `content/` to its git
blob hash:

```ts
import { checkContent } from "@jaimestill/spike-html-hosting-sdk/content.js";

test("the copied tree is its record", () => {
  assert.deepEqual(checkContent(join(import.meta.dirname, "../..")), []);
});
```

`tsconfig.json` and `tsconfig.test.json` extend the base and set their own module resolution,
`checkJs`, and `include`:

```jsonc
{
  "extends": "@jaimestill/spike-html-hosting-sdk/tsconfig.json",
  "compilerOptions": { "module": "esnext", "moduleResolution": "bundler", "checkJs": true },
  "include": ["eslint.config.js", "vite.config.ts"],
}
```

A site's browser tier serves its build with `served` and runs the checks, each on a fresh page of
the tooling's browser driver, inside its own `node:test` tests. Each check asserts with node's
assert and throws on its first failure:

```ts
import { launch, type Browser } from "@jaimestill/spike-html-apps-tooling/browser.js";
import type { Server } from "@jaimestill/spike-html-apps-tooling/server.js";
import { crawl, shell } from "@jaimestill/spike-html-hosting-sdk/browser.js";
import { served } from "@jaimestill/spike-html-hosting-sdk/served.js";

const root = join(import.meta.dirname, "../..");
let server: Server;
let browser: Browser;
before(async () => {
  server = await served(root);
  browser = await launch();
});
after(async () => {
  await browser?.close();
  await server?.stop();
});

for (const [name, check] of Object.entries(shell)) {
  test(name, async () => {
    const page = await browser.open("about:blank");
    await check(page, server.origin).finally(() => page.close());
  });
}
```

A check runs on the site's index, `site`, unless its third argument, `url`, a URL under `site`,
names another page:
`` check(page, server.origin, `${server.origin}briefs/orientation.html`) `` runs it on that page,
every request still held under the base `site` names.

The shell checks, each named in `shell`, assert these:

- The Theme button and T open the theme menu, and its sheet is adopted.
- Stepping each facet sets it on the root.
- The page's one module script is render-blocking.
- Every custom element on the page is defined, so a module the shell fails to load fails the check,
  which names its element's tag.
- Every request resolves under the base, and none fails.
- Main holds its centered reading width at 1600px.
- At 1200px, between the docks, main is centered on a page with no section tree, and the tree docks
  beside it on a page with one.
- At 390px, at 1200px, and at 1600px, main starts directly under the header, however short the
  page: never into the header, or into the section tree's bar between them, and no further below
  it than on a page taller than the viewport.
- ? opens the shell's keys help dialog, which lists the page's bindings, P, ?, T, and the tree's H
  and L. Its character-key switch turns them off, so L and P do nothing, and on again. Every header
  control that binds a key shows it in a `kbd`.
- At 390px, each header button, Pages where the shell has one, Help, and Theme, and, with the keys
  help open, its Close, shows one glyph, the icons layer's `list-unordered-16`, `question-16`,
  `paintbrush-16`, and `x-16`, its markup the icons module's own, and its key hint in a `kbd`, both
  rendered, and no word, named by its `aria-label`: Pages, Help, Theme, and Close.
- Nothing scrolls sideways at 390px.
- At 390px, a pixel below and at each of the layout's docks, and at 1400px, no navigation link's
  word breaks across lines (a hyphenated compound may wrap after its hyphen), and every docked side
  column is at least 16rem wide.
- The theme menu stays unsaved: no stored choice persists.

A Markdown site also crawls its pages, `crawl(page, server.origin, root)`, which resolves to a
`Crawled`, `{ pages, links, unreachable, hand }`: the pages it reached and the in-site links it
counted, the copied pages no link from the index reaches, and the hand pages it reached. Each copied
file's page it reaches loads with a 2xx, its one module script render-blocking, every custom element
on it defined, every request under the base and none failed, main at its centered reading width at
1600px, nothing scrolling sideways at 390px, its navigation, its layout between the docks, its main
under the header, and its keys help and its glyph buttons as the shell checks have them, and its
title its source's front matter name or first h1. Its main opens with its page header, whose dt and
dd pairs are the source's front matter keys and values, in order, with no front matter table left;
its site index, in its Pages drawer, links every copied page the build writes, each once, and no
hand page; its Pages button is hidden at 1600px and at 390px opens the drawer by its click and by P,
its `aria-expanded` following the drawer open and closed; and every in-site link reaches a built
page, and its fragment's element. Since each page's index links every other, the crawl reaches every
page from the index. It checks a page for every Markdown file `content.json` records, every tree's,
crawling from one no link reaches once the links run out. A page it reaches that no record names is
a hand page the site builds, as a root-style site's index is: it loads with a 2xx, every request
under the base and none failed, its ids the targets of the fragments linking it, and its links
followed, but the copied pages' checks are left to the shell checks, which the site runs on it by
its URL; `Crawled.hand` lists each, by its path under the base, in the order the crawl reached it.

A site's `scripts/screenshots.config.ts` exports the description, its pages each a built path
under `dist/`, which the tooling's `spike-html-apps-screenshots` runs; a page's path is its
absolute URL path under the base, and its name its built path without `.html`:

```ts
import { contentPages, description } from "@jaimestill/spike-html-hosting-sdk/screenshots.js";

const root = join(import.meta.dirname, "..");
export default description({ root, pages: contentPages(root) }); // or pages: ["index.html"]
```

The browser tier runs the capture once, on the index, light, under a scratch TMPDIR:

```ts
const config = join(root, "scripts/screenshots.config.ts");
test("leaves no capture behind", () => leavesNoCapture(root, config));
test("with --keep, keeps its captures", () => keepsCaptures(root, config));
```

A site's `mise run currency` runs the bin from its root:

```toml
[tasks.currency]
run = "pnpm exec spike-html-hosting-currency"
quiet = true
```

It reports, one line each, every mise tool, package.json pin, `github:` tag, workflow action pin,
and reusable workflow call behind its latest, typescript against the newest version
typescript-eslint's peer range accepts, and exits 1; with everything current it prints nothing
and exits 0. A reusable workflow call, as
`JaimeStill/spike-html-hosting-sdk/.github/workflows/site-pages.yml@vX.Y.Z`, is compared with its
repository's highest plain `vX.Y.Z` tag.

### Several copied trees

A site may copy several trees into one, each from its own repository at its own commit.
`content.json` records them as `{ trees: [...] }`, each tree a record as a single-source
`content.json` is one, its `files` keyed by their paths in its source:

```json
{
  "trees": [
    {
      "repository": ".github",
      "url": "https://github.com/JaimeStill/.github",
      "commit": "<full commit>",
      "files": { "profile/README.md": "<blob hash>" }
    },
    {
      "repository": "org",
      "url": "https://github.com/JaimeStill/org",
      "commit": "<full commit>",
      "files": { "briefs/orientation.md": "<blob hash>" }
    }
  ]
}
```

Each tree's files sit under `content/` in its directory, `treeDir(repository)`: the repository's
name with a leading dot dropped, so `.github`'s are under `content/github/`, a directory the base
never hides, and `org`'s under `content/org/`. A file's path under `content/` is its page's path
under the base, so `content/github/profile/README.md`, recorded as `profile/README.md`, builds to
`github/profile/`, and `content/org/briefs/orientation.md` to `org/briefs/orientation.html`.
`checkContent` holds each tree to its record, naming the tree in what it finds, and fails on a file
under `content/` no tree records and on two trees that share a directory. A single-source record,
as the template's, is still valid: its one tree sits at `content/`'s root, and its messages are
what they were.

`markdownPages` takes the trees in `trees`, each a `TreeOptions`, `{ repository, ref, external }`,
in place of one tree's source, each tree's directory `treeDir` of its repository URL's last
segment, as `content.json` places it:

```ts
markdownPages({
  dir: "content",
  trees: content.trees.map(({ url, commit }) => ({ repository: url, ref: commit })),
});
```

The trees are one site: one site index lists every tree's pages, and each page's links are placed
against its own tree's source, its `external` that tree's, so a relative link that leaves its tree
fails the build. `contentPages(root)`, `copiedFiles(root)`, and the crawl read every tree's pages.

### A root-style site

A site whose index is a page written by hand, as an org's root site is, beside the rendered pages
of its copied trees, names another file as the shell its rendered pages fill, with `shell`, and
lists its hand pages as build inputs, absolute paths in an array: Vite builds `index.html` only
when no input is given, and the plugin gives its pages, with which a site's own inputs
concatenate. The build fails on a hand input at a copied file's page, which the two would each
write. As the SDK's trees fixture, `test/fixtures/trees/vite.config.ts`, has it:

```ts
export default defineConfig({
  base: base(root),
  appType: "mpa",
  plugins: [
    cssModuleScripts(),
    markdownPages({
      dir: "content",
      trees: content.trees.map(({ url, commit, repository }) => ({
        repository: url,
        ref: commit,
        external: repository === "org" ? ["LICENSE"] : [],
      })),
      shell: "page.html",
    }),
    renderBlocking(),
  ],
  build: {
    rolldownOptions: { input: [`${root}index.html`, `${root}briefs/orientation.html`] },
  },
});
```

A hand page loads what it uses, `renderBlocking` keeping each page to its own scripts; the
fixture's index carries the shell's header, theme menu, and keys help dialog, but no Pages button
or drawer, since it has no site index. The site's browser tier runs the shell checks on each hand
page by its URL, and on a rendered page, and the crawl tolerates the hand pages it reaches:

```ts
for (const path of ["", "briefs/orientation.html", "org/briefs/orientation.html"]) {
  for (const [name, check] of Object.entries(shell)) {
    test(`${name} on ${path || "the index"}`, async () => {
      const page = await browser.open("about:blank");
      await check(page, server.origin, `${server.origin}${path}`).finally(() => page.close());
    });
  }
}
```

### The pages

`markdownPages` writes each page's data as the light-DOM markup of spike-html-hosting-components
v0.4.0's elements, so with no script the page renders it as its own, and each element, once its
module defines it, styles and marks it. The section tree, in a div, comes before main, then main,
opened by the page header, then the site index in the Pages drawer:

```html
<div class="section-tree">
<sl-section-tree dock="70rem"><ul><li><a href="#usage">Usage</a><ul><li><a href="#options">Options</a></li></ul></li></ul></sl-section-tree>
</div>
<main>
<sl-page-header><dl><dt>name</dt><dd>A page</dd><dt>tags</dt><dd>one, two</dd></dl></sl-page-header>
<h1 id="a-page">A page</h1>
…
</main>
<sl-drawer class="site-index" label="Pages" id="pages" dock="86rem"><sl-site-index><ul><li><a href="./">The site</a></li><li><a href="guide/">Guide</a><ul>…</ul></li></ul></sl-site-index></sl-drawer>
```

- `sl-page-header` slots one dl, a dt for each front matter key and a dd for its value, in
  source order, escaped; a sequence's dd is its items joined by ", ", a mapping's its
  `key: value` pairs, as `frontMatterText` gives them. A page with no front matter has an empty
  `sl-page-header`, which takes no space.
- `sl-section-tree` slots a list of the page's h2s, each linking the id its heading carries,
  percent-encoded, with its h3s in a nested list; an h3 before any h2 stands at the top level, and
  a label is the heading's plain text. A page with neither has no tree and no `div.section-tree`.
  It comes before main so that, as the bar in a narrow viewport, it sticks to the top of the
  viewport from the page's own flow, and so a keyboard reaches it in the order the page shows it.
- `sl-site-index` slots a list of every copied page the build writes, nested by directory: the
  root's index page first, then each page by its title, and each directory by its index page's link,
  or a span of its name when it has none, over a nested list of its pages and directories, by name.
  Each link is relative to the page, as its body's are, so it resolves under any base. It sits in
  `sl-drawer`, labeled "Pages", its id `pages`, which the shell's Pages button controls.

Each element's `dock` is the layout's, `docks` exported: `docks.tree`, 70rem, and `docks.index`,
86rem. The renderer writes no `aria-current`: the components mark the section in view and the page
on screen at runtime, and `site.css` paints those marks in a heavier weight. `render()` returns
the page's `headings`, its h2s and h3s, beside its front matter, title, and HTML.

Each body table is wrapped in a named, focusable region, which scrolls the table sideways in a
viewport narrower than it, as a highlighted code block's pre does:

```html
<div class="table-region" role="region" aria-label="Table: Name, Value" tabindex="0">
<table>…</table>
</div>
```

Its name is "Table: " and its header cells' text, joined by ", ", or "Table" when they are empty,
since a GFM table has no caption.

A GitHub alert, a blockquote opening `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, or
`[!CAUTION]`, renders as marked-alert 2.1.2 renders it, as GitHub does: a div of its kind, its
first line a title of the kind's octicon and its kind as visible text, and a link inside it placed
as any other. Each octicon is the icons layer's, through marked-alert's `variants`: `info-16` for a
note, `light-bulb-16` for a tip, `report-16` for important, `alert-16` for a warning, and `stop-16`
for caution, each `aria-hidden` and `focusable="false"`:

```html
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title"><svg … aria-hidden="true" focusable="false">…</svg>Important</p>
<p>…</p>
</div>
```

`site.css` draws it as a callout from the foundation's tokens: a `--line-m` rule at its start and
its title, the octicon sized to the text, in its kind's palette color as GitHub maps the kinds,
note `--blue`, tip `--green`, important `--purple`, warning `--yellow`, and caution `--red`; its
body keeps the page's text color.

`site.css` lays a page out at the two docks, each where its columns fit at their 16rem minimum
beside main's 80ch, measured in the foundation's default type and regular space with a scrollbar
(about 69.3rem and 85.3rem), so no side column is cramped and no navigation link's word breaks:

- 86rem and wider, three columns, `minmax(16rem, 1fr) minmax(0, 80ch) minmax(16rem, 1fr)`: the
  header across them, the Pages drawer docked in the start column, a framed column headed Pages,
  main's reading width in the middle, centered with or without a tree, and the section tree in the
  end column; the tree and the index each stay in view as the page scrolls, and scroll themselves
  when taller than the viewport.
- 70rem to 86rem, on a page with no section tree, `minmax(0, 1fr) minmax(0, 80ch) minmax(0, 1fr)`:
  main centered between equal columns. On a page with one, `body:has(> .section-tree)`, only the
  end column is held to 16rem, `minmax(0, 1fr) minmax(0, 80ch) minmax(16rem, 1fr)`: the section
  tree docked in the end column and main as near centered as fits. Either way the site index is in
  the Pages drawer, a modal dialog the Pages button opens.
- Narrower than 70rem, one column: the section tree is a bar stuck to the top of the viewport,
  holding its reading progress and its Previous and Next buttons, its wrapper
  `display: contents` so the bar sticks within the whole page; the site index stays in the drawer.

Main's track may shrink, main breaks long words while the components' navigation never breaks
inside one, and each table scrolls in its region, so no page is wider than a 390px viewport. The
shell's header is a wrapping row of the site nav, then the Pages, Help, and Theme buttons, each
button, and the keys help's Close, its glyph and its key hint in a row, centered on the line.

The shell wires the components in: it loads their five modules, `site-nav.js`, `site-index.js`,
`page-header.js`, `section-tree.js`, and `drawer.js`, render-blocking like the foundation's, from
`github:JaimeStill/spike-html-hosting-components#v0.4.0`; places `sl-site-nav`, which takes no
content, at its header's start, with no `src`, so it lists the components' built `SITES`; and adds
the Pages button beside the Theme button, as the components' README gives it. keys.js clicks the
button on P, as it does Theme on T; `site.css` shows it only below 86rem, the drawer's dock, and
only once the drawer is defined, so with no script it stays hidden and the index renders as the
page's own; and the page's script opens the drawer on its click and keeps its `aria-expanded` in
step with the drawer's `open` and `close` events. The drawer, open, is a modal: Escape or its Close
button closes it.

A site's shell carries the keys help dialog, as the foundation's keys module gives it: a
`dialog#help` holding a `[data-keys-list]`, which keys.js fills as it opens with every binding the
page has, the Pages button's P, the Help button's ?, the Theme button's T, and the section tree's
H and L, and with the reader's settings, among them the switch that turns the character keys off
(WCAG 2.1.4). The Help button, between Pages and Theme, opens it by the invoker command
`show-modal`, and keys.js clicks it on ?; ? or Escape closes it. The dialog names each binding by
its element's `aria-label`, else by its text less each `kbd`. The SDK's template and fixture
shells carry it; a site whose shell lacks it adds it.

The Pages, Help, and Theme buttons, and the dialog's Close, each show a glyph and their key hint,
a `kbd` alone, `aria-hidden`, and no word: each is named by its `aria-label`, Pages, Help, Theme,
and Close, which the dialog lists. Each glyph is a marker that `markdownPages` fills at build from
the icons layer, as the components' README gives the shell: Octicons' `list-unordered-16` for
Pages, `question-16` for Help, `paintbrush-16` for Theme, and `x-16` for Close. A site pins the
icons layer, which the components and the SDK both peer, at `v0.1.0`; a marker the build can't
fill fails it.

```html
<script type="module" blocking="render" src="@jaimestill/spike-html-hosting-components/site-nav.js"></script>
<script type="module" blocking="render" src="@jaimestill/spike-html-hosting-components/site-index.js"></script>
<script type="module" blocking="render" src="@jaimestill/spike-html-hosting-components/page-header.js"></script>
<script type="module" blocking="render" src="@jaimestill/spike-html-hosting-components/section-tree.js"></script>
<script type="module" blocking="render" src="@jaimestill/spike-html-hosting-components/drawer.js"></script>
<script type="module" blocking="render">
  const drawer = document.querySelector("sl-drawer#pages");
  const opener = document.querySelector(".pages-opener");
  opener.addEventListener("click", () => drawer.show());
  const expanded = () => opener.setAttribute("aria-expanded", String(drawer.open));
  drawer.addEventListener("open", expanded);
  drawer.addEventListener("close", expanded);
</script>
…
<header>
  <sl-site-nav></sl-site-nav>
  <button
    type="button"
    class="pages-opener"
    aria-controls="pages"
    aria-haspopup="dialog"
    aria-expanded="false"
    aria-label="Pages"
    data-keys="p"
  >
    <svg data-icon="octicon/list-unordered-16"></svg>
    <span aria-hidden="true"><kbd>P</kbd></span>
  </button>
  <button type="button" commandfor="help" command="show-modal" aria-label="Help" data-keys="?">
    <svg data-icon="octicon/question-16"></svg>
    <span aria-hidden="true"><kbd>?</kbd></span>
  </button>
  <button type="button" commandfor="theme" command="--open" aria-label="Theme" data-keys="t">
    <svg data-icon="octicon/paintbrush-16"></svg>
    <span aria-hidden="true"><kbd>T</kbd></span>
  </button>
</header>
<main></main>
<sl-theme-menu id="theme"></sl-theme-menu>
<dialog id="help" aria-labelledby="help-title">
  <h2 id="help-title">Keyboard shortcuts</h2>
  <div data-keys-list></div>
  <footer>
    <button type="button" commandfor="help" command="close" aria-label="Close" data-keys="?">
      <svg data-icon="octicon/x-16"></svg>
      <span aria-hidden="true"><kbd>?</kbd></span>
    </button>
  </footer>
</dialog>
```

`cssModuleScripts` parses every module under `node_modules/@jaimestill/`, the components' among
them, so their sheets build to constructed `CSSStyleSheet`s as the foundation's do.

### Syntax themes

`markdownPages` highlights each fenced block at build with Shiki, under every syntax theme at once,
so a page's code takes the colors of the palette and scheme the reader chooses, true to the editor
theme the palette comes from. A syntax theme names a palette of the foundation's Color profile and
the theme its code takes in light and in dark, each the name of a theme Shiki bundles or a theme
object, as a VS Code color theme writes one:

```ts
interface SyntaxTheme {
  palette: string;
  light: BundledTheme | ThemeRegistrationAny;
  dark: BundledTheme | ThemeRegistrationAny;
}
```

`builtinSyntax`, the plugin's default, maps each of the foundation's palettes to its source:

| Palette | Light | Dark |
| --- | --- | --- |
| flexoki | Flexoki Light | Flexoki Dark |
| primer | `github-light-default` | `github-dark-dimmed` |
| catppuccin | `catppuccin-latte` | `catppuccin-mocha` |
| everforest | `everforest-light` | `everforest-dark` |

The last three are Shiki's bundled themes. Shiki doesn't bundle Flexoki, so its pair is Flexoki's
own VS Code themes, copied byte for byte from kepano/flexoki at 24ab91d with its license, which the
package carries under `dist/syntax/flexoki/`. Its green follows the foundation's departure from
Flexoki's, rotated to hue 142°: the pair takes green-600, `#66800B`, as `#408739` and green-400,
`#879A39`, as `#61a25a`, the foundation's `--green`, as it loads the copy; every other color is
Flexoki's own.

A site that registers a palette of its own, as spike-html-apps-noctis registers noctis (its sheet
after the foundation's page entry, its module after the foundation's registration and before
`preferences.js`), appends a syntax theme for it:

```ts
import { builtinSyntax } from "@jaimestill/spike-html-hosting-sdk/syntax.js";
import type { SyntaxTheme } from "@jaimestill/spike-html-hosting-sdk/syntax.js";

const noctis: SyntaxTheme = {
  palette: "noctis",
  light: theme("themes/hibernus.json"),
  dark: theme("themes/obscuro.json"),
};

markdownPages({ dir: "content", repository, ref, syntax: [...builtinSyntax, noctis] });
```

Light and dark merge into one theme whose every color is `light-dark()` of the two, so the pair
must agree rule for rule. `checkSyntax(theme)` resolves to what keeps a syntax theme from merging,
one line each naming its palette, and to none when it merges: a palette name that isn't
lowercase letters, digits, and `-`; a bundled name Shiki doesn't have; a theme with no editor
foreground; and rules that differ in number, in order of scope, in font style, or in being colored
in one scheme only. The build refuses a syntax theme that fails it, or a palette two of them name,
listing each failure. A site's unit tier can hold its own to it:

```ts
import { checkSyntax } from "@jaimestill/spike-html-hosting-sdk/syntax.js";

test("the Noctis pair merges", async () => {
  assert.deepEqual(await checkSyntax(noctis), []);
});
```

Code falls back to plain, in the page's text color, where there is nothing to highlight it with:
a fence with no language label, or one Shiki bundles no grammar for, and an indented block, render
as marked renders them; and a palette with no syntax theme matches no rule, so its code is plain.
`syntax: []` highlights nothing and emits no stylesheet.

`highlightsEachPalette`, a `Check` outside `shell`, holds a page's highlighted code to its syntax
themes: it steps the theme menu to each palette the registry lists, in light and then in dark, and
in each checks that every token renders its palette's color and some token differs from the page's
text color, failing on a palette whose code renders plain, naming the palette and the scheme. It
runs on a page with highlighted code, which the site's test gives, as the template's runs it on
its index:

```ts
test("each palette's code takes its syntax theme, in light and in dark", async () => {
  const page = await browser.open("about:blank");
  await highlightsEachPalette(page, server.origin).finally(() => page.close());
});
```

### The reusable workflows

A site's workflows call the reusable ones from a release tag. Each checks out the calling
repository. The deploy needs the caller to grant `contents: read`, `pages: write`, and
`id-token: write`, and the repository's Pages source set to GitHub Actions, whose `github-pages`
environment it deploys to:

```yaml
# .github/workflows/pages.yml
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  pages:
    uses: JaimeStill/spike-html-hosting-sdk/.github/workflows/site-pages.yml@vX.Y.Z
```

```yaml
# .github/workflows/ci.yml
on:
  pull_request:
    branches: [main]
jobs:
  check:
    uses: JaimeStill/spike-html-hosting-sdk/.github/workflows/site-ci.yml@vX.Y.Z
```

`.prettierrc.json` names the configuration as a string:

```json
"@jaimestill/spike-html-hosting-sdk/prettier.json"
```

The page links the stylesheet by the package's name, after the foundation's page entry, and Vite
resolves it through `exports` and bundles it into the page's sheet:

```html
<link rel="stylesheet" href="@jaimestill/spike-html-hosting-sdk/site.css" />
```

## The template

`template/` is a Markdown-copy site, the one the scaffold copies, which consumes the SDK by its
exports alone:

- `package.json`, its name the repository's, the SDK at its tag, the peers, the components at
  `v0.4.0`, and the icons layer at `v0.1.0`, each at its pin, with typescript, prettier, and
  `@types/node`; `mise.toml`, the toolchain and the tasks: install, check and its steps,
  screenshots, and currency, the SDK's bin; `scripts/preflight.sh`, which runs before node_modules
  exists, so the site holds its copy.
- `vite.config.ts`, the SDK's three plugins and the base from the package's name; `index.html`, the
  shell, with the foundation's full page entry, its preferences and keys modules, the components'
  five modules, `sl-site-nav`, the Pages button on P, the Help button on ?, and the Theme button on
  T in the header, each showing its glyph and its key hint, named by its `aria-label`, the keys help
  dialog, its Close showing its glyph, the script that opens the Pages drawer, and the SDK's
  stylesheet; the sample copied tree, `content/` and `content.json`.
- `eslint.config.js`, `tsconfig.json`, `tsconfig.test.json`, `.prettierrc.json`, and
  `.prettierignore` on the SDK's configurations; `gitignore`, which the scaffold restores as
  `.gitignore`, since a pack never carries one.
- `pnpm-workspace.yaml`, the site's pnpm settings, no workspace packages: `minimumReleaseAge: 0`,
  pnpm's wait of a day before it installs a release turned off, as the SDK's own is.
- The tests: the content check; the shell checks, the palette check, and the crawl; and the
  capture run, on `scripts/screenshots.config.ts`'s description of the pages from `content.json`.
- `.github/workflows/pages.yml` and `ci.yml`, which call the reusable workflows at the tag.
- `LICENSE` and a `README.md` stub.

Each file that takes comments ends its provenance with the line the scaffold fills,
`From spike-html-hosting-sdk (vX.Y.Z): template/<path>`. The template's files hold the
scaffold's two tokens, the repository's name and the version, so the SDK's own lint, format,
and type check skip `template/`; the scaffold test checks a scaffolded copy with its own check.

## Keeping pace

A site keeps pace with the SDK by its tag. `mise run currency` reports the package's pin and each
reusable workflow call behind the SDK's highest tag; bump the tag in `package.json` and in both
workflows' `uses:` lines, run `pnpm install`, and run `mise run check`. A release's CHANGELOG
entry names any change a site's own files need, such as a template file to take again.

## Tasks

- `mise run install`: install the pinned tools and node_modules.
- `mise run check`: the check, in order: ESLint; Prettier, shellcheck, and actionlint; tsc's type
  check; the build to `dist/`; the unit tier; the pack check, which installs a pack of the build
  into a scratch site, resolves each export from it, and runs the bin a pnpm install links; the
  browser tier, which builds the fixture site, `test/fixtures/site/`, and runs the shell checks,
  the crawl, and the capture on it in the pinned chrome-headless-shell; the Noctis fixture,
  `test/fixtures/noctis/`, on which the palette check passes with its syntax theme and fails
  without it; and the trees fixture, `test/fixtures/trees/`, a root-style site of two trees, on
  whose hand pages and a rendered page the shell checks run, and which it crawls; and the scaffold
  test, which scaffolds a site into a scratch directory, installs it offline on the working tree,
  and runs the site's own check. It reads no network.
- `mise run currency`: report every pin behind its latest, with the SDK's own bin.
