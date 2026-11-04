// The content check, src/content.ts's checkContent, on scratch sites in TMPDIR, removed after:
// each a content/ tree beside a content.json whose blob hashes `git hash-object` computed, so the
// check's hash is held to git's own. It finds nothing in a faithful copy, and finds an edited copy, a
// recorded file missing, a file no record names, and a source named by anything but a GitHub
// repository URL and a full commit.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, test } from "node:test";

import { checkContent } from "../../src/content.ts";
import type { Content } from "../../src/content.ts";

const scratches: string[] = [];
after(() => {
  for (const scratch of scratches) rmSync(scratch, { recursive: true, force: true });
});

/** The copied tree every scratch site starts from, by its path from content/. */
const tree: Record<string, string> = {
  "README.md": "# The source\n\n[A](a.md)\n",
  "a.md": "# A\n",
  "dir/b.md": "---\nname: B\n---\n\nBody, with a byte beyond ASCII: é.\n",
};

/** A scratch site: tree's files under content/, and a content.json recording each one's blob hash
 * as `git hash-object` computes it, with change applied to the record before it is written. */
function site(change: (content: Content) => void = () => {}): string {
  const root = mkdtempSync(join(tmpdir(), "content-"));
  scratches.push(root);
  const content: Content = {
    repository: "source",
    url: "https://github.com/owner/source",
    commit: "0123456789abcdef0123456789abcdef01234567",
    files: {},
  };
  for (const [path, text] of Object.entries(tree)) {
    const file = join(root, "content", path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
    content.files[path] = execFileSync("git", ["hash-object", file], { encoding: "utf8" }).trim();
  }
  change(content);
  writeFileSync(join(root, "content.json"), JSON.stringify(content, null, 2));
  return root;
}

describe("the content check", () => {
  test("finds nothing in a copy that is its records, byte for byte", () => {
    assert.deepEqual(checkContent(site()), []);
  });

  test("fails on a copied file whose blob hash differs from its record", () => {
    const root = site();
    writeFileSync(join(root, "content", "dir/b.md"), tree["dir/b.md"].replace("B", "C"));
    const problems = checkContent(root);
    assert.equal(problems.length, 1, problems.join("\n"));
    assert.match(problems[0], /^content\/dir\/b\.md's blob hash is [0-9a-f]{40}, and its record /);
  });

  test("fails on a recorded file missing", () => {
    const root = site();
    rmSync(join(root, "content", "a.md"));
    assert.deepEqual(checkContent(root), ["content/a.md is recorded but missing"]);
  });

  test("fails on a file no record names", () => {
    const root = site();
    writeFileSync(join(root, "content", "dir/extra.md"), "# Extra\n");
    assert.deepEqual(checkContent(root), ["content/dir/extra.md is in no record"]);
  });

  test("fails on a source named by anything but a GitHub URL and a full commit", () => {
    const root = site((content) => {
      content.url = "https://example.com/owner/source";
      content.commit = "0123456";
    });
    assert.deepEqual(checkContent(root), [
      "content.json's url https://example.com/owner/source isn't " +
        "https://github.com/<owner>/source",
      "content.json's commit 0123456 isn't a full commit",
    ]);
  });
});
