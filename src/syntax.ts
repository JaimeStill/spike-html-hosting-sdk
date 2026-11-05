// The syntax themes: the colors a Markdown page's highlighted code takes in each palette and scheme
// of the foundation's Color profile, true to the editor theme the palette comes from. A syntax
// theme is { palette, light, dark }, light and dark each the name of a theme Shiki bundles or a
// theme object, as a VS Code color theme writes one. The SDK's built-ins map each of the
// foundation's palettes to its source: primer to GitHub's light default and dark dimmed,
// catppuccin to Latte and Mocha, and everforest to its light and dark, as Shiki bundles them; and
// flexoki, which Shiki doesn't bundle, to a byte-for-byte copy of Flexoki's own VS Code themes,
// syntax/flexoki/content/, held to its record, syntax/flexoki/content.json. A site appends its own
// entry to builtinSyntax for a palette it registers.
//
// checkSyntax holds a pair to what the merge needs: light and dark hold the same rule list, in
// order, each rule's scope and font style the same, and every rule colored in one is colored in
// the other, so a token matches the same rule in both and its one font style is both schemes'.
// createSyntax refuses an entry that fails it, naming the palette, and merges each entry's pair
// into one theme whose every color is light-dark(<light>, <dark>), which Shiki passes through as
// it does a var(). A fence is highlighted under every merged theme at once, Shiki's multi-theme
// output with no default color: each token a --shiki-<palette> variable per theme, its font style
// beside it, gathered into one class per distinct style (transformerStyleToClass). The stylesheet
// holds each class's variables and, per syntax theme, one rule that selects the theme's variables
// under [data-palette="<palette>"], flexoki's also under a root with no data-palette, as the
// foundation's default. A palette with no syntax theme matches no rule, so its code is plain, in
// the page's text color. A fence whose label Shiki bundles no grammar for, or with no label,
// isn't highlighted: createSyntax's highlight gives false, and marked renders it plain.
//
// The engine is Shiki's Oniguruma, the TextMate grammars' own regex engine, which runs every
// bundled grammar as its source editor does; it runs once a build, at its start.

import { readFileSync } from "node:fs";

import { transformerStyleToClass } from "@shikijs/transformers";
import { bundledLanguages, bundledThemes, createHighlighter, createOnigurumaEngine } from "shiki";
import type { BundledLanguage, BundledTheme, ThemeRegistration, ThemeRegistrationAny } from "shiki";

/** One theme rule: the scopes it matches and the color and font style it sets. */
interface Rule {
  name?: string;
  scope?: string | string[];
  settings: { foreground?: string; background?: string; fontStyle?: string };
}

/** A palette's syntax theme: the foundation Color profile's palette name, and the theme its code
 * takes in light and in dark, each a theme Shiki bundles by its name or a theme object. */
export interface SyntaxTheme {
  palette: string;
  light: BundledTheme | ThemeRegistrationAny;
  dark: BundledTheme | ThemeRegistrationAny;
}

/** A theme object of the copied Flexoki themes, by its path from the copy's root. */
const flexokiTheme = (path: string): ThemeRegistrationAny =>
  JSON.parse(
    readFileSync(new URL(`./syntax/flexoki/content/${path}`, import.meta.url), "utf8"),
  ) as ThemeRegistrationAny;

/** The SDK's syntax themes, one for each of the foundation's palettes. */
export const builtinSyntax: readonly SyntaxTheme[] = Object.freeze([
  {
    palette: "flexoki",
    light: flexokiTheme("vscode/Flexoki-Light-color-theme.json"),
    dark: flexokiTheme("vscode/Flexoki-Dark-color-theme.json"),
  },
  { palette: "primer", light: "github-light-default", dark: "github-dark-dimmed" },
  { palette: "catppuccin", light: "catppuccin-latte", dark: "catppuccin-mocha" },
  { palette: "everforest", light: "everforest-light", dark: "everforest-dark" },
]);

/** The palette the foundation applies to a root with no data-palette. */
const defaultPalette = "flexoki";

/** A theme of the pair, resolved to its object, or the failure that keeps it from one. */
async function resolveTheme(
  theme: SyntaxTheme["light"],
  palette: string,
  scheme: string,
): Promise<ThemeRegistrationAny | string> {
  if (typeof theme !== "string") return theme;
  if (!(theme in bundledThemes)) {
    return `${palette}: ${scheme} names ${theme}, a theme Shiki doesn't bundle`;
  }
  return (await bundledThemes[theme]()).default;
}

