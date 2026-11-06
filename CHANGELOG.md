# Changelog

All notable changes to `@jaimestill/spike-html-hosting-sdk` are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2026-11-05

Main directly under the header on a page shorter than the viewport.

### Fixed

- `site.css` packs the grid's rows at the top, `align-content: start`, at 70rem and wider. The
  foundation's reset gives the body a min-height of the viewport's, and on a shorter page v0.3.0's
  rows stretched into the room left over, pushing main down from the header: hundreds of pixels on
  a short page between the docks, and at 1600px on a page with no docked drawer. A taller page, the
  docked drawer, and the section tree, each held in view as the page scrolls, are unchanged.
- `./browser.js`: `startsUnderHeader`, in `shell`, and the crawl assert, at 390px, at 1200px, and
  at 1600px, that main starts directly under the header, or under the section tree's bar where it
  sits between them, never into it and no further below it than on the same page made taller than
  the viewport. The fixture site's index and orphan page are shorter than the viewport, and with
  v0.3.0's rows both checks fail on the index.

## [0.3.0] - 2026-11-05

The pages' navigation: each page's front matter, section tree, and site index written as the
light-DOM markup of spike-html-hosting-components v0.2.2's elements, which the shell loads, the
site index in a Pages drawer where its column doesn't fit, and tables that scroll in named regions.
A site made from v0.2.0 takes the template's `index.html` and `package.json`'s components pin
again, and one that imported `frontMatterTable` takes
`pageHeader`: its removal is a breaking change at 0.y.

### Added

- `markdownPages` writes each page's data as the light-DOM markup of
  spike-html-hosting-components v0.2.2's elements: an `sl-section-tree` of the page's h2s and
  their h3s, by the ids the headings carry, in a `div.section-tree` before main; an
  `sl-page-header` at the top of main, a dl of the front matter's keys and values in source order,
  escaped; and an `sl-site-index` of every page the site builds, nested by directory, after main
  in the Pages drawer, `<sl-drawer class="site-index" label="Pages" id="pages">`. Each element's
  `dock` is the layout's, `docks`: the tree's 70rem, the drawer's 86rem. `render()` returns the
  page's `headings`; `pageHeader`, `sectionTree`, `siteIndex`, `frontMatterText`, and `docks` are
  exported.
- Each body table is wrapped in a `div.table-region`, `role="region"`, named by its header cells,
  with `tabindex="0"`, which scrolls it sideways.
- `site.css` docks each side column only where it fits at 16rem beside main's 80ch: from 86rem three
  columns, the docked drawer, main centered, and the tree; from 70rem the tree beside main on a page
  that has one, main centered on a page that hasn't, and the index in the drawer; narrower, one
  column, the tree a bar stuck to the top of the viewport, its wrapper `display: contents`. It shows
  the Pages button only below 86rem, once the drawer is defined; styles the table regions; and
  paints the components' `aria-current` marks.
- `./browser.js`: `fitsNarrowWidth`, in `shell`, nothing scrolling sideways at 390px; the crawl
  asserts each page's header against its front matter, its site index, in its Pages drawer,
  against the pages the build writes, and no sideways scroll at 390px.
- `./browser.js`: `keepsNavigationWords`, in `shell`, and the crawl assert, at 390px, a pixel
  below and at each dock, and at 1400px, that no navigation link's word breaks across lines, but
  a hyphenated compound after its hyphen, and every docked side column is at least 16rem wide.
  The crawl asserts each page's Pages button hidden at 1600px, and at 390px opening the drawer by
  its click and by P, its `aria-expanded` following the drawer.
- `./browser.js`: `holdsBetweenDocks`, in `shell`, and the crawl assert at 1200px, between the
  docks, main centered on a page with no section tree and the tree docked beside main on a page
  with one.
- `./browser.js`: `opensKeysHelp`, in `shell`, and the crawl assert at 1200px that ? opens the
  shell's keys help dialog, listing the page's bindings, P, ?, T, and the tree's H and L, and that
  its character-key switch turns them off, L moving to no section and P opening no drawer, and on
  again.
- `./browser.js`: `definesEveryElement`, in `shell`, and the crawl assert every element on a
  page whose name holds a hyphen is defined once it loads, failing with the page and the
  undefined tags, so a shell that fails to load one of the components' modules fails the checks
  rather than hanging the capture run.
- The template's shell loads the components' five modules, render-blocking, with `sl-site-nav` at
  the header's start, then the Pages button, bound to P, which opens the Pages drawer below its
  dock, the Help button, bound to ?, which opens the keys help dialog the foundation's keys module
  fills with the page's bindings and its character-key switch, and the Theme button; the Pages and
  Help buttons carry `aria-label`s, so the dialog names them without their key hints, each a `kbd`
  alone. A site made from v0.2.0 adds the dialog and the Help button to its own shell. The
  template pins `github:JaimeStill/spike-html-hosting-components#v0.2.2`, as the SDK's dev
  dependency does.

### Changed

- `renderBlocking` groups every module a page's entry loads statically into one chunk, `index`,
  so each page keeps one entry tag however rolldown would split the modules every page shares.
