# Changelog

All notable changes to `@jaimestill/spike-html-hosting-sdk` are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `./browser.js`'s `hasTargetSize`, a shell check, which the crawl runs on every copied page too:
  every glyph button the page renders, its own and those in the components' shadow roots, is at
  least 24 CSS px a side (WCAG 2.5.8), at 390px and at 1600px, in the regular and the compact
  space. A smaller one fails it, naming the page, the width, the space, and the button.
- `./browser.js`'s `keepsHeaderRow`, a shell check, which the crawl runs too: at 390px, 1120px,
  and 1376px the header's `header-actions` group holds its rendered buttons on one line, at the
  header's inline end and on the site nav's first line, and at 390px nothing scrolls sideways.
- `./browser.js`'s `followsShortcutDialogs`, a shell check, which the crawl runs too: every dialog
  a keyed `show-modal` opener opens, a `button[data-keys][commandfor][command=show-modal]`,
  follows the components' shortcut dialog pattern. A page fails, naming the dialog and what it
  lacks, where the dialog has no name from a heading inside it by `aria-labelledby`, no Close, a
  glyph button with `command="close"` for it showing `<kbd>Esc</kbd>`, or where its opener
  doesn't show its key in a `kbd`, has no `aria-label`, or has no interest hint holding that name.
- `./browser.js`'s `opensSettings`, in place of `opensThemeMenu`: the Settings button and S open
  `dialog#settings`, whose `sl-settings` renders, its shadow root adopting the build's constructed
  sheets, the foundation's `theme-menu.css` among them, with no stylesheet fetched; Escape closes
  it.
- `./browser.js`'s `storesAtOnce`, in place of `staysUnsaved`: a step of the settings' color row
  is stored at once, kept as the dialog closes, and applied after a reload.

### Changed

- The template's header is the site nav and one group of buttons at its inline end,
  `<div class="header-actions">`: Pages under P, Help under ?, and Settings under S, Octicons'
  `gear-16`, in place of Theme under T. Each is a glyph button of the class `glyph-button`, with
  an empty `aria-description` and an interest hint, a `glyph-hint` popover holding its name, as
  spike-html-hosting-components' README gives the header. The Settings button sends `show-modal`
  to `dialog#settings`, its shortcut dialog. The shell links the components' `glyph-button.css`
  between the foundation's entry and `site.css`. A site takes the template's header again, or the
  shell checks fail on it.
- `site.css` lays the header out as the nav, taking the rest of the row and wrapping its own
  links, and the `header-actions` group, which never wraps and stays on the nav's first line at
  every width. It drops its own row for the shell's buttons, which `glyph-button.css` lays out,
  and its Pages button rules sit outside its layer, after `glyph-button.css`, whose unlayered
  `display` would otherwise win.
- The shell checks and the crawl expect Settings under S where they expected Theme under T: the
  keys help lists S Settings, and the glyph check names the Settings button.

- `./screenshots.js`'s `description` captures every page whole at 390x844, 1120x700, and
  1376x860, a phone's width and the layout's two docks, 70rem and 86rem, in place of 1280x800 and
  390x844, and the index also with Help open, beside Settings open, at each: nine states, each
  named by its width, as `index-help-1120`. `leavesNoCapture` asserts the nine.
- The template's shell holds the components' two shortcut dialogs in place of the theme menu, the
  placeholder `dialog#settings`, and the script that bridged them: `dialog#help`, headed "Keyboard
  shortcuts", holds `sl-shortcuts` alone, with no `[data-keys-list]`, and `dialog#settings`,
  headed "Settings", holds `sl-settings`. Each is named by its heading through `aria-labelledby`
  and closed by a Close glyph button showing `x-16` and `<kbd>Esc</kbd>`, with no `data-keys`;
  Help's Close no longer binds ?. The shell imports the components' `shortcuts.js` and
  `settings.js`, which need a components release past `v0.4.0`. A site takes the template's
  shell again, or the shell checks fail on it.