/** A theme's rule list: tokenColors, as VS Code writes it, or settings, as a TextMate theme does. */
const rules = (theme: ThemeRegistrationAny): Rule[] =>
  ((theme as ThemeRegistration).tokenColors ?? theme.settings ?? []) as Rule[];

/** A theme's editor foreground. */
const foreground = (theme: ThemeRegistrationAny): string | undefined =>
  theme.colors?.["editor.foreground"] ?? (theme as ThemeRegistration).fg;

/** A theme's editor background. */
const background = (theme: ThemeRegistrationAny): string | undefined =>
  theme.colors?.["editor.background"] ?? (theme as ThemeRegistration).bg;

/** A rule as a failure names it: its index and its scope. */
const named = (rule: Rule, index: number): string =>
  `rule ${index} (${JSON.stringify(rule.scope ?? "no scope")})`;

/** The pair's failures, with both themes resolved. */
function checkPair(palette: string, light: ThemeRegistrationAny, dark: ThemeRegistrationAny) {
  const failures: string[] = [];
  for (const [scheme, theme] of [
    ["light", light],
    ["dark", dark],
  ] as const) {
    if (!foreground(theme)) failures.push(`${palette}: ${scheme} has no editor foreground`);
  }
  const l = rules(light);
  const d = rules(dark);
  if (l.length !== d.length) {
    failures.push(`${palette}: light holds ${l.length} rules and dark ${d.length}`);
  }
  for (let i = 0; i < Math.min(l.length, d.length); i++) {
    if (JSON.stringify(l[i].scope) !== JSON.stringify(d[i].scope)) {
      // Past the first rule out of place, every rule after it is too: one failure names it.
      failures.push(`${palette}: ${named(l[i], i)} in light is ${named(d[i], i)} in dark`);
      break;
    }
    const style = [l[i].settings.fontStyle ?? "", d[i].settings.fontStyle ?? ""];
    if (style[0] !== style[1]) {
      failures.push(
        `${palette}: ${named(l[i], i)} has font style ${JSON.stringify(style[0])} in light ` +
          `and ${JSON.stringify(style[1])} in dark`,
      );
    }
    const colored = [!!l[i].settings.foreground, !!d[i].settings.foreground];
    if (colored[0] !== colored[1]) {
      failures.push(
        `${palette}: ${named(l[i], i)} is colored in ${colored[0] ? "light" : "dark"} only`,
      );
    }
  }
  return failures;
}

/** The syntax theme's pair, resolved and checked: its failures, and the pair when there are
 * none. */
async function resolvePair(
  theme: SyntaxTheme,
): Promise<{ failures: string[]; light?: ThemeRegistrationAny; dark?: ThemeRegistrationAny }> {
  const { palette } = theme;
  if (!/^[a-z][a-z\d-]*$/.test(palette)) {
    return {
      failures: [
        `${JSON.stringify(palette)}: a palette's name is lowercase letters, digits, and -`,
      ],
    };
  }
  const light = await resolveTheme(theme.light, palette, "light");
  const dark = await resolveTheme(theme.dark, palette, "dark");
  if (typeof light === "string" || typeof dark === "string") {
    return { failures: [light, dark].filter((t) => typeof t === "string") };
  }
  const failures = checkPair(palette, light, dark);
  return failures.length > 0 ? { failures } : { failures, light, dark };
}

/** What keeps the syntax theme from merging into one light-dark() theme, one line each, naming
 * its palette: none when it merges. */
export async function checkSyntax(theme: SyntaxTheme): Promise<string[]> {
  return (await resolvePair(theme)).failures;
}

/** light-dark() of the pair's colors, either alone when the other has none. */
function pair(light: string | undefined, dark: string | undefined): string | undefined {
  if (light && dark) return `light-dark(${light}, ${dark})`;
  return light ?? dark;
}

/** The pair, which checkSyntax passes, merged into one theme named for the palette: light's rules,
 * each color light-dark() of light's and dark's. Every object is new, since Shiki rewrites the
 * themes it loads. */