- The SDK and the template pin pnpm 12.18.0, from 12.16.1.

### Removed

- `frontMatterTable` and the front matter's `table.front-matter`: the page header shows it.

## [0.2.0] - 2026-11-05

Highlighted code: each fenced block of a Markdown page takes its palette's syntax theme, in light
and in dark.

### Added

- `markdownPages` highlights each fenced block at build with Shiki 4.6.0 (and
  `@shikijs/transformers` 4.6.0), pinned exactly, under every syntax theme at once: each token one
  class, and a generated stylesheet, `assets/syntax-<hash>.css`, whose rules select each palette's
  colors under its `data-palette`. Its new `syntax` option takes the syntax themes, `builtinSyntax`
  by default; a fence with no label or one Shiki bundles no grammar for, an indented block, and a
  palette with no syntax theme render plain.
- `./syntax.js`: `SyntaxTheme`, `{ palette, light, dark }`; `builtinSyntax`, flexoki to the Flexoki
  VS Code themes copied from kepano/flexoki at 24ab91d, their green the foundation's hue-142°
  departure from Flexoki's (`#408739` light, `#61a25a` dark), primer to `github-light-default` and
  `github-dark-dimmed`, catppuccin to `catppuccin-latte` and `catppuccin-mocha`, and everforest to
  `everforest-light` and `everforest-dark`; `checkSyntax(theme)`, what keeps a pair from merging
  into one `light-dark()` theme; and `createSyntax(themes, langs)`, the highlighter.
- `./browser.js`: `highlightsEachPalette`, the palette check, outside `shell`: on a page with
  highlighted code, each palette the registry lists, in light and in dark, renders its syntax
  theme's colors, failing on one whose code is plain. The template's browser test runs it on the
  index.

### Changed

- vite 8.3.6, the dev dependency, the peer range's floor, and the template's pin.
- `minimumReleaseAge: 0` in a new `pnpm-workspace.yaml`, the SDK's and the template's, which
  turns off pnpm's default wait of a day before it installs a release: currency moves each pin to
  its latest release, whose notes are read before the bump lands, and with the wait on, a frozen
  install of a lockfile pinning a release under a day old fails, as CI's did on vite 8.3.6. A site
  made from v0.1.0 takes the template's file.

### Fixed

- The scaffold's closing line, and the SDK README's scaffold section, name `git init` before
  `mise run install` and `mise run check`, since the site's actionlint needs a git repository.
- The template's `README.md` keeps every line within 100 columns for a repository name up to 95
  characters, the name on lines of its own. A site made from v0.1.0 takes it again.

## [0.1.0]

The first release: the site SDK and template the spike's GitHub Pages sites consume by tag.

### Added

- The package's exports, built ES modules with their declarations:
  - `./css-module-scripts.js`: `cssModuleScripts()`, the Vite plugin that rewrites each CSS module
    script the foundation's modules hold to a constructed `CSSStyleSheet`, a site's first plugin.
  - `./render-blocking.js`: `renderBlocking()`, the Vite plugin that keeps each page's one entry
    script render-blocking.
  - `./markdown-pages.js`: `markdownPages(options)`, the Vite plugin that renders a copied Markdown
    tree into pages in the site's shell, and its renderer.
  - `./eslint.js`: `config`, a site's ESLint configuration with the leftover check, no CSS module
    script left in the build, and `build`, the globs it reads as the build.
  - `./content.js`: `checkContent(root)`, the copied tree against `content.json`, and `blob(bytes)`.
  - `./served.js`: `served(root)`, Vite's preview of the build under the `/<repo>/` base,
    `base(root)`, and `command(root, name)`.
  - `./browser.js`: the shell checks, `shell` and each by name, and `crawl`, the Markdown crawl.
  - `./screenshots.js`: `description`, `contentPages`, `capture`, `leavesNoCapture`, and
    `keepsCaptures`.
  - `./tsconfig.json`, `./prettier.json`, and `./site.css`, the files a site reads as they are.
- Peers: vite, eslint, and spike-html-apps-foundation and spike-html-apps-tooling at v0.3.0.
- Dependencies, pinned exactly, among them vite-plugin-standard-css-modules 0.3.0, which
  `cssModuleScripts()` configures, and rolldown 1.2.16, whose `rolldown/utils` the plugin parses
  with and doesn't declare, so a site declares neither. The plugin finds rolldown through pnpm's
  default hoist; a site that turns the hoist off declares rolldown itself.
- `template/`, a Markdown-copy site on the package's exports: its package and toolchain, the
  shell and Vite config, a sample copied tree (this README), the configs, the content, browser,
  and capture tests, the capture file, and the Pages and CI workflows calling the reusable ones.
- The `spike-html-hosting-sdk` bin, the scaffold, which `pnpm dlx` and `npm exec` run: a site from
  the template for `<repo>` in `[dir]`, pinned to the release it ran from, its lockfile written.
- The `spike-html-hosting-currency` bin: every pin of a site behind its latest.
- The reusable workflows `site-pages.yml`, the check then the Pages deploy, and `site-ci.yml`,
  the check on pull requests, on `workflow_call`.

[Unreleased]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/releases/tag/v0.1.0
