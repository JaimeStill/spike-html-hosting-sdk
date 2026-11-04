# Changelog

All notable changes to `@jaimestill/spike-html-hosting-sdk` are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0]

The first release: the site SDK and template the spike's GitHub Pages sites consume by tag.

### Added

- The package's exports, built ES modules with their declarations:
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
- Peers: vite, eslint, vite-plugin-standard-css-modules, and spike-html-apps-foundation and
  spike-html-apps-tooling at v0.3.0.
- `template/`, a Markdown-copy site on the package's exports: its package and toolchain, the
  shell and Vite config, a sample copied tree (this README), the configs, the content, browser,
  and capture tests, the capture file, and the Pages and CI workflows calling the reusable ones.
- The `spike-html-hosting-sdk` bin, the scaffold, which `pnpm dlx` and `npm exec` run: a site from
  the template for `<repo>` in `[dir]`, pinned to the release it ran from, its lockfile written.
- The `spike-html-hosting-currency` bin: every pin of a site behind its latest.
- The reusable workflows `site-pages.yml`, the check then the Pages deploy, and `site-ci.yml`,
  the check on pull requests, on `workflow_call`.

[Unreleased]: https://github.com/JaimeStill/spike-html-hosting-sdk/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/JaimeStill/spike-html-hosting-sdk/releases/tag/v0.1.0