- `site.css` gives `dialog#help` and `dialog#settings` the foundation theme menu's width,
  `min(100% - 2 * var(--space-s), 56rem)`, so both shortcut dialogs are the size the settings'
  rows and preview were laid out for.
- The theme checks work through `sl-settings`: `stepsEachFacet` and `highlightsEachPalette` step
  its rows in the Settings dialog, opened by S, and remove the choice they store after, since
  every step is stored at once. `requestsUnderBase` opens Settings and Help and fails where the
  foundation's `theme-menu.js` or `keys-help.js` is requested.
- `opensKeysHelp`: ? opens Help, whose `sl-shortcuts` lists exactly the page's bindings as the
  foundation's keys module holds them, the shell's P, ?, S, H, and L among them; Escape closes it;
  the character-key switch, now in Settings' `sl-settings`, turns them off and on again.
- `showsGlyphs` checks each shortcut dialog's Close, showing `x-16` and Esc, and `hasTargetSize`
  measures each dialog's glyph buttons, its Close among them, with the dialog open.
- `./screenshots.js`'s index state with the theme menu open is Settings open, by the Settings
  button's click and ready once `sl-settings` renders, named as `index-settings-1120`; Help open
  is ready once `sl-shortcuts` renders its rows. `leavesNoCapture` asserts the nine by those
  names.

## [0.5.0] - 2026-11-06

Glyphs from the icons layer, spike-html-hosting-icons, filled into every page at build, and the
shell's header showing them. A site must now pin the icons layer, `v0.1.0`, beside the components,
which peer it too: it isn't on the npm registry, so a site that leaves it out fails its install,
or, with `autoInstallPeers` off, its build. A site takes the template's header and keys help
dialog again, each button's word replaced by its glyph marker, or the shell checks fail on it.

### Added

