import type { Page } from "@jaimestill/spike-html-apps-tooling/browser.js";
/** A check on a fresh page of the site whose URL under the base, as served() gives it, is site:
 * the page at url, a URL under site, site itself, its index, when none is given. */
export type Check = (page: Page, site: string, url?: string) => Promise<void>;
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
/** Once the page loads, every element on it whose name holds a hyphen is defined: a shell that
 * fails to load a component's module leaves its element undefined, named. */
export declare const definesEveryElement: Check;
/** Every request the page makes, the menu's chunk on its first open included, resolves under the
 * base, and none fails or answers an error. */
export declare const requestsUnderBase: Check;
/** In a 1600px viewport, main holds its reading width, centered. */
export declare const holdsReadingWidth: Check;
/** Between the layout's docks, main is centered on a page with no section tree, and the tree is
 * docked beside it on a page with one. */
export declare const holdsBetweenDocks: Check;
/** At 390px, between the docks, and at 1600px, main starts directly under the header, however
 * short the page. */
export declare const startsUnderHeader: Check;
/** ? opens the keys help dialog, listing the page's bindings, whose character-key switch turns
 * them off and on again. */
export declare const opensKeysHelp: Check;
/** In a 390px viewport, nothing on the page scrolls sideways. */
export declare const fitsNarrowWidth: Check;
/** At a phone's width, a px below and at each of the layout's docks, and at 1400px, no navigation
 * link breaks inside a word, and every docked side column is at least 16rem wide. */
export declare const keepsNavigationWords: Check;
/** A choice the menu never saves, stepped and then cancelled, stores nothing, and a reload shows
 * none of it: the site leaves the reader's choice to the menu's Save. */
export declare const staysUnsaved: Check;
/**
 * The page's highlighted code, its .shiki blocks, takes each registered palette's syntax theme:
 * for each palette profiles("color") lists, the theme menu's color row, which lists the same, is
 * stepped to it, and its scheme row to light and then to dark; in each, every token carrying the
 * palette's --shiki-<palette> variable renders the color the variable resolves to there, and some
 * token's color differs from the page's text color. It fails naming the palette and the scheme for
 * a registered palette whose code renders plain: no token carries a color for it, as on a build
 * with no syntax theme for it, or a token keeps the page's text color, as where no rule selects the
 * palette's. It runs on url, a page with highlighted code, which a site's test gives, or on site,
 * its index, when the index holds some. The menu is cancelled after, so nothing is stored.
 */
export declare const highlightsEachPalette: Check;
/** The shell checks, by the name a site's test gives each. */
export declare const shell: Record<string, Check>;
/** What a crawl reached: its pages, the hand pages among them, and in-site links counted; the
 * paths under the base of the copied pages no link from the index reaches; and those of the hand
 * pages it reached, in the order it reached them. */
export interface Crawled {
    pages: number;
    links: number;
    unreachable: string[];
    hand: string[];
}
/** Crawls every copied page of the Markdown site at root, whose URL under the base is site, from
 * its index, checking each as this module's header lists, and loading each hand page it reaches;
 * resolves to what it reached. */
export declare function crawl(page: Page, site: string, root: string): Promise<Crawled>;
