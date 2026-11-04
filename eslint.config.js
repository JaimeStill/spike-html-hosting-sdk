// The lint the check runs: the SDK's own export, src/eslint.ts's config, the lint a site spreads,
// over the SDK's sources, tests, and scripts, which run on node, and its build, dist/, which the
// leftover check reads as it does a site's. It imports the source, which node runs under its type
// stripping, so the lint needs no build before it.
// test/unit/leftover.test.ts runs the same config over fixtures of built output. The fixture site's
// build, which the browser tier checks, is ignored: its leftover check is the browser tier's
// adopted sheet, and its minified code is no source of the SDK's.

import { defineConfig, globalIgnores } from "eslint/config";

import { config } from "./src/eslint.ts";

export default defineConfig([globalIgnores(["test/fixtures/site/dist/"]), ...config]);
