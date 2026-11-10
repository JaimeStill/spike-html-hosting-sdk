#!/usr/bin/env bash
# spike-html-hosting-currency, the SDK's currency bin, outside the check: reports every pin of the
# site in the current directory that trails its latest release, its mise.toml tools and those of
# each mise.<env>.toml beside it, its package.json pins, and its .github/workflows/ action and
# reusable workflow pins, as
# `<file>: ITEM PIN -> LATEST`, one line each, and exits nonzero when it reports any; with
# everything current it prints nothing and exits 0. It reads the network and writes nothing. A site
# runs it from its mise run currency task, which runs in the site's root.
#
# A mise.<env>.toml, as mise.tapes.toml, is a config mise loads only under MISE_ENV=<env>: each is
# read with mise -E <env>, which merges it over mise.toml, and only the tools whose source is that
# file are reported, under its name, as mise.toml's are already reported under its own.
# mise.local.toml and a mise.<env>.local.toml are local overrides, not environments, and are not
# read as one.
#
# A package.json pin is a version, compared against the registry's latest, or a github: tag,
# github:<owner>/<repo>#vX.Y.Z (the foundation and the tooling), compared against the repository's
# highest vX.Y.Z tag in `git ls-remote --tags`, which neither the registry nor `pnpm outdated`
# knows; typescript is compared against the newest version typescript-eslint's peer range accepts,
# typescript-eslint's pin the site's own or, as a site declares none, the installed SDK's.
# A workflow's pin, an action's <owner>/<repo>[/path]@vX.Y.Z or a reusable workflow call's
# <owner>/<repo>/.github/workflows/<file>.yml@vX.Y.Z, as a site calls the SDK's site-pages.yml, is
# compared the same way, against the repository's highest plain tag. A tag trails only when that
# tag is strictly higher: a repository with no such tag, or whose highest is below the pin, has an
# unreleased pin rather than a trailing one. A pin in any other form is reported as one this
# script can't compare, so none is skipped silently.
#
# mise, pnpm, and git are each found on PATH, so test/unit/currency.test.ts stands stubs in for
# their lookups.
# Adapted from spike-html-apps (529ec52): scripts/currency.sh, without its go.mod scans and its
# consumer template, with the action pins scanned by its github: tag scan.
# Adapted from spike-html-apps-foundation (d5037b4): scripts/currency.sh, its action scan.
# Adapted from spike-html-hosting (6f1155d): scripts/currency.sh, a bin over the current directory,
# typescript-eslint's pin read from dependencies or devDependencies.
set -euo pipefail

# mise.toml's tools are read with no environment: a MISE_ENV the caller set would merge its file's
# tools into them, under mise.toml's name.
unset MISE_ENV

stale=0
report() {
  echo "$1"
  stale=1
}

