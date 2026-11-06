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
export declare function blob(bytes: Uint8Array): string;
/** What keeps the site at root's content/ from being the copy its content.json records, one line
 * each; none when every file is its record's, byte for byte. */
export declare function checkContent(root: string): string[];
