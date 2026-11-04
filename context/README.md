# spike-html-hosting-sdk

spike-html-hosting-sdk is the site SDK and template of spike-html-hosting, released by tag and
consumed by the spike's three sites: the org stand-in's site (spike-html-hosting) and
spike-html-hosting-architecture's and spike-html-hosting-sqlate's. package.json stays at `0.0.0`,
which `release.yml` never tags, until the first release. This context records only working
knowledge the code and the README do not express.

## Capability map

- **The package:** `@jaimestill/spike-html-hosting-sdk`, the code a site builds with, released
  by tag: tsc's build of `src/` into `dist/`, which only a tag's tree carries, and the files a site
  reads as they are, copied beside it (`scripts/build.sh`). It exports the `renderBlocking` and
  `markdownPages` Vite plugins, the ESLint configuration with the leftover check, the content
  check, the tsconfig base, the Prettier configuration, the site stylesheet, and the browser tier
  a site runs: `served()`, the shell checks and the crawl, and the capture description and run;
  the README's table maps each export. The SDK lints itself with its own export (`eslint.config.js` imports
  `src/eslint.ts`) and formats itself with its own Prettier configuration (`.prettierrc.json`
  names `src/prettier.json`). The sites still hold their copies until they move to the package.
- **The pack check:** `test/pack/pack.test.ts`, the check's last step: a pack of the build,
  installed into a scratch site with no network, its dependencies and peers linked from the
  repository's own install, since pnpm's offline install holds no metadata after a frozen install.
  The site imports each JS export, types its code under the tsconfig base, resolves the Prettier
  configuration, builds with both plugins and the stylesheet linked, lints clean, and passes the
  content check. It also checks the tarball carries the bin and the reusable workflows, and runs
  the bin from a second scratch site, a real `pnpm install --offline` of the tarball whose every
  dependency and peer is overridden by a `link:` to the repository's install, so pnpm fetches
  nothing and links the bin as it does for a site.
- **The fixture site:** `test/fixtures/site/`, the browser tier's site: a shell `index.html` as
  the sites write it, four Markdown pages, one linked by no other so the crawl restarts from it,
  and a `content.json`. Its `vite.config.ts` builds with the SDK's plugins from `src/`, with the
  stylesheet's package name aliased to `src/site.css`, so it needs no build of the SDK; its
  `dist/` is gitignored and outside the SDK's lint. Its package.json name is its base,
  `/fixture-site/`.
- **The template:** the files a site starts from and keeps in step with. Planned; nothing yet.
- **The bins:** the commands a site runs from the package: `spike-html-hosting-currency`,
  `bin/currency.sh`, a shell script pnpm links, which reads the current directory. Its unit test
  puts stubs for mise, pnpm, and git first on PATH, so it reads no network.
- **The reusable workflows:** `.github/workflows/site-ci.yml` and `site-pages.yml`, on
  `workflow_call`, named apart from the SDK's own `ci.yml` and `release.yml`. GitHub reads a
  called workflow from the tag's tree, which is the pack's, so package.json's `files` lists them.
