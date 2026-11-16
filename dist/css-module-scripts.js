// The CSS module script rewrite: CSS module scripts, `import sheet from "./x.css" with { type:
// "css" }`, which the foundation's theme menu uses to adopt its sheet, and which Vite doesn't
// support. vite-plugin-standard-css-modules rewrites each import carrying that attribute to a
// module whose default export is one constructed CSSStyleSheet per file; include names the
// importers it parses, the layers' modules, the only ones holding CSS module scripts. outputMode
// pins the CSSStyleSheet the menu adopts, never Lit's CSSResult, which the plugin otherwise emits
// under SSR. A site's lint fails on any CSS module script left in its dist/ (eslint.ts).
//
// The plugin is the SDK's own dependency, so a site declares neither it nor what it parses with:
// rolldown/utils, which it imports and doesn't declare. Node resolves that import from the
// plugin's own directory in the site's virtual store, node_modules/.pnpm/<plugin>/node_modules,
// which holds only the plugin's declared dependencies and peers, and then from
// node_modules/.pnpm/node_modules, where pnpm's default hoist (hoist-pattern "*") links every
// package installed for the site. rolldown is installed for Vite, which depends on it, and for
// this package, which depends on it exactly at the version Vite resolves, so the hoist holds it.
// A site whose pnpm settings turn the hoist off would have to declare rolldown itself.
// Adapted from spike-html-apps (529ec52): vite.config.ts, its standardCssModules configuration and
// the comment on it.
// Adapted from spike-html-hosting (cb0511c): vite.config.ts, its CSS module script plugin.
// Adapted from spike-html-hosting-architecture (27d70e1): vite.config.ts, its CSS module script
// plugin, exported.
import { standardCssModules } from "vite-plugin-standard-css-modules";
/** The CSS module script rewrite as every site runs it: the layers' modules under
 * node_modules/@jaimestill/ parsed, each sheet a constructed CSSStyleSheet. A site lists it first
 * in its plugins. */
export function cssModuleScripts() {
    // The plugin declares its return as any.
    const plugin = standardCssModules({
        include: ["**/node_modules/@jaimestill/**/*.js"],
        outputMode: "CSSStyleSheet",
    });
    return plugin;
}
