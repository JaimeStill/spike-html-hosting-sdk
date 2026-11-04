// The copied tree's provenance: a site's content.json records the source repository, the commit the
// tree was copied at, and each copied file's git blob hash at that commit. checkContent hashes each
// file in the site's content/ as git hashes a blob, the sha1 of "blob <length>\0" and its bytes,
// and holds it to its record: an edited copy, a recorded file missing, or a file no record names is
// a mismatch, and so is a record that names its source by anything but a GitHub repository URL and
// a full commit. A site's unit tier asserts it finds none.
// Adapted from spike-html-hosting-architecture (c4deeff): test/unit/content.test.ts, its
// assertions a function that returns the mismatches, and the source's owner any GitHub owner.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

/** A site's content.json: the copied tree's source and each copied file's blob hash. */
export interface Content {
  /** The source repository's name. */
  repository: string;
  /** The source repository's URL, https://github.com/<owner>/<repository>. */
  url: string;
  /** The full commit the tree was copied at. */
  commit: string;
  /** Each copied file's git blob hash at the commit, by its path from content/. */
  files: Record<string, string>;
}

/** The git blob hash of the bytes, as `git hash-object` computes it. */
export function blob(bytes: Uint8Array): string {
  return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}

/** Every file under dir, by its path from dir, with forward slashes, sorted. */
function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .sort();
}

/** What keeps the site at root's content/ from being the copy its content.json records, one line
 * each; none when every file is its record's, byte for byte. */
export function checkContent(root: string): string[] {
  const content: Content = JSON.parse(readFileSync(join(root, "content.json"), "utf8"));
  const dir = join(root, "content");
  const problems: string[] = [];

  const repository = content.repository.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!new RegExp(`^https://github\\.com/[^/]+/${repository}$`).test(content.url)) {
    problems.push(
      `content.json's url ${content.url} isn't https://github.com/<owner>/${content.repository}`,
    );
  }
  if (!/^[0-9a-f]{40}$/.test(content.commit)) {
    problems.push(`content.json's commit ${content.commit} isn't a full commit`);
  }

  const files = listFiles(dir);
  for (const path of files) {
    if (!(path in content.files)) problems.push(`content/${path} is in no record`);
  }
  for (const [path, hash] of Object.entries(content.files)) {
    if (!files.includes(path)) {
      problems.push(`content/${path} is recorded but missing`);
      continue;
    }
    const found = blob(readFileSync(join(dir, path)));
    if (found !== hash) {
      problems.push(`content/${path}'s blob hash is ${found}, and its record ${hash}`);
    }
  }
  return problems;
}
