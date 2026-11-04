#!/usr/bin/env bash
# The build: src/ into a fresh dist/. tsc emits each module's .js and .d.ts, and the files a site
# reads as they are, the stylesheet, the tsconfig base, and the Prettier configuration, which tsc
# never emits, are copied beside them.
# Adapted from spike-html-apps-tooling (c598810): scripts/build.sh, with the copied files in place of
# the bin's mode.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist
tsc -p .
cp src/site.css src/tsconfig.base.json src/prettier.json dist/
