import type { Plugin } from "vite";
/** The copied tree and its source, as the plugin is configured. */
export interface Options {
    /** The directory, under the root, holding the copied Markdown files. */
    dir: string;
    /** The source repository's URL, as GitHub serves it: https://github.com/<owner>/<repo>. */
    repository: string;
    /** The full commit the files were copied at, which every blob URL pins. */
    ref: string;
    /** Paths, relative to the copied tree's root, that exist in the source at the commit and aren't
     * copied: a link to one is rewritten to its blob URL. */
    external?: string[];
    /** The shell each page fills, under the root: one <title> and one empty <main></main>. */
    shell?: string;
}
/** What a page's links are placed against: the copied files and the source. */
export interface Source {
    pages: ReadonlySet<string>;
    external: ReadonlySet<string>;
    repository: string;
    ref: string;
}
/** A rendered file: its front matter, null when it has none, its title, and its body's HTML. */
export interface Rendered {
    data: Record<string, unknown> | null;
    title: string;
    html: string;
}
/** The page a copied file builds to, under the root: x.md is x.html, and dir/README.md is
 * dir/index.html. */
export declare function pageFile(path: string): string;
/** The URL of the copied file to's page, relative to the page of the copied file from: a
 * directory's index is its directory, with its trailing slash. */
export declare function pageUrl(from: string, to: string): string;
/** Renders the copied file at path, its text given, with its links placed against source; throws
 * when the file has neither a front matter name nor an h1 to title it. */
export declare function render(path: string, text: string, source: Source): Rendered;
/** The page's front matter as its table, ahead of its body: nothing for a file with none, or with
 * an empty one. */
export declare function frontMatterTable(data: Rendered["data"]): string;
/** The plugin: every copied file under options.dir a page of the build, loaded from its id, the
 * page's path under the root. */
export declare function markdownPages(options: Options): Plugin;
