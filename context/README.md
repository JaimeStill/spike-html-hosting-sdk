# spike-html-hosting-sdk

spike-html-hosting-sdk is the site SDK and template of spike-html-hosting, released by tag, which a
site pins; it names no site that consumes it (principles/downward-dependencies.md). package.json's
version is the next release, which `release.yml` tags when it lands on main; the first is v0.1.0.
This context records only working knowledge the code and the README do not express.

## Capability map

- **The package:** `@jaimestill/spike-html-hosting-sdk`, the code a site builds with, released by
  tag: tsc's build of `src/` into `dist/`, which only a tag's tree carries, and the files a site
  reads as they are, copied beside it (`scripts/build.sh`). It exports the `cssModuleScripts`,
  `renderBlocking`, and `markdownPages` Vite plugins, the ESLint configuration with the leftover
  check, the content check, the tsconfig base, the Prettier configuration, the site stylesheet, and
  the browser tier a site runs: `served()`, the shell checks and the crawl, and the capture
  description and run; the README's table maps each export. vite-plugin-standard-css-modules is a
  dependency, behind `cssModuleScripts`, and so is rolldown, which the plugin imports undeclared: in
  a site's real install the plugin's virtual store directory holds only its declared packages, so it
  finds rolldown in `node_modules/.pnpm/node_modules`, pnpm's default hoist, installed there for
  Vite and the SDK alike. A site with the hoist off fails its build (the plugin falls back to
  oxc-parser, which isn't installed) unless it declares rolldown. The pack and scaffold checks can't
  show the hoist: their `link:`s put the plugin at its realpath in this repository's install, which
  holds rolldown. The SDK lints itself with its own export (`eslint.config.js` imports
  `src/eslint.ts`) and formats itself with its own Prettier configuration (`.prettierrc.json` names
  `src/prettier.json`). The sites still hold their copies until they move to the package.
- **The pack check:** `test/pack/pack.test.ts`, the check's last step: a pack of the build,
  installed into a scratch site with no network, its dependencies and peers linked from the
  repository's own install, since pnpm's offline install holds no metadata after a frozen install.
  The site imports each JS export, types its code under the tsconfig base, resolves the Prettier
  configuration, builds with the three plugins, the foundation's theme menu, and the stylesheet
  linked, lints clean, and passes the content check. It also checks the tarball carries the bin and
  the reusable workflows, and runs the bin from a second scratch site, a real `pnpm install
  --offline` of the tarball whose every dependency and peer is overridden by a `link:` to the
  repository's install, so pnpm fetches nothing and links the bin as it does for a site.
- **The fixture site:** `test/fixtures/site/`, the browser tier's site: a shell `index.html` as
  the sites write it, four Markdown pages, one linked by no other so the crawl restarts from it,
  and a `content.json`. Its `vite.config.ts` builds with the SDK's plugins from `src/`, with the
  stylesheet's package name aliased to `src/site.css`, so it needs no build of the SDK; its
  `dist/` is gitignored and outside the SDK's lint. Its package.json name is its base,
  `/fixture-site/`.
- **The template:** `template/`, the Markdown-copy site the scaffold copies, consuming the SDK by
  its exports alone. Its files hold two tokens, `{{name}}` and `{{version}}`, which keep each file
  valid as it is, and it stores its .gitignore as `gitignore`, since a pack never carries one. The
  SDK's lint, format, and type check skip it; the scaffold test checks a copy. Its sample copied
  tree is this repository's README.md at a pushed commit, which content.json records; it never
  follows README.md, so a README change leaves it as it is until it is copied again. It has no
  leftover unit test: the SDK's tests the rule, and a site's lint runs it over its own dist/.
- **The bins:** `spike-html-hosting-sdk`, `bin/new.js`, the scaffold, plain JavaScript a node
  runs from the package, named after the package so `pnpm dlx` and `npm exec`, which run the bin
  a package's unscoped name names when it has several, run it; and `spike-html-hosting-currency`,
  `bin/currency.sh`, a shell script pnpm links, which reads the current directory. The currency
  test puts stubs for mise, pnpm, and git first on PATH, so it reads no network.
- **The scaffold test:** `test/scaffold/scaffold.test.ts`, the check's last step: the scaffold
  run from the working tree into TMPDIR, its `pnpm install --lockfile-only` a stub on PATH; the
  site installed offline, its pnpm-workspace.yaml overriding each package with a link:, the SDK
  to the working tree, every other to the repository's install, its store and cache settings
  there too so the site's `pnpm exec` finds the install current; made a git repository for
  actionlint; and its own `mise run check` run, with mise trusting its config and the SDK task's
  mise variables dropped.
- **The reusable workflows:** `.github/workflows/site-ci.yml` and `site-pages.yml`, on
  `workflow_call`, named apart from the SDK's own `ci.yml` and `release.yml`. GitHub reads a
  called workflow from the tag's tree, which is the pack's, so package.json's `files` lists them.
