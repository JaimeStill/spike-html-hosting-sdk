# spike-html-hosting-sdk

The site SDK and template of spike-html-hosting, published as `@jaimestill/spike-html-hosting-sdk`.
It holds what the spike's three GitHub Pages sites consume by tag: the package they build with,
and, planned, the template they start from and the bins they run.

package.json's version stays `0.0.0`, which the release workflow never tags, until the first
release, v0.1.0.

## The package

It ships built ES modules and their `.d.ts` declarations, never TypeScript source, and the files a
site reads as they are, each through package.json's `exports`:

| Export | What it is |
| --- | --- |
| `./render-blocking.js` | `renderBlocking()`, the Vite plugin that keeps each page's entry script render-blocking |
| `./markdown-pages.js` | `markdownPages(options)`, the Vite plugin that renders a copied Markdown tree into pages, and its renderer |
| `./eslint.js` | `config`, a site's ESLint configuration with the leftover check, and `build`, the globs it reads as the build |
| `./content.js` | `checkContent(root)`, the content check, and `blob(bytes)`, git's blob hash |
| `./tsconfig.json` | the tsconfig base a site's tsconfig.json and tsconfig.test.json extend |
| `./prettier.json` | the Prettier configuration |
| `./site.css` | the site stylesheet, its `site` layer |

Its peers are vite and eslint, which a site installs; its own dependencies are exact pins.

### Use

A site's `vite.config.ts` runs both plugins, after the CSS module script rewrite:

```ts
import { markdownPages } from "@jaimestill/spike-html-hosting-sdk/markdown-pages.js";
import { renderBlocking } from "@jaimestill/spike-html-hosting-sdk/render-blocking.js";

export default defineConfig({
  plugins: [
    standardCssModules({ include: ["**/node_modules/@jaimestill/**/*.js"] }),
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

`.prettierrc.json` names the configuration as a string:

```json
"@jaimestill/spike-html-hosting-sdk/prettier.json"
```

The page links the stylesheet by the package's name, after the foundation's page entry, and Vite
resolves it through `exports` and bundles it into the page's sheet:

```html
<link rel="stylesheet" href="@jaimestill/spike-html-hosting-sdk/site.css" />
```

## Tasks

- `mise run install`: install the pinned tools and node_modules.
- `mise run check`: the check, in order: ESLint; Prettier, shellcheck, and actionlint; tsc's type
  check; the build to `dist/`; the unit tier; and the pack check, which installs a pack of the
  build into a scratch site and resolves each export from it.
- `mise run currency`: report every pin behind its latest.
