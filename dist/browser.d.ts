import type { Page } from "@jaimestill/spike-html-apps-tooling/browser.js";
/** A check on a fresh page of the site whose URL under the base, as served() gives it, is site:
 * the page at url, a URL under site, site itself, its index, when none is given. */
export type Check = (page: Page, site: string, url?: string) => Promise<void>;
/** The Settings button and S each open the Settings dialog, its sl-settings rendered and its color
 * row focused, and Escape closes it; the settings' shadow root adopts its sheets, the constructed
 * CSSStyleSheets the build made of their CSS module scripts, the foundation's theme-menu.css in
 * its layer among them, and no stylesheet is fetched for them. */
export declare const opensSettings: Check;
/** Stepping each facet's row of the settings, color, space, and type, to the profile after its
 * default sets the facet's attribute on the root at once, with no Save; every row offers more
 * than its default, as the full entry registers every built-in profile. The choice is forgotten
 * after. */
export declare const stepsEachFacet: Check;
/** The page's one module script, the build's entry, is render-blocking. */
export declare const blocksRender: Check;
/** Once the page loads, every element on it whose name holds a hyphen is defined: a shell that
 * fails to load a component's module leaves its element undefined, named. */
export declare const definesEveryElement: Check;
/** Every request the page makes, with its Settings and Help dialogs opened, resolves under the
 * base, and none fails or answers an error; and the foundation's theme-menu.js and keys-help.js,
 * which the settings and the shortcuts list stand in for, are never requested. */
export declare const requestsUnderBase: Check;
/** In a 1600px viewport, main holds its reading width, centered. */
export declare const holdsReadingWidth: Check;
/** Between the layout's docks, main is centered on a page with no section tree, and the tree is
 * docked beside it on a page with one. */
export declare const holdsBetweenDocks: Check;
/** On a page with a section tree, the tree is in the Contents drawer: a column docked beside main
 * from the layout's tree dock, J and K moving through its sections, the Contents button hidden,
 * and below it a closed drawer, which the Contents button opens by its click and by C and
 * following a link in it closes. A page with none has no drawer and shows no Contents button. */
export declare const placesSectionTree: Check;
/** At 390px, between the docks, and at 1600px, main starts directly under the header, however
 * short the page. */
export declare const startsUnderHeader: Check;
/** ? opens Help, its title heading focused and its Close's hint closed, Tab moving to Close, listing
 * exactly the page's bindings, Escape closes it, returning focus, and the character-key switch in
 * the Settings dialog turns them off and on again. */
export declare const opensKeysHelp: Check;
/** Each dialog a keyed show-modal opener opens follows the components' shortcut dialog pattern: a
 * name from a heading inside it, a Close showing Esc, the two in its header row, a
 * header.dialog-header, and an opener that shows its key and has a name its interest hint shows;
 * it fails naming each dialog and what it lacks. */
export declare const followsShortcutDialogs: Check;
/** Each header button, Pages and Contents where the shell has them, Help, and Settings, and each
 * shortcut dialog's Close, shows its glyph and its key hint, and no word, named by its
 * aria-label. */
export declare const showsGlyphs: Check;
/** Every glyph button the page renders, and each shortcut dialog's, its Close among them, with the
 * dialog open, is at least 24 CSS px a side, at each capture width, 390px, 1120px, and 1376px, in
 * every space and every type profile the foundation's registry lists. */
export declare const hasTargetSize: Check;
/** At 390px, 40rem, 1120px, and 1376px, the header's buttons share one line: below 40rem on their
 * own row under the site nav, which keeps its links on one line, at its inline start, and from
 * 40rem on the site nav's first line, at the header's inline end; and at 390px nothing scrolls
 * sideways. */
export declare const keepsHeaderRow: Check;
/** In a 390px viewport, nothing on the page scrolls sideways. */
export declare const fitsNarrowWidth: Check;
/** At a phone's width, a px below and at each of the layout's docks, and at 1400px, no navigation
 * link breaks inside a word, and every docked side column is at least 16rem wide. */
export declare const keepsNavigationWords: Check;
/** A change in the settings is stored at once, with no Save: stepping the color row stores the
 * new palette while the dialog is open, closing it by Escape keeps it, and a reload applies it.
 * Nothing is stored before, and the choice is forgotten after. */
export declare const storesAtOnce: Check;
/**
 * The page's highlighted code, its .shiki blocks, takes each registered palette's syntax theme: for
 * each palette profiles("color") lists, the color row of the settings in the Settings dialog,
 * opened by S, which lists the same, is stepped to it, and its scheme row to light and then to
 * dark; in each, every token carrying the palette's --shiki-<palette> variable renders the color
 * the variable resolves to there, and some token's color differs from the page's text color. It
 * fails naming the palette and the scheme for a registered palette whose code renders plain: no
 * token carries a color for it, as on a build with no syntax theme for it, or a token keeps the
 * page's text color, as where no rule selects the palette's. It runs on url, a page with
 * highlighted code, which a site's test gives, or on site, its index, when the index holds some.
 * The dialog is closed after, and the choice, which each step stored at once, forgotten.
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
