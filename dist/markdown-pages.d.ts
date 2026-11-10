import type { Plugin } from "vite";
import type { SyntaxTheme } from "./syntax.ts";
/**
 * The widths from which the layout docks each side column, as the components' dock attribute
 * takes them, read in the media query (width < dock), so a viewport of exactly dock docks; site.css
 * writes the same lengths in its media queries, and the shell's Pages button's. Each is the width
 * where its columns fit at their 16rem minimum beside main's 80ch, measured in the foundation's
 * default type and regular space, with a scrollbar: the section tree alone in the end column, the
 * start one left empty so main stays as near centered as fits, from 70rem (about 69.3rem needed),
 * and the site index too, in the start column, from 86rem (about 85.3rem needed). Below index, the
 * index is the closed Pages drawer; below tree, the tree is the closed Contents drawer.
 */
export declare const docks: {
    readonly tree: "70rem";
    readonly index: "86rem";
};
/** A copied tree's source, as the plugin is configured. */
export interface TreeOptions {
    /** The source repository's URL, as GitHub serves it: https://github.com/<owner>/<repo>. */
    repository: string;
    /** The full commit the files were copied at, which every blob URL pins. */
    ref: string;
    /** Paths, relative to the copied tree's root, that exist in the source at the commit and aren't
     * copied: a link to one is rewritten to its blob URL. */
    external?: string[];
}
/** The copied trees and their sources, as the plugin is configured: one tree's source, the tree at
 * dir's root, or several, in trees, each under dir in its directory, content.ts's treeDir of its
 * repository's name. */
export type Options = {
    /** The directory, under the root, holding the copied Markdown files. */
    dir: string;
    /** The shell each page fills, under the root: one <title> and one empty <main></main>;
     * index.html by default. */
    shell?: string;
    /** The syntax themes highlighted code takes, one per palette: builtinSyntax by default, a site's
     * own appended to it, as [...builtinSyntax, theme]. With none, every fence renders plain. */
    syntax?: readonly SyntaxTheme[];
} & (TreeOptions | {
    trees: readonly TreeOptions[];
});
/** A fence's code as highlighted HTML, its language label given, or false to render it plain. */
export type Highlight = (code: string, lang: string) => string | false;
/** What a page's links are placed against: its tree's copied files and its source; dir, the
 * tree's directory under the copied root, names the page in a failure, none for a single tree. */
export interface Source {
    pages: ReadonlySet<string>;
    external: ReadonlySet<string>;
    repository: string;
    ref: string;
    dir?: string;
}
/** One of a page's h2 and h3 headings, as the section tree lists it: its depth, the id it
 * carries, and its text. */
export interface Heading {
    depth: 2 | 3;
    id: string;
    text: string;
}
/** A rendered file: its front matter, null when it has none, its title, its body's HTML, and its
 * h2 and h3 headings in document order. */
export interface Rendered {
    data: Record<string, unknown> | null;
    title: string;
    html: string;
    headings: Heading[];
}
/** The page a copied file builds to, under the root: x.md is x.html, and dir/README.md is
 * dir/index.html. */
export declare function pageFile(path: string): string;
/** The URL of the copied file to's page, relative to the page of the copied file from: a
 * directory's index is its directory, with its trailing slash. */
export declare function pageUrl(from: string, to: string): string;
/** Renders the copied file at path in source's tree, its path in the source, its text given, with
 * its links placed against source, its fences through highlight, when given, and its alerts as
 * marked-alert's callouts; throws when the file has neither a front matter name nor an h1 to title
 * it. */
export declare function render(path: string, text: string, source: Source, highlight?: Highlight): Rendered;
/** A front matter value as its meta's content: a sequence its items' text and a mapping its keys
 * and their values' text, each joined by ", ", a mapping's pair as "key: value"; null nothing; any
 * other value its text. */
export declare function frontMatterText(value: unknown): string;
/** The page's front matter as head metadata: a <meta name="<key>" content="<value>"> per key, in
 * source order, the value as frontMatterText gives it, both escaped, each on its own line; nothing
 * with no front matter, or an empty one. */
export declare function frontMatterMeta(data: Rendered["data"]): string;
/** The page's section tree in the Contents drawer: an sl-drawer docked from docks.tree, labeled
 * "Contents", its id contents, which the shell's Contents button controls, holding an
 * sl-section-tree slotting a list of the page's h2s, each linking its heading's id,
 * percent-encoded, with the h3s under it in a nested list; an h3 before any h2 stands at the top
 * level. Nothing for a page with neither. */
export declare function sectionTree(headings: readonly Heading[]): string;
/** Every copied file in the site index's order, the order its links read top to bottom: each
 * entry's page, then the pages nested under it. The pager steps through it. */
export declare function indexOrder(files: Iterable<string>): string[];
/** The page of the copied file from's site index in the Pages drawer: an sl-drawer docked from
 * docks.index, labeled "Pages", its id pages, which the shell's Pages button controls, holding an
 * sl-site-index slotting a list of every page, titles giving each copied file's title, nested by
 * directory: a page an li of its link, its text the page's title; a directory an li of its index
 * page's link, or a span of its name when it has none, then a nested list of its pages and
 * directories, by name. The root's index page is the top-level list's first entry. Each link is
 * relative to from's page, as its body's are, so it resolves under any base. */
export declare function siteIndex(titles: ReadonlyMap<string, string>, from: string): string;
/** The accessible names of a page's two pagers, at the top of its main and at its foot, each a
 * nav landmark, so a landmark list tells them apart. */
export declare const pagerLabels: {
    readonly top: "Previous and next page";
    readonly bottom: "Previous and next page, end of page";
};
/** One of the copied file from's pagers, where in its main given: a nav, named by pagerLabels,
 * linking from's neighbours in order, the site index's order, the page before it at the inline
 * start and the page after it at the inline end. Each link shows the word Previous or Next, the
 * neighbour's title, from titles, and its key hint, H or L, aria-hidden, with an arrow glyph
 * marker, which the build fills, on its outer side, before a previous link's text and after a
 * next link's hint, so each arrow points off the row's edge; it binds that key by data-keys,
 * which the foundation's keys module clicks. It has no aria-label: its name is its visible text,
 * "Previous <title>" or "Next <title>", the glyph and the hint aria-hidden, so the name holds the
 * words it shows (WCAG 2.5.3, Label in Name), and Help lists it by that text, its kbd left out.
 * Each link is relative to from's page, as the site index's are, and carries rel prev or next.
 * The first page has no previous link and the last no next, and nothing wraps; a page with
 * neither, the only one, has no pager, nor does a file that order doesn't list. */
export declare function pager(order: readonly string[], titles: ReadonlyMap<string, string>, from: string, where: keyof typeof pagerLabels): string;
/** The plugin: every copied file under options.dir a page of the build, loaded from its id, the
 * page's path under the root. */
export declare function markdownPages(options: Options): Plugin;
