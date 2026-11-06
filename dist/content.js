// The copied trees' provenance: a site's content.json records, for each tree it copies, the source
// repository, the commit the tree was copied at, and each copied file's git blob hash at that
// commit. A record naming one source, as a site copying one tree writes it, holds that tree at
// content/'s root; a record of several, { "trees": [...] }, holds each tree under content/ in a
// directory named for its source repository: the repository's name with a leading dot dropped, so
// standards-lab/.github's files sit under content/github/ and standards-lab/org's under
// content/org/. That directory is the tree's under the site's base too, as markdown-pages.ts builds
// it, so each file's path under content/ is its page's path, and its path in the record its source
// path. checkContent hashes each file in the site's content/ as git hashes a blob, the sha1 of
// "blob <length>\0" and its bytes, and holds it to its record: an edited copy, a recorded file
// missing, or a file no record names is a mismatch, and so is a record that names its source by
// anything but a GitHub repository URL and a full commit, or two trees that share a directory. A
// site's unit tier asserts it finds none.
// Adapted from spike-html-hosting-architecture (c4deeff): test/unit/content.test.ts, its
// assertions a function that returns the mismatches, and the source's owner any GitHub owner.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";
/** The directory a tree from the repository named sits in: its name with a leading dot dropped,
 * so .github is github, as a directory under the base with no leading dot is never hidden. */
export function treeDir(repository) {
    return repository.replace(/^\./, "");
}
/** Each tree the record holds, placed: a single-source record's one tree at content/'s root,
 * several trees' each in its directory. */
function placed(content) {
    if ("trees" in content)
        return content.trees.map((tree) => ({ ...tree, dir: treeDir(tree.repository) }));
    return [{ ...content, dir: "" }];
}
/** The site at root's content.json, its trees placed. */
function readContent(root) {
    return placed(JSON.parse(readFileSync(join(root, "content.json"), "utf8")));
}
/** Every copied file the site at root records, by its path under content/, which is its page's
 * path under the base before pageFile turns it into the page's file, sorted. */
export function copiedFiles(root) {
    return readContent(root)
        .flatMap(({ dir, files }) => Object.keys(files).map((path) => posix.join(dir, path)))
        .sort();
}
/** The git blob hash of the bytes, as `git hash-object` computes it. */
export function blob(bytes) {
    return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}
/** Every file under dir, by its path from dir, with forward slashes, sorted. */
function listFiles(dir) {
    if (!existsSync(dir))
        return [];
    return readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join("/"))
        .sort();
}
/** What keeps the site at root's content/ from being the copy its content.json records, one line
 * each; none when every file is its record's, byte for byte. */
export function checkContent(root) {
    const trees = readContent(root);
    const dir = join(root, "content");
    const problems = [];
    const files = listFiles(dir);
    /** Each file under content/ some tree's record names. */
    const recorded = new Set();
    /** Each tree's directory, to the repository whose tree took it first. */
    const dirs = new Map();
    for (const tree of trees) {
        // A single-source record's messages are the record's own; several trees' name the tree.
        const record = tree.dir === "" ? "content.json's" : `content.json's ${tree.repository}`;
        const repository = tree.repository.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (!new RegExp(`^https://github\\.com/[^/]+/${repository}$`).test(tree.url)) {
            problems.push(`${record} url ${tree.url} isn't https://github.com/<owner>/${tree.repository}`);
        }
        if (!/^[0-9a-f]{40}$/.test(tree.commit)) {
            problems.push(`${record} commit ${tree.commit} isn't a full commit`);
        }
        const other = dirs.get(tree.dir);
        if (other !== undefined) {
            problems.push(`content.json's ${other} and ${tree.repository} share content/${tree.dir}/`);
        }
        dirs.set(tree.dir, tree.repository);
        for (const [source, hash] of Object.entries(tree.files)) {
            const path = posix.join(tree.dir, source);
            recorded.add(path);
            if (!files.includes(path)) {
                problems.push(`content/${path} is recorded but missing`);
                continue;
            }
            const found = blob(readFileSync(join(dir, path)));
            if (found !== hash) {
                problems.push(`content/${path}'s blob hash is ${found}, and its record ${hash}`);
            }
        }
    }
    for (const path of files) {
        if (!recorded.has(path))
            problems.push(`content/${path} is in no record`);
    }
    return problems;
}
