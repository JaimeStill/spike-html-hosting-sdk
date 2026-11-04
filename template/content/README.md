# spike-html-hosting-sdk

The site SDK and template of spike-html-hosting, published as `@jaimestill/spike-html-hosting-sdk`.
It holds what a GitHub Pages site consumes by tag: the template a site starts from, the package it
builds and tests with, the currency bin it runs, and the reusable workflows it calls.

Each release is a `vX.Y.Z` tag, cut by the release workflow when a version lands on main, whose
tree is the package as `pnpm pack` makes it, its build included. The first is v0.1.0.

## A new site

The scaffold bin makes a site from the template for a repository, in `<dir>`, `./<repo>` by
default, which must be new or empty:

```sh
pnpm dlx github:JaimeStill/spike-html-hosting-sdk#v0.1.0 <repo> [dir]
```

or, with npm, which fetches the package's `github:` peers only when told it may:

```sh
npm exec --allow-git=all -- github:JaimeStill/spike-html-hosting-sdk#v0.1.0 <repo> [dir]
```

It copies the template, names the site's package and its index's title after `<repo>`, whose
Pages base is `/<repo>/`, pins the SDK and calls the reusable workflows at the tag it ran from,
marks each file with the release it came from, and writes `pnpm-lock.yaml` with
`pnpm install --lockfile-only`, which reads the network. It never runs `git init`. Then, in the
site, `mise run install` and `mise run check`.

The new site's `content/` holds a sample copied tree, this README at a commit of this
repository, recorded in `content.json`; replace both with the tree the site publishes, each
file's git blob hash recorded at the source's commit, and list in `vite.config.ts`'s `external`
any file the pages link that the site doesn't copy.

## Install

A site made by hand installs the package from its tag, beside its peers, each pinned exactly:

```sh
pnpm add -D --save-exact github:JaimeStill/spike-html-hosting-sdk#v0.1.0 \
  github:JaimeStill/spike-html-apps-foundation#v0.3.0 \
  github:JaimeStill/spike-html-apps-tooling#v0.3.0 \
  vite eslint vite-plugin-standard-css-modules rolldown
```

## The package

It ships built ES modules and their `.d.ts` declarations, never TypeScript source, and the files a
site reads as they are, each through package.json's `exports`:

| Export | What it is |
| --- | --- |
| `./render-blocking.js` | `renderBlocking()`, the Vite plugin that keeps each page's entry script render-blocking |
| `./markdown-pages.js` | `markdownPages(options)`, the Vite plugin that renders a copied Markdown tree into pages, and its renderer |
| `./eslint.js` | `config`, a site's ESLint configuration with the leftover check, and `build`, the globs it reads as the build |
| `./content.js` | `checkContent(root)`, the content check, and `blob(bytes)`, git's blob hash |
| `./served.js` | `served(root)`, Vite's preview of a site's build under its `/<repo>/` base; `base(root)`, that base from package.json's name; and `command(root, name)`, an installed command's path |
| `./browser.js` | the browser checks, each a `Check`, `(page, site) => Promise<void>`: `shell`, the shell checks by name, each exported too, and `crawl(page, site, root)`, the Markdown crawl |
| `./screenshots.js` | `description({ root, pages })`, the capture file's description; `contentPages(root)`, a Markdown site's pages from content.json; and `capture`, `leavesNoCapture`, and `keepsCaptures`, the capture run the browser tier makes once |
| `./tsconfig.json` | the tsconfig base a site's tsconfig.json and tsconfig.test.json extend |
| `./prettier.json` | the Prettier configuration |
| `./site.css` | the site stylesheet, its `site` layer |

Its peers are vite, eslint, vite-plugin-standard-css-modules, which a site's `vite.config.ts`
imports itself, and, at their `github:` tags, spike-html-apps-foundation and
spike-html-apps-tooling, which a site installs; its own dependencies are exact pins. The CSS
module plugin parses with `rolldown/utils`, which it doesn't declare, so a site declares rolldown
too, at the version Vite resolves. Beside the build the package carries its template, its bins,
and its reusable workflows:

| File | What it is |
| --- | --- |
| `template/` | the site the scaffold copies |
| `bin/new.js` | `spike-html-hosting-sdk`, the scaffold bin, which `pnpm dlx` and `npm exec` run as the package's bin named after it |
| `bin/currency.sh` | `spike-html-hosting-currency`, the bin that reports every pin of the site in the current directory behind its latest |
| `.github/workflows/site-ci.yml` | the reusable workflow a site's CI calls: the check on pull requests |
| `.github/workflows/site-pages.yml` | the reusable workflow a site's Pages deploy calls: the check, then the build deployed |

### Use

A site's `vite.config.ts`, as the template's, builds under the base its package name gives, the
one `served()` serves it under, and runs both plugins after the CSS module script rewrite:

```ts
import { markdownPages } from "@jaimestill/spike-html-hosting-sdk/markdown-pages.js";
import { renderBlocking } from "@jaimestill/spike-html-hosting-sdk/render-blocking.js";
import { base } from "@jaimestill/spike-html-hosting-sdk/served.js";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: base(root),
  appType: "mpa",
  plugins: [
    standardCssModules({
      include: ["**/node_modules/@jaimestill/**/*.js"],
      outputMode: "CSSStyleSheet",
    }),
    markdownPages({ dir: "content", repository: content.url, ref: content.commit }),
    renderBlocking(),
  ],
});
```

`markdownPages` fills the site's `index.html` shell, one `<title>` and one empty `<main></main>`,
with each Markdown file under `dir`, and fails the build on a relative link it can't place;
`external` lists files the source holds that aren't copied. `renderBlocking` fails the build on a
page with no entry script, or more than one.

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

The shell checks are the theme menu opened by the Theme button and by T, with its sheet adopted;
each facet stepped and set on the root; the one render-blocking module script; every request
under the base, and none failed; main's centered reading width at 1600px; and the menu left
unsaved. A Markdown site also crawls its pages, `crawl(page, server.origin, root)`, which resolves
to the pages and links it reached and the pages no link reaches.

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

- `package.json`, its name the repository's, the SDK at its tag and the peers at their pins, with
  typescript, prettier, `@types/node`, and rolldown; `mise.toml`, the toolchain and the tasks:
  install, check and its steps, screenshots, and currency, the SDK's bin;
  `scripts/preflight.sh`, which runs before node_modules exists, so the site holds its copy.
- `vite.config.ts`, both plugins and the base from the package's name; `index.html`, the shell,
  with the foundation's full page entry, its preferences and keys modules, the Theme button on T,
  and the SDK's stylesheet; the sample copied tree, `content/` and `content.json`.
- `eslint.config.js`, `tsconfig.json`, `tsconfig.test.json`, `.prettierrc.json`, and
  `.prettierignore` on the SDK's configurations; `gitignore`, which the scaffold restores as
  `.gitignore`, since a pack never carries one.
- The tests: the content check; the shell checks and the crawl; and the capture run, on
  `scripts/screenshots.config.ts`'s description of the pages from `content.json`.
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
  the crawl, and the capture on it in the pinned chrome-headless-shell; and the scaffold test,
  which scaffolds a site into a scratch directory, installs it offline on the working tree, and
  runs the site's own check. It reads no network.
- `mise run currency`: report every pin behind its latest, with the SDK's own bin.