# mise outdated reads each tool's latest, http:chrome-headless-shell's from its version_list_url.
# Errors only: mise warns on every run that npm's GitHub release has no assets as it falls back to
# another source for npm's latest, which would break the silence of a current tree. JSON is read
# with node, a mise pin, not jq.
# tools FILE [ENV]: reports each tool behind its latest under FILE's name: with no ENV, every tool
# mise.toml's run reads; with ENV, those of mise -E ENV's run whose source is FILE.
tools() {
  local outdated lines line
  outdated=$(MISE_LOG_LEVEL=error mise ${2:+-E "$2"} outdated --bump --local --json)
  lines=$(node -e '
    const { basename } = require("node:path");
    const [json, file] = process.argv.slice(1);
    for (const [tool, v] of Object.entries(JSON.parse(json))) {
      if (file && basename(v.source?.path ?? "") !== file) continue;
      console.log(tool + " " + v.requested + " -> " + v.bump);
    }
  ' "$outdated" "${2:+$1}")
  while read -r line; do
    [[ -z "$line" ]] || report "$1: $line"
  done <<<"$lines"
}
tools mise.toml

# Each mise.<env>.toml at the root, by its environment, the name between the dots.
shopt -s nullglob
for file in mise.*.toml; do
  env=${file#mise.}
  env=${env%.toml}
  [[ $env == local || $env == *.* ]] || tools "$file" "$env"
done
shopt -u nullglob

# behind A B: whether version A sorts strictly below version B, by version sort.
behind() {
  [[ "$1" != "$2" && "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -n 1)" == "$1" ]]
}

# latest_tag OWNER/REPO: sets latest to the repository's highest vX.Y.Z tag, or to nothing if it
# has none; only plain vX.Y.Z tags count. Each repository is listed once; latest_tag sets a
# variable rather than echoing, because a $(...) subshell would drop the cache.
declare -A latest_tags=()
latest_tag() {
  local repo=$1 refs
  if [[ -z "${latest_tags[$repo]+set}" ]]; then
    refs=$(git ls-remote --tags --refs "https://github.com/$repo.git")
    latest_tags[$repo]=$(sed -nE 's#^[0-9a-f]+\trefs/tags/(v[0-9]+\.[0-9]+\.[0-9]+)$#\1#p' <<<"$refs" |
      sort -V | tail -n 1)
  fi
  latest=${latest_tags[$repo]}
}

# tag_behind FILE ITEM REPO PIN: reports the item when its repository has a tag above the pin.
tag_behind() {
  latest_tag "$3"
  if [[ -n "$latest" ]] && behind "$4" "$latest"; then
    report "$1: $2 $4 -> $latest"
  fi
}

# Each package.json pin against its latest: a github: tag against its repository's tags, a version
# against the registry.
pins=$(node -p '
  const { dependencies, devDependencies } = require("./package.json");
  Object.entries({ ...dependencies, ...devDependencies })
    .map(([name, pin]) => name + " " + pin)
    .join("\n")
')
# typescript-eslint's pin, from either: the SDK holds it as a dependency, and a site that pins it
# as a devDependency. A site that pins none takes the installed SDK's, whose dependency it is and
# whose lint runs it, read from its package.json by path, as the SDK's exports leave that file out;
# "undefined" when neither pins it.
typescript_eslint=$(node -p '
  const pin = ({ dependencies, devDependencies }) =>
    ({ ...dependencies, ...devDependencies })["typescript-eslint"];
  let own = pin(require("./package.json"));
  if (own === undefined) {
    try {
      own = pin(require("./node_modules/@jaimestill/spike-html-hosting-sdk/package.json"));
    } catch (error) {
      if (error.code !== "MODULE_NOT_FOUND") throw error;
    }
  }
  own
')
while read -r package pin; do
  [[ -n "$package" ]] || continue
  if [[ $pin =~ ^github:([^#]+)#(v[0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    tag_behind package.json "$package" "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
    continue
  fi
  if [[ ! $pin =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    report "package.json: $package $pin -> can't compare this form of pin"
    continue
  fi
  latest=$(pnpm view "$package" version)
  # typescript is held to the newest version typescript-eslint's peer range accepts.
  if [[ $package == typescript && $typescript_eslint != undefined ]]; then
    range=$(pnpm view "typescript-eslint@$typescript_eslint" peerDependencies.typescript)
    accepted=$(pnpm view "typescript@$range" version --json)
    latest=$(node -p '[].concat(JSON.parse(process.argv[1])).join("\n")' "$accepted" |
      sort -V | tail -n 1)
  fi
  [[ $pin == "$latest" ]] || report "package.json: $package $pin -> $latest"
done <<<"$pins"

# Each action or reusable workflow a workflow uses, once, against its repository's tags: the
# repository is the pin's first two path segments.
# A site with no workflow has no pin to scan.
shopt -s nullglob
workflows=(.github/workflows/*.yml .github/workflows/*.yaml)
shopt -u nullglob
uses=""
if ((${#workflows[@]} > 0)); then
  # A uses: key alone, a step's or a job's, never one a comment shows.
  uses=$(grep -hoE '^[[:space:]]*(-[[:space:]]+)?uses:[[:space:]]*[^[:space:]]+' "${workflows[@]}" |
    sed -E 's/^.*uses:[[:space:]]*//' | sort -u || true)
fi
while read -r action; do
  [[ -n "$action" ]] || continue
  if [[ $action =~ ^([^/@]+/[^/@]+)[^@]*@(v[0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    tag_behind .github/workflows "${action%@*}" "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
  else
    report ".github/workflows: $action -> can't compare this form of pin"
  fi
done <<<"$uses"

exit "$stale"
