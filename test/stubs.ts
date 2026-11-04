// The lookup stubs the currency bin runs against with no network, shared by the unit tier's
// currency test and the scaffold test's run of a scaffolded site's currency task: a stub for each
// of mise, pnpm, and git, written into a directory put first on PATH, that answers the lookups the
// bin makes from a table and fails on any other, so an unexpected lookup fails the run.

import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Each stubbed command's answers: its arguments, joined by spaces, to its output. */
export type Answers = Record<"mise" | "pnpm" | "git", Record<string, string>>;

/** git ls-remote --tags --refs's output for the repository's tags. */
export const tags = (...names: string[]): string =>
  names.map((name, i) => `${String(i).padStart(40, "0")}\trefs/tags/${name}\n`).join("");

/** The ls-remote lookup of the GitHub repository's tags. */
export const lsRemote = (repo: string): string =>
  `ls-remote --tags --refs https://github.com/${repo}.git`;

/** Writes a stub for each command into dir, made if missing, each answering from its table. A
 * command named in through runs the executable it names instead when its first argument is the
 * one given, as a site's currency task runs the bin through pnpm exec, the real pnpm's. */
export function writeStubs(
  dir: string,
  answers: Answers,
  through: Partial<Record<keyof Answers, { first: string; to: string }>> = {},
): void {
  mkdirSync(dir, { recursive: true });
  for (const [command, table] of Object.entries(answers)) {
    const file = join(dir, `${command}.json`);
    writeFileSync(file, JSON.stringify(table));
    const pass = through[command as keyof Answers];
    const stub = join(dir, command);
    writeFileSync(
      stub,
      "#!/usr/bin/env bash\n" +
        (pass
          ? `if [[ "\${1-}" == ${JSON.stringify(pass.first)} ]]; then ` +
            `exec ${JSON.stringify(pass.to)} "$@"; fi\n`
          : "") +
        `exec node -e '
const answers = require(process.argv[1]);
const key = process.argv.slice(2).join(" ");
if (!(key in answers)) { console.error("stub: unexpected ${command} " + key); process.exit(1); }
process.stdout.write(answers[key]);' "${file}" "$@"\n`,
    );
    chmodSync(stub, 0o755);
  }
}
