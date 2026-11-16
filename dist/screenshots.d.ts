import type { Description, Viewport } from "@jaimestill/spike-html-apps-tooling/screenshots.js";
export declare const WIDTHS: Viewport[];
/** The copied pages of the Markdown site at root, each its built path, every tree's, each under
 * its tree's directory, sorted by its copied file's path: content.json records them. A site with
 * hand pages lists them beside these. */
export declare function contentPages(root: string): string[];
/** The capture description of the site at root, its pages each a built path under dist/, as
 * index.html and a/b.html, in the order they're captured. */
export declare function description({ root, pages }: {
    root: string;
    pages: string[];
}): Description;
/** A capture run: its exit status, its stderr, the capture files it printed, and its TMPDIR's
 * files after, each relative to that TMPDIR. */
export interface Captured {
    status: number | null;
    stderr: string;
    printed: string[];
    left: string[];
}
/** Runs the bin, installed at or above root, on the capture file config: the index, light, to the
 * terminal, the flags after, with TMPDIR a fresh scratch directory and node's compile cache off;
 * removes the directory once it has read what the run left there. */
export declare function capture(root: string, config: string, ...flags: string[]): Captured;
/** Asserts the capture run of the site at root on config captures the index's nine states under
 * its TMPDIR and leaves nothing there. */
export declare function leavesNoCapture(root: string, config: string): void;
/** Asserts the capture run of the site at root on config, with --keep, leaves every capture file
 * it printed. */
export declare function keepsCaptures(root: string, config: string): void;
