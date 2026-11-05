# Changelog

All notable changes to `@jaimestill/spike-html-hosting-sdk` are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/releases/tag/v0.1.0
