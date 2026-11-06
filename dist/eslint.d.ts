import type { Config } from "eslint/config";
/** The build Vite writes, which the leftover check alone reads: minified, and not the site's own
 * code, so no other rule applies to it. */
export declare const build: string[];
/** The site's lint, for its eslint.config.js to spread: the recommended rules and node's globals
 * over its code, and the leftover check over its build. */
export declare const config: Config[];
