import type { Page } from "@jaimestill/spike-html-apps-tooling/browser.js";
/** A check on a fresh page of the site whose URL under the base, as served() gives it, is site. */
export type Check = (page: Page, site: string) => Promise<void>;
/** The Theme button and T each open the theme menu, which adopts its sheet, the constructed
 * CSSStyleSheet the build made of its CSS module script, onto the document, in its layer; no
 * stylesheet is fetched for it, and its chunk loads on the first open. */
export declare const opensThemeMenu: Check;
/** Stepping each facet's row, color, space, and type, to the profile after its default sets the
 * facet's attribute on the root; every row offers more than its default, as the full entry
 * registers every built-in profile. */
export declare const stepsEachFacet: Check;
/** The page's one module script, the build's entry, is render-blocking. */
export declare const blocksRender: Check;
/** Every request the page makes, the menu's chunk on its first open included, resolves under the
 * base, and none fails or answers an error. */
export declare const requestsUnderBase: Check;
/** In a 1600px viewport, main holds its reading width, centered. */
export declare const holdsReadingWidth: Check;
/** A choice the menu never saves, stepped and then cancelled, stores nothing, and a reload shows
 * none of it: the site leaves the reader's choice to the menu's Save. */
export declare const staysUnsaved: Check;
/** The shell checks, by the name a site's test gives each. */
export declare const shell: Record<string, Check>;
/** What a crawl reached: its pages and in-site links counted, and the paths under the base of the
 * pages no link from the index reaches. */
export interface Crawled {
    pages: number;
    links: number;
    unreachable: string[];
}
/** Crawls every page of the Markdown site at root, whose URL under the base is site, from its
 * index, checking each as this module's header lists; resolves to what it reached. */
export declare function crawl(page: Page, site: string, root: string): Promise<Crawled>;
