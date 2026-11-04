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
  check, the tsconfig base, the Prettier configuration, and the site stylesheet; the README's
  table maps each export. The SDK lints itself with its own export (`eslint.config.js` imports
  `src/eslint.ts`) and formats itself with its own Prettier configuration (`.prettierrc.json`
  names `src/prettier.json`). The sites still hold their copies until they move to the package.
- **The pack check:** `test/pack/pack.test.ts`, the check's last step: a pack of the build,
  installed into a scratch site with no network, its dependencies and peers linked from the
  repository's own install, since pnpm's offline install holds no metadata after a frozen install.
  The site imports each JS export, types its code under the tsconfig base, resolves the Prettier
  configuration, builds with both plugins and the stylesheet linked, lints clean, and passes the
  content check.
- **The template:** the files a site starts from and keeps in step with. Planned; nothing yet.
- **The bins:** the commands a site runs from the package, currency first. Planned;
  `scripts/currency.sh` is the root's, copied, until it becomes a bin.
