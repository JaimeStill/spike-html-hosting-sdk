import type { Server } from "@jaimestill/spike-html-apps-tooling/server.js";
/** The path Pages serves the site at root under, /<name>/, its name package.json's. */
export declare function base(root: string): string;
/** The installed command's path, found as a package manager's exec finds it: in node_modules/.bin
 * of root or of the nearest directory above it that holds it. */
export declare function command(root: string, name: string): string;
/**
 * Starts Vite's preview of the build of the site at root and resolves once the site answers; its
 * origin is the site's URL under the base, http://127.0.0.1:<port>/<repository>/, which every
 * page path resolves against, and stop ends the preview's process group. Vite reads the site's
 * vite.config.ts and dist/ from root; the host and the port are set here, so the site's config
 * needn't name them.
 */
export declare function served(root: string): Promise<Server>;
