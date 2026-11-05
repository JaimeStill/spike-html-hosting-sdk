// The render-blocking entry: Vite drops the entry script's blocking attribute as it rewrites the
// tag, so renderBlocking puts it back on each page's built entry. A site's page loads the
// foundation's registrations, its preferences module, which applies the reader's stored theme
// choice to the root element before first paint, and its keys module render-blocking; the build
// makes every module script of a page one entry, and this keeps that entry render-blocking, so it
// runs before first paint as they did.
// Adapted from spike-html-apps (529ec52): vite.external.config.ts, its plugins.
// Adapted from spike-html-hosting-architecture (18eaa89): vite.config.ts, its renderBlocking
// plugin, exported.
/** The built page's entry script, as Vite writes its tag, and the same tag render-blocking. */
const entryTag = '<script type="module" crossorigin src=';
const blockingTag = '<script type="module" blocking="render" crossorigin src=';
/** Marks each built page's one entry script render-blocking; fails the build when a page holds no
 * such tag, or more than one, so a change in how Vite writes it can't pass unnoticed. */
export function renderBlocking() {
    return {
        name: "site:render-blocking",
        apply: "build",
        transformIndexHtml: {
            order: "post",
            handler(page, { path }) {
                const found = page.split(entryTag).length - 1;
                if (found !== 1) {
                    throw new Error(`site: want one entry tag ${entryTag}… in ${path}, found ${found}`);
                }
                return page.replace(entryTag, blockingTag);
            },
        },
    };
}
