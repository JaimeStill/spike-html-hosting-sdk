// The content check, src/content.ts's checkContent, on scratch sites in TMPDIR, removed after: each
// a content/ tree beside a content.json whose blob hashes `git hash-object` computed, so the
// check's hash is held to git's own. It finds nothing in a faithful copy, and finds an edited copy,
// a recorded file missing, a file no record names, and a source named by anything but a GitHub
// repository URL and a full commit. A record of several trees holds each under content/ in its
// directory, its repository's name with a leading dot dropped: the check finds nothing in a
// faithful copy of two, and finds each mismatch naming the tree's directory or its repository, a
// file outside every tree's directory, and two trees that share one; the site's copied files are
// listed by their paths under content/, every tree's.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, test } from "node:test";

import { checkContent, copiedFiles, treeDir } from "../../src/content.ts";
import type { Content, Tree } from "../../src/content.ts";

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

/** A tree's record from the repository named, its files tree's, copied under content/dir/, each
 * one's blob hash as `git hash-object` computes it. */
function copy(root: string, repository: string, dir: string): Tree {
  const record: Tree = {
    repository,
    url: `https://github.com/owner/${repository}`,
    commit: "0123456789abcdef0123456789abcdef01234567",
    files: {},
  };
  for (const [path, text] of Object.entries(tree)) {
    const file = join(root, "content", dir, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
    record.files[path] = execFileSync("git", ["hash-object", file], { encoding: "utf8" }).trim();
  }
  return record;
}

/** A scratch site: tree's files under content/, and a content.json recording each one's blob hash,
 * with change applied to the record before it is written. */
function site(change: (content: Tree) => void = () => {}): string {
  const root = mkdtempSync(join(tmpdir(), "content-"));
  scratches.push(root);
  const content = copy(root, "source", "");
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

/** A scratch site of two trees, tree's files copied from .github under content/github/ and from
 * org under content/org/, with change applied to the record before it is written. */
function trees(change: (content: { trees: Tree[] }) => void = () => {}): string {
  const root = mkdtempSync(join(tmpdir(), "content-"));
  scratches.push(root);
  const content = { trees: [copy(root, ".github", "github"), copy(root, "org", "org")] };
  change(content);
  writeFileSync(join(root, "content.json"), JSON.stringify(content satisfies Content, null, 2));
  return root;
}

describe("the content check on several trees", () => {
  test("places each tree under its repository's name, a leading dot dropped", () => {
    assert.equal(treeDir(".github"), "github");
    assert.equal(treeDir("org"), "org");
    assert.deepEqual(copiedFiles(trees()), [
      "github/README.md",
      "github/a.md",
      "github/dir/b.md",
      "org/README.md",
      "org/a.md",
      "org/dir/b.md",
    ]);
  });

  test("finds nothing in a copy that is every tree's records, byte for byte", () => {
    assert.deepEqual(checkContent(trees()), []);
  });

  test("fails on each tree's mismatch, naming its directory or its repository", () => {
    const root = trees((content) => {
      content.trees[0].commit = "0123456";
      content.trees[1].url = "https://github.com/owner/other";
    });
    writeFileSync(join(root, "content", "org/dir/b.md"), tree["dir/b.md"].replace("B", "C"));
    rmSync(join(root, "content", "github/a.md"));
    const problems = checkContent(root);
    assert.equal(problems.length, 4, problems.join("\n"));
    assert.equal(problems[0], "content.json's .github commit 0123456 isn't a full commit");
    assert.equal(problems[1], "content/github/a.md is recorded but missing");
    assert.equal(
      problems[2],
      "content.json's org url https://github.com/owner/other isn't https://github.com/<owner>/org",
    );
    assert.match(
      problems[3],
      /^content\/org\/dir\/b\.md's blob hash is [0-9a-f]{40}, and its record /,
    );
  });

  test("fails on a file outside every tree's directory, or in no tree's record", () => {
    const root = trees();
    writeFileSync(join(root, "content", "loose.md"), "# Loose\n");
    writeFileSync(join(root, "content", "org/extra.md"), "# Extra\n");
    assert.deepEqual(checkContent(root), [
      "content/loose.md is in no record",
      "content/org/extra.md is in no record",
    ]);
  });

  test("fails on two trees that share a directory", () => {
    const root = trees((content) => {
      content.trees[1] = {
        ...content.trees[0],
        repository: "github",
        url: "https://github.com/other/github",
      };
    });
    // The second tree's record replaced, so org's copy is in no record.
    assert.deepEqual(checkContent(root), [
      "content.json's .github and github share content/github/",
      "content/org/README.md is in no record",
      "content/org/a.md is in no record",
      "content/org/dir/b.md is in no record",
    ]);
  });
});
