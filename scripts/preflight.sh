#!/usr/bin/env bash
# Fails naming mise run install when a tool a task needs is missing: the node_modules tooling, and
# typescript-go's tsc, the pinned mise tool.
# Adapted from spike-html-apps-foundation (d5037b4): scripts/preflight.sh, without the browser
# check.
# Adapted from spike-html-hosting-components (0f64672): scripts/preflight.sh, with eslint and tsc.
set -euo pipefail

fail() {
  echo "preflight: $1 isn't installed; run mise run install" >&2
  exit 1
}

for bin in eslint prettier; do
  [[ -x node_modules/.bin/$bin ]] || fail "$bin (devDependencies)"
done
mise which tsc > /dev/null 2>&1 || fail "tsc (typescript-go, mise.toml)"
