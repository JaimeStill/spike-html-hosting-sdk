// A site's lint: the recommended rules over the site's code, and the leftover check over its build,
// dist/, which fails on any CSS module script the build left in it. A site's build rewrites each
// one the foundation holds (cssModuleScripts, css-module-scripts.ts); one left in dist/ is an
// import no browser without CSS module scripts loads, so the page would break where they're
// unsupported. A site's eslint.config.js spreads config, which covers the files under the config's
// directory, the site's sources and its dist/. test/unit/leftover.test.ts runs it over a fixture
// of built output.
// Adapted from spike-html-apps-foundation (d5037b4): eslint.config.js, its CSS module script
// selectors turned around: the foundation requires the attribute on every .css import, and this
// refuses it on any import in the build; without its layer rules, which the site has no source
// for.
// Adapted from spike-html-hosting (cb0511c): eslint.config.js, in TypeScript, its config exported
// for a site to spread.
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
/** The code the recommended rules cover: every .js and .ts file outside the build. */
const code = ["**/*.js", "**/*.ts"];
/** The build Vite writes, which the leftover check alone reads: minified, and not the site's own
 * code, so no other rule applies to it. */
export const build = ["dist/**/*.js"];
// The attribute a CSS module script carries, type "css", by its key's name or its quoted key: in a
// declaration's attributes, and in an import()'s options, `{ with: { type: "css" } }`, whose with
// key is a name or quoted too.
const key = (name) => `:matches([key.name='${name}'], [key.value='${name}'])`;
const cssType = `${key("type")}[value.value='css']`;
const message = "A CSS module script is left in the build: the site's build rewrites each one " +
    "(cssModuleScripts), and one it missed loads in no browser without them.";
const leftovers = [
    ...["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"].map((type) => ({
        selector: `${type}:has(> ImportAttribute${cssType})`,
        message,
    })),
    {
        // Matched at the type property, inside the options: esquery's :has doesn't walk an
        // ImportExpression's options, where ESLint's traversal, which the child combinator follows,
        // does.
        selector: `ImportExpression > ObjectExpression.options > Property${key("with")} > ObjectExpression.value > Property${cssType}`,
        message,
    },
];
/** The site's lint, for its eslint.config.js to spread: the recommended rules and node's globals
 * over its code, and the leftover check over its build. */
export const config = defineConfig([
    { files: code, ignores: build, extends: [js.configs.recommended, tseslint.configs.recommended] },
    { files: code, ignores: build, languageOptions: { globals: globals.node } },
    { files: build, rules: { "no-restricted-syntax": ["error", ...leftovers] } },
]);
