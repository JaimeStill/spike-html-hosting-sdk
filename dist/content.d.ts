/** One copied tree's record: its source and each copied file's blob hash. */
export interface Tree {
    /** The source repository's name. */
    repository: string;
    /** The source repository's URL, https://github.com/<owner>/<repository>. */
    url: string;
    /** The full commit the tree was copied at. */
    commit: string;
    /** Each copied file's git blob hash at the commit, by its path in the source. */
    files: Record<string, string>;
}
/** A site's content.json: one tree's record, its files at content/'s root, or several trees',
 * each under content/<treeDir(repository)>/. */
export type Content = Tree | {
    trees: Tree[];
};
/** A tree as the site holds it: its record, and its directory under content/ and under the base,
 * "" for the one tree of a single-source record. */
export interface Placed extends Tree {
    dir: string;
}
/** The directory a tree from the repository named sits in: its name with a leading dot dropped,
 * so .github is github, as a directory under the base with no leading dot is never hidden. */
export declare function treeDir(repository: string): string;
/** Every copied file the site at root records, by its path under content/, which is its page's
 * path under the base before pageFile turns it into the page's file, sorted. */
export declare function copiedFiles(root: string): string[];
/** The git blob hash of the bytes, as `git hash-object` computes it. */
export declare function blob(bytes: Uint8Array): string;
/** What keeps the site at root's content/ from being the copy its content.json records, one line
 * each; none when every file is its record's, byte for byte. */
export declare function checkContent(root: string): string[];
