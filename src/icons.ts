// The icon fill: every glyph marker of a page, an empty <svg data-icon="<set>/<name>"></svg>,
// replaced at build by that icon's svg from the icons layer, spike-html-hosting-icons, whose
// module <set>/<name> default-exports it as one complete svg string: 1em square, drawn in
// currentColor, aria-hidden and focusable="false". A class on the marker carries over onto the
// svg, so a site styles a glyph where it places it; any other attribute on the marker is dropped,
// the icon's own standing. The page gains the icon's markup alone, never a script.
//
// A marker whose name isn't <set>/<name>, each a run of lowercase letters, digits, and hyphens, or
// whose icon the icons layer doesn't resolve, fails the build, naming the page and the icon, so no
// marker reaches a built page empty. The icon is resolved as the site resolves it, from the site's
// root, so the build fills it from the icons layer the site installs, the SDK's peer.
//
// markdown-pages.ts's plugin runs the fill on every page the build writes, its rendered pages and
// a site's hand pages alike, so a site that calls markdownPages takes it with no config of its own.

import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** The icons layer's package, which the SDK peers and a site installs. */
export const iconsPackage = "@jaimestill/spike-html-hosting-icons";

/** An icon's svg, by its marker's name, <set>/<name>; rejects when the icons layer has none. */
export type LoadIcon = (icon: string) => Promise<string>;

/** An empty svg element, its attributes captured; a marker when they hold data-icon. */
const svgElement = /<svg(\s[^>]*)?>\s*<\/svg>/g;

/** A marker's icon name, <set>/<name>. */
const iconName = /^[a-z0-9-]+\/[a-z0-9-]+$/;

/** The value of the double-quoted attribute name in an element's attributes, if it has one. */
const attributeValue = (attributes: string, name: string): string | undefined =>
  new RegExp(`\\s${name}="([^"]*)"`).exec(attributes)?.[1];

/** Loads each icon from the icons layer as the site at root resolves it, its module imported once
 * per build. */
export function siteIcons(root: string): LoadIcon {
  const require = createRequire(join(root, "package.json"));
  const loaded = new Map<string, Promise<string>>();
  return (icon) => {
    let svg = loaded.get(icon);
    if (svg === undefined) {
      svg = (async () => {
        const module = (await import(
          pathToFileURL(require.resolve(`${iconsPackage}/${icon}`)).href
        )) as { default: unknown };
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
 * <set>/<name> or whose icon load can't give, naming the page and the icon. */
export async function fillIcons(html: string, page: string, load: LoadIcon): Promise<string> {
  const markers = [...html.matchAll(svgElement)].filter(
    ([, attributes]) => attributeValue(attributes ?? "", "data-icon") !== undefined,
  );
  if (markers.length === 0) return html;
  const svgs = await Promise.all(
    markers.map(async ([, attributes = ""]) => {
      const icon = attributeValue(attributes, "data-icon") as string;
      if (!iconName.test(icon)) {
        throw new Error(`icons: ${page} names the icon "${icon}", which isn't <set>/<name>`);
      }
      let svg: string;
      try {
        svg = await load(icon);
      } catch (cause) {
        throw new Error(
          `icons: ${page} names the icon ${icon}, which the site's ${iconsPackage} doesn't resolve`,
          {
            cause,
          },
        );
      }
      const className = attributeValue(attributes, "class");
      return className === undefined ? svg : svg.replace(/^<svg/, `<svg class="${className}"`);
    }),
  );
  // Each marker's svg in its place, from the last back, so each index still points at its marker.
  let filled = html;
  for (let i = markers.length - 1; i >= 0; i--) {
    const { index, 0: marker } = markers[i];
    filled = filled.slice(0, index) + svgs[i] + filled.slice(index + marker.length);
  }
  return filled;
}
