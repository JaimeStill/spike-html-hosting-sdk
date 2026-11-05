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
pnpm dlx github:JaimeStill/spike-html-hosting-sdk#v0.2.0 <repo> [dir]
```

or, with npm, which fetches the package's `github:` peers only when told it may:

```sh
npm exec --allow-git=all -- github:JaimeStill/spike-html-hosting-sdk#v0.2.0 <repo> [dir]
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

A site made by hand installs the package from its tag, beside its peers, each pinned exactly:

```sh
pnpm add -D --save-exact github:JaimeStill/spike-html-hosting-sdk#v0.2.0 \
  github:JaimeStill/spike-html-apps-foundation#v0.3.0 \
  github:JaimeStill/spike-html-apps-tooling#v0.3.0 \
  vite eslint
```

## The package

It ships built ES modules and their `.d.ts` declarations, never TypeScript source, and the files a
site reads as they are, each through package.json's `exports`:

| Export | What it is |
| --- | --- |
| `./css-module-scripts.js` | `cssModuleScripts()`, the Vite plugin that rewrites each CSS module script the foundation's modules hold to a constructed `CSSStyleSheet` |
| `./render-blocking.js` | `renderBlocking()`, the Vite plugin that keeps each page's entry script render-blocking |
| `./markdown-pages.js` | `markdownPages(options)`, the Vite plugin that renders a copied Markdown tree into pages, its fenced code highlighted, and its renderer |
| `./syntax.js` | `SyntaxTheme`, a palette's syntax theme; `builtinSyntax`, one for each of the foundation's palettes; `checkSyntax(theme)`, the syntax theme check; and `createSyntax(themes, langs)`, the highlighter the plugin makes |
| `./eslint.js` | `config`, a site's ESLint configuration with the leftover check, and `build`, the globs it reads as the build |
| `./content.js` | `checkContent(root)`, the content check, and `blob(bytes)`, git's blob hash |
| `./served.js` | `served(root)`, Vite's preview of a site's build under its `/<repo>/` base; `base(root)`, that base from package.json's name; and `command(root, name)`, an installed command's path |
| `./browser.js` | the browser checks, each a `Check`, `(page, site) => Promise<void>`: `shell`, the shell checks by name, each exported too; `highlightsEachPalette`, the palette check; and `crawl(page, site, root)`, the Markdown crawl |
| `./screenshots.js` | `description({ root, pages })`, the capture file's description; `contentPages(root)`, a Markdown site's pages from content.json; and `capture`, `leavesNoCapture`, and `keepsCaptures`, the capture run the browser tier makes once |
| `./tsconfig.json` | the tsconfig base a site's tsconfig.json and tsconfig.test.json extend |
| `./prettier.json` | the Prettier configuration |
| `./site.css` | the site stylesheet, its `site` layer |

Its peers are vite, eslint, and, at their `github:` tags, spike-html-apps-foundation and
spike-html-apps-tooling, which a site installs; its own dependencies are exact pins, among them
vite-plugin-standard-css-modules, which `cssModuleScripts()` configures, and rolldown, whose
`rolldown/utils` the plugin parses with and doesn't declare. A site declares neither: the plugin
finds rolldown through pnpm's default hoist, `node_modules/.pnpm/node_modules`, so a site that
turns the hoist off declares rolldown itself, at the version Vite resolves. Beside the build the
package carries its template, its bins, and its reusable workflows:

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
link it can't place; `external` lists files the source holds that aren't copied. It highlights
each fenced block at build, as the syntax themes below describe.
`renderBlocking` fails the build on a page with no entry script, or more than one.

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

- `package.json`, its name the repository's, the SDK at its tag and the peers at their pins, with
  typescript, prettier, and `@types/node`; `mise.toml`, the toolchain and the tasks:
  install, check and its steps, screenshots, and currency, the SDK's bin;
  `scripts/preflight.sh`, which runs before node_modules exists, so the site holds its copy.
- `vite.config.ts`, the SDK's three plugins and the base from the package's name; `index.html`,
  the shell, with the foundation's full page entry, its preferences and keys modules, the Theme
  button on T, and the SDK's stylesheet; the sample copied tree, `content/` and `content.json`.
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
  the crawl, and the capture on it in the pinned chrome-headless-shell, and the Noctis fixture,
  `test/fixtures/noctis/`, on which the palette check passes with its syntax theme and fails
  without it; and the scaffold test,
  which scaffolds a site into a scratch directory, installs it offline on the working tree, and
  runs the site's own check. It reads no network.
- `mise run currency`: report every pin behind its latest, with the SDK's own bin.
