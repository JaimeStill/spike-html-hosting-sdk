import type { Plugin } from "vite";
/** Marks each built page's one entry script render-blocking; fails the build when a page holds no
 * such tag, or more than one, so a change in how Vite writes it can't pass unnoticed. */
export declare function renderBlocking(): Plugin;
