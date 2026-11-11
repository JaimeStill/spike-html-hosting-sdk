// The icon fill: every glyph marker of a page, an empty <svg data-icon="<set>/<name>"></svg>,
// replaced at build by that icon's svg from the icons layer, spike-html-hosting-icons, whose
// module <set>/<name> default-exports it as one complete svg string: 1em square, drawn in
// currentColor, aria-hidden and focusable="false". A class on the marker carries over onto the
// svg, so a site styles a glyph where it places it; any other attribute on the marker is dropped,
// the icon's own standing. The page gains the icon's markup alone, never a script.
//
// A marker whose name isn't <set>/<name>, each a run of lowercase letters, digits, and hyphens, or
// whose icon the icons layer doesn't resolve, fails the build, naming the page and the icon, and so
// does an svg holding data-icon that isn't a marker, self-closed, unquoted, or not empty, naming
// the page and its tag, so no marker reaches a built page empty. An HTML comment's text is neither
// filled nor checked, so a comment may show a marker. The icon is resolved as the site resolves
// it, from the site's root, so the build fills it from the icons layer the site installs, the
// SDK's peer.
//
// markdown-pages.ts's plugin runs the fill on every page the build writes, its rendered pages and
// a site's hand pages alike, so a site that calls markdownPages takes it with no config of its own.
var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
/** The icons layer's package, which the SDK peers and a site installs. */
export const iconsPackage = "@jaimestill/spike-html-hosting-icons";
/** An empty svg element, its attributes captured; a marker when they hold data-icon. */
const svgElement = /<svg(\s[^>]*)?>\s*<\/svg>/gi;
/** An svg's start tag holding data-icon, however written; each must open a marker. */
const iconTag = /<svg\s[^>]*?(?<=\s)data-icon(?=[\s=/>])[^>]*>/gi;
/** An HTML comment, whose text holds no marker. */
const comment = /<!--[\s\S]*?-->/g;
/** A marker's icon name, <set>/<name>. */
const iconName = /^[a-z0-9-]+\/[a-z0-9-]+$/;
/** The value of the quoted attribute name in an element's attributes, if it has one. */
const attributeValue = (attributes, name) => {
    const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`).exec(attributes);
    return match === null ? undefined : (match[1] ?? match[2]);
};
/** Loads each icon from the icons layer as the site at root resolves it, its module imported once
 * per build. */
export function siteIcons(root) {
    const require = createRequire(join(root, "package.json"));
    const loaded = new Map();
    return (icon) => {
        let svg = loaded.get(icon);
        if (svg === undefined) {
            svg = (async () => {
                const module = (await import(__rewriteRelativeImportExtension(pathToFileURL(require.resolve(`${iconsPackage}/${icon}`)).href)));
                if (typeof module.default !== "string") {
                    throw new Error(`${iconsPackage}/${icon} exports no svg string`);
                }
                return module.default;
            })();
            loaded.set(icon, svg);
        }
        return svg;
    };
}
/** The page's html, page its path as a failure names it, with every glyph marker replaced by its
 * icon's svg from load, the marker's class carried onto it; rejects on a marker whose name isn't
 * <set>/<name> or whose icon load can't give, naming the page and the icon, and on an svg holding
 * data-icon that isn't a marker, naming the page and its tag. */
export async function fillIcons(html, page, load) {
    const comments = [...html.matchAll(comment)].map(({ index, 0: text }) => [
        index,
        index + text.length,
    ]);
    const outside = ({ index }) => !comments.some(([start, end]) => index > start && index < end);
    const markers = [...html.matchAll(svgElement)].filter((marker) => outside(marker) && attributeValue(marker[1] ?? "", "data-icon") !== undefined);
    const opens = new Set(markers.map(({ index }) => index));
    for (const { index, 0: tag } of html.matchAll(iconTag)) {
        if (!opens.has(index) && outside({ index })) {
            throw new Error(`icons: ${page} holds ${tag}, which isn't an empty <svg data-icon="<set>/<name>"></svg>`);
        }
    }
    if (markers.length === 0)
        return html;
    const svgs = await Promise.all(markers.map(async ([, attributes = ""]) => {
        const icon = attributeValue(attributes, "data-icon");
        if (!iconName.test(icon)) {
            throw new Error(`icons: ${page} names the icon "${icon}", which isn't <set>/<name>`);
        }
        let svg;
        try {
            svg = await load(icon);
        }
        catch (cause) {
            throw new Error(`icons: ${page} names the icon ${icon}, which the site's ${iconsPackage} doesn't resolve`, {
                cause,
            });
        }
        const className = attributeValue(attributes, "class");
        return className === undefined ? svg : svg.replace(/^<svg/, `<svg class="${className}"`);
    }));
    // Each marker's svg in its place, from the last back, so each index still points at its marker.
    let filled = html;
    for (let i = markers.length - 1; i >= 0; i--) {
        const { index, 0: marker } = markers[i];
        filled = filled.slice(0, index) + svgs[i] + filled.slice(index + marker.length);
    }
    return filled;
}