- The icons layer,
  [spike-html-hosting-icons](https://github.com/JaimeStill/spike-html-hosting-icons), as a peer at
  its `github:` tag, `v0.1.0`, beside the foundation and the tooling: a site installs it.
- `markdownPages` fills every glyph marker, an empty `<svg data-icon="<set>/<name>"></svg>`, in
  every page the build writes, the rendered pages' shell and a site's hand pages alike, with that
  icon's `svg` from the icons layer, resolved from the site's root, and adds no script. A `class`
  on the marker carries onto the `svg`; a name that isn't `<set>/<name>`, or that the icons layer
  doesn't resolve, fails the build, naming the page and the icon, and an `svg` holding `data-icon`
  that isn't a marker, self-closed, unquoted, or not empty, fails it, naming the page and its tag;
  a comment's text is left as it is. A site wires nothing beyond the plugin it already calls.
- `./browser.js`'s `showsGlyphs`, a shell check, which the crawl runs on every copied page too: at
  390px each header button, Pages where the shell has one, Help, and Theme, and the keys help
  dialog's Close shows one glyph, the icons module's svg, and its key hint in a `kbd`, both
  rendered, and no word, named by its `aria-label`, Pages, Help, Theme, and Close. A missing or
  wrong glyph, or a word shown, fails it, naming the page and the button.

### Changed

- A GitHub alert's title shows the icons layer's Octicon in place of marked-alert's own, through
  its `variants`: `info-16` for a note, `light-bulb-16` for a tip, `report-16` for important,
  `alert-16` for a warning, and `stop-16` for caution, each 1em square in `currentColor`,
  `aria-hidden` and `focusable="false"`, the kind's name still its visible text.
- The template's header buttons show Octicons' `list-unordered-16` for Pages, `question-16` for
  Help, and `gear-16` for Theme, each with its key hint in a `kbd` and its name in its
  `aria-label`, the word no longer shown; the keys help dialog's Close shows `x-16` with its ?
  hint, named Close. The keys help still lists P Pages, ? Help, and T Theme. Each is a glyph
  marker the build fills, as spike-html-hosting-components' README gives the shell. `site.css`
  lays each of the shell's buttons, the header's and the keys help's Close, out as its glyph and
  its key hint in a row, centered on the line, the glyph a block in the foundation's reset.
- The template pins spike-html-hosting-components at `v0.4.0`, from `v0.3.0`, and the icons layer
  at `v0.1.0`; the SDK's own dev dependency on the components moves to `v0.4.0` with it.
- The reusable workflows, `site-ci.yml` and `site-pages.yml`, run `jdx/mise-action` at `v5.2.7`,
  from `v5.2.6`: a failed tool download is retried with backoff, and logs its HTTP status.

## [0.4.0] - 2026-11-06

Several copied trees as one site, a root-style site with a hand index beside its rendered pages,
and GitHub alerts as callouts. A site of one tree keeps its `content.json` and `vite.config.ts` as
they are; one that types a check by its two arguments takes `Check`'s third, optional.

### Added

- `markdownPages` takes several trees, `trees: [{ repository, ref, external }]`, each a
  `TreeOptions`, in place of one tree's source: each tree's files under `dir` in its directory, the
  repository's name with a leading dot dropped (`.github` is `github`), built to pages at their
  source paths under it. One site index lists every tree's pages, each page's links are placed
  against its own tree's source, and a failure names the page by its tree's directory.
- `content.json` may record `{ trees: [...] }`, each tree's files under `content/<dir>/`, keyed by
  their paths in its source. `checkContent` holds every tree to its record and fails on a file
  under `content/` no tree records and on two trees sharing a directory; a single-source record is
  one tree at `content/`'s root, still valid, its messages unchanged. `./content.js` exports
  `Tree`, `Content`, `treeDir(repository)`, a tree's directory, and `copiedFiles(root)`, every
  copied file's path under `content/`; `contentPages` lists every tree's pages.
- A root-style site: a site's own build inputs concatenate with the plugin's pages, so a site whose
  index is a hand page lists its hand pages as inputs, absolute paths in an array, and names its
  rendered pages' shell with `shell`; the build fails on a hand input at a copied file's page.
  `test/fixtures/trees/` is one, which the browser tier checks.
- `./browser.js`: `Check` is `(page, site, url?) => Promise<void>`, each check run on the page at
  `url`, under `site`, `site` itself by default, so a site runs the shell checks on each hand page.
  The crawl tolerates the hand pages it reaches, loading each, its requests under the base and its
  links followed, and returns them in `Crawled.hand`; it still checks every copied page of every
  tree.
- `markdownPages` renders GitHub alerts, `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, and
  `[!CAUTION]`, with marked-alert 2.1.2, pinned exactly, as GitHub does: a
  `div.markdown-alert.markdown-alert-<kind>`, its title the kind's octicon, `aria-hidden`, and its
  kind as visible text. `site.css` draws each as a callout, a `--line-m` rule and its title in the
  kind's palette color: note `--blue`, tip `--green`, important `--purple`, warning `--yellow`, and
  caution `--red`.

### Changed

- `renderBlocking` keeps rolldown's `output.strictExecutionOrder`: its one `index` chunk holds
  every page's modules, each now run only where a page's entry imports it, so each page runs only
  its own scripts, where before every page ran every page's, the shell's Pages drawer wiring
  throwing on a hand page with no drawer. A page loads three JS files, its entry, the shared
  `index` chunk, and rolldown's runtime, still through its one render-blocking tag.
- The SDK's dev dependency and the template pin
  `github:JaimeStill/spike-html-hosting-components#v0.3.0`, from v0.2.2, whose `sl-site-nav`
  takes an optional `src`; the template's keeps none, listing the built `SITES`. A site made from
  an earlier release moves its pin.

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
- The template's and the fixture site's Theme button shows its key, T, as the Pages and Help
  buttons show theirs: `Theme <span aria-hidden="true"><kbd>T</kbd></span>`, with
  `aria-label="Theme"`, which the keys help names its row by. `opensKeysHelp`, in `shell`, and the
  crawl assert that every control in the header with `data-keys` shows its key in a `kbd`; the
  Theme button's earlier markup, its label alone, fails it.

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

[Unreleased]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/releases/tag/v0.1.0
