import type { Plugin } from "vite";
/** The CSS module script rewrite as every site runs it: the layers' modules under
 * node_modules/@jaimestill/ parsed, each sheet a constructed CSSStyleSheet. A site lists it first
 * in its plugins. */
export declare function cssModuleScripts(): Plugin;
