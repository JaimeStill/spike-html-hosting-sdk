/** The icons layer's package, which the SDK peers and a site installs. */
export declare const iconsPackage = "@jaimestill/spike-html-hosting-icons";
/** An icon's svg, by its marker's name, <set>/<name>; rejects when the icons layer has none. */
export type LoadIcon = (icon: string) => Promise<string>;
/** Loads each icon from the icons layer as the site at root resolves it, its module imported once
 * per build. */
export declare function siteIcons(root: string): LoadIcon;
/** The page's html, page its path as a failure names it, with every glyph marker replaced by its
 * icon's svg from load, the marker's class carried onto it; rejects on a marker whose name isn't
 * <set>/<name> or whose icon load can't give, naming the page and the icon, and on an svg holding
 * data-icon that isn't a marker, naming the page and its tag. */
export declare function fillIcons(html: string, page: string, load: LoadIcon): Promise<string>;