function merge(
  palette: string,
  light: ThemeRegistrationAny,
  dark: ThemeRegistrationAny,
): ThemeRegistration {
  const d = rules(dark);
  const colors: Record<string, string> = {};
  const fg = pair(foreground(light), foreground(dark));
  const bg = pair(background(light), background(dark));
  if (fg) colors["editor.foreground"] = fg;
  if (bg) colors["editor.background"] = bg;
  return {
    name: palette,
    type: "light",
    colors,
    tokenColors: rules(light).map((rule, i) => {
      const settings: Rule["settings"] = {};
      const color = pair(rule.settings.foreground, d[i].settings.foreground);
      if (color) settings.foreground = color;
      if (rule.settings.fontStyle !== undefined) settings.fontStyle = rule.settings.fontStyle;
      return { scope: structuredClone(rule.scope), settings };
    }),
  };
}

/** The build's highlighter, over its syntax themes and the languages its pages label. */
export interface Syntax {
  /** The fence's code highlighted, under every syntax theme, its language label given: false for a
   * label Shiki bundles no grammar for, which marked then renders plain. */
  highlight(code: string, lang: string): string | false;
  /** The stylesheet of every class the highlighting has given a token so far, and each syntax
   * theme's rule selecting its colors and font styles by its palette. */
  stylesheet(): string;
}

/** A fence's language label, lowercased, as Shiki names its grammars. */
const label = (lang: string): string => lang.toLowerCase();

/** Whether Shiki bundles a grammar for the fence label. */
const bundles = (lang: string): boolean => label(lang) in bundledLanguages;

/** The highlighter over the syntax themes, each held to checkSyntax, and the languages, those of
 * them Shiki bundles a grammar for loaded and the rest left plain; throws on a theme that fails the
 * check, naming its palette and each failure, or on a palette two themes name. */
export async function createSyntax(
  themes: readonly SyntaxTheme[],
  langs: Iterable<string>,
): Promise<Syntax> {
  const merged: ThemeRegistration[] = [];
  const failures: string[] = [];
  const palettes = new Set<string>();
  for (const theme of themes) {
    if (palettes.has(theme.palette)) {
      failures.push(`${theme.palette}: two syntax themes name the palette`);
      continue;
    }
    palettes.add(theme.palette);
    const { failures: found, light, dark } = await resolvePair(theme);
    if (light && dark) merged.push(merge(theme.palette, light, dark));
    else failures.push(...found);
  }
  if (failures.length > 0) {
    throw new Error(`syntax: a syntax theme fails its check:\n  ${failures.join("\n  ")}`);
  }

  const loaded = new Set([...langs].map(label).filter(bundles));
  const highlighter = await createHighlighter({
    themes: merged,
    langs: [...loaded] as BundledLanguage[],
    engine: createOnigurumaEngine(import("shiki/wasm")),
  });
  const classes = transformerStyleToClass();
  const keys = Object.fromEntries(merged.map(({ name }) => [name, name])) as Record<string, string>;

  return {
    highlight(code, lang) {
      if (!loaded.has(label(lang))) return false;
      return highlighter.codeToHtml(code, {
        lang: label(lang),
        themes: keys,
        defaultColor: false,
        transformers: [
          // The foundation's pre styles the block, its border and no fill: Shiki's inline
          // background and color go before the classes are made of the styles. Its tabindex
          // stays, so a reader scrolls an overflowing block from the keyboard.
          {
            pre(node) {
              delete node.properties.style;
            },
          },
          classes,
        ],
      });
    },
    stylesheet() {
      const rules = merged.map(({ name }) => {
        const selector = `[data-palette="${name}"] .shiki span`;
        const selectors =
          name === defaultPalette
            ? `:root:not([data-palette]) .shiki span,\n  ${selector}`
            : selector;
        return (
          `  ${selectors} {\n` +
          `    color: var(--shiki-${name});\n` +
          `    font-style: var(--shiki-${name}-font-style, normal);\n` +
          `    font-weight: var(--shiki-${name}-font-weight, normal);\n` +
          `    text-decoration: var(--shiki-${name}-text-decoration, none);\n` +
          `  }\n`
        );
      });
      return (
        "/* The syntax themes' token classes, generated by the build (spike-html-hosting-sdk's\n" +
        " * markdownPages): each class's colors and font styles per palette, and a rule per\n" +
        " * syntax theme selecting them by data-palette. In the site layer, after the\n" +
        " * foundation's. */\n" +
        "@layer site {\n" +
        [...classes.getClassRegistry()]
          .map(([name, style]) => {
            const text =
              typeof style === "string"
                ? style
                : Object.entries(style)
                    .map(([key, value]) => `${key}:${value}`)
                    .join(";");
            return `  .${name} { ${text} }\n`;
          })
          .join("") +
        rules.join("") +
        "}\n"
      );
    },
  };
}
