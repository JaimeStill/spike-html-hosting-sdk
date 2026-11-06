import type { Plugin } from "vite";
/** Builds each page's statically loaded modules into one chunk, and marks each built page's one
 * entry script, which loads it, render-blocking; fails the build when a page holds no
 * such tag, or more than one, so a change in how Vite writes it can't pass unnoticed. */
export declare function renderBlocking(): Plugin;
