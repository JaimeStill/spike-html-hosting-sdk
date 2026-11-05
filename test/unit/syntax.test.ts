// The highlighting, on the renderer and the syntax themes: a fence with a label Shiki bundles no
// grammar for, and one with no label, render plain, as marked renders them with no highlighter;
// the check passes each built-in and fails a pair with a rule dropped from one side, and one with
// a color dropped, and the highlighter refuses an entry that fails it, naming the palette; the
// Flexoki copy is held to its record, and the flexoki built-in carries the foundation's green, not
// Flexoki's; and, over the template's sample tree, every highlighted character's color and font
// style, in each palette and scheme, as the generated stylesheet's classes give it, is the one its
// source theme gives it alone, flexoki's the copy with the foundation's green.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { before, describe, test } from "node:test";

import { Marked } from "marked";
import type { Tokens } from "marked";
import { bundledLanguages, createHighlighter, createOnigurumaEngine } from "shiki";
import type { BundledLanguage, ThemeRegistrationAny } from "shiki";

import { checkContent } from "../../src/content.ts";
import { render } from "../../src/markdown-pages.ts";
import type { Source } from "../../src/markdown-pages.ts";
import { builtinSyntax, checkSyntax, createSyntax } from "../../src/syntax.ts";
import type { Syntax, SyntaxTheme } from "../../src/syntax.ts";

const root = join(import.meta.dirname, "../..");

const source: Source = {
  pages: new Set(["README.md"]),
  external: new Set(),
  repository: "https://github.com/owner/repo",
  ref: "0123456789abcdef0123456789abcdef01234567",
};

/** The template's sample tree, its one file. */
const sample = readFileSync(join(root, "template/content/README.md"), "utf8");

/** Flexoki's green steps the copy uses, and the foundation's hue-142° departure from each. */
const flexokiGreen = [
  ["#66800b", "#408739"],
  ["#879a39", "#61a25a"],
] as const;

/** A theme of the Flexoki copy, read from disk, with the foundation's green and every other color
 * Flexoki's own: the reference the flexoki built-in is held to. */
const flexokiSource = (scheme: "Light" | "Dark"): ThemeRegistrationAny => {
  let text = readFileSync(
    join(root, `src/syntax/flexoki/content/vscode/Flexoki-${scheme}-color-theme.json`),
    "utf8",
  );
  for (const [step, green] of flexokiGreen) text = text.replace(new RegExp(step, "gi"), green);
  return JSON.parse(text) as ThemeRegistrationAny;
};

/** The built-in syntax theme of the palette. */
const builtin = (palette: string): SyntaxTheme => {
  const theme = builtinSyntax.find((t) => t.palette === palette);
  assert.ok(theme, palette);
  return theme;
};

/** A VS Code theme's rule, as the copied Flexoki themes write it. */
interface Rule {
  scope?: string | string[];
  settings: { foreground?: string; fontStyle?: string };
}

/** The rule list of the Flexoki copy's light theme. */
const flexokiRules = (): Rule[] =>
  (builtin("flexoki").light as { tokenColors: Rule[] }).tokenColors;

/** The Flexoki pair as copies, its dark side's rules changed by edit. */
function flexokiWith(palette: string, edit: (rules: Rule[]) => void): SyntaxTheme {
  const { light, dark } = builtin("flexoki");
  const changed = structuredClone(dark) as { tokenColors: Rule[] };
  edit(changed.tokenColors);
  return { palette, light: structuredClone(light), dark: changed as ThemeRegistrationAny };
}

/** Each fence's code and label, in document order. */
function fences(text: string): { code: string; lang: string }[] {
  const marked = new Marked();
  const found: { code: string; lang: string }[] = [];
  marked.walkTokens(marked.lexer(text), (token) => {
    if (token.type === "code") {
      const { text: code, lang } = token as Tokens.Code;
      found.push({ code, lang: /^\S*/.exec(lang ?? "")?.[0] ?? "" });
    }
  });
  return found;
}

/** A character's color and font style flags (Shiki's: 1 italic, 2 bold, 4 underline, 8
 * strikethrough), as one string. */
const look = (color: string, fontStyle: number): string =>
  `${color.toLowerCase()} ${Math.max(fontStyle, 0)}`;

/** Decodes the text of a highlighted token. */
const decode = (html: string): string =>
  html
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

/** Each class's custom properties, as the stylesheet holds them. */
function classes(stylesheet: string): Map<string, Map<string, string>> {
  const found = new Map<string, Map<string, string>>();
  for (const [, name, body] of stylesheet.matchAll(/^\s*\.(\S+) \{ ([^}]*) \}$/gm)) {
    found.set(
      name,
      new Map(
        body.split(";").map((declaration) => {
          const colon = declaration.indexOf(":");
          return [declaration.slice(0, colon), declaration.slice(colon + 1)];
        }),
      ),
    );
  }
  return found;
}

/** The value a light-dark() pair, or a lone color, takes in the scheme. */
function inScheme(value: string, scheme: "light" | "dark"): string {
  const pair = /^light-dark\((.*), (.*)\)$/.exec(value);
  if (!pair) return value;
  return scheme === "light" ? pair[1] : pair[2];
}

/** A palette's font style flags, from a class's properties. */
function fontStyle(properties: Map<string, string>, palette: string): number {
  const get = (property: string) => properties.get(`--shiki-${palette}-${property}`) ?? "";
  let flags = 0;
  if (get("font-style") === "italic") flags |= 1;
  if (get("font-weight") === "bold") flags |= 2;
  if (get("text-decoration").includes("underline")) flags |= 4;
  if (get("text-decoration").includes("line-through")) flags |= 8;
  return flags;
}

describe("the highlighting", () => {
  let syntax: Syntax;

  before(async () => {
    syntax = await createSyntax(
      builtinSyntax,
      [...fences(sample).map((f) => f.lang), "go", "nosuchlang"].filter(Boolean),
    );
  });

  test("render a fence with a label Shiki doesn't bundle, or with none, plain", () => {
    const text = "# T\n\n```nosuchlang\nx < y\n```\n\n```\nplain\n```\n\n    indented\n";
    const plain = render("README.md", text, source).html;
    assert.equal(render("README.md", text, source, syntax.highlight).html, plain);
    assert.match(plain, /<pre><code class="language-nosuchlang">x &lt; y\n<\/code><\/pre>/);
    // A label Shiki bundles is highlighted on the same page.
    const highlighted = render(
      "README.md",
      "# T\n\n```Go\nfunc f() {}\n```\n",
      source,
      syntax.highlight,
    );
    assert.match(highlighted.html, /^<h1 id="t">T<\/h1>\n<pre class="shiki [^"]*" tabindex="0">/);
  });

  test("drop Shiki's inline background and color, so the foundation's pre styles the block", () => {
    const { html } = render(
      "README.md",
      "# T\n\n```go\nfunc f() {}\n```\n",
      source,
      syntax.highlight,
    );
    const pre = /<pre[^>]*>/.exec(html)?.[0] ?? "";
    assert.doesNotMatch(pre, /style=/);
    assert.doesNotMatch(pre, /__shiki_/);
  });

  // That the built-ins cover the foundation's palettes is the palette check's, in the browser
  // tier, which holds every palette the registry lists to its syntax theme.
  test("pass the check for each built-in", async () => {
    for (const theme of builtinSyntax)
      assert.deepEqual(await checkSyntax(theme), [], theme.palette);
  });

  test("fail a pair with a rule dropped from one side, or a color", async () => {
    const dropped = flexokiWith("dropped", (rules) => rules.splice(5, 1));
    const count = flexokiRules().length;
    assert.deepEqual(await checkSyntax(dropped), [
      `dropped: light holds ${count} rules and dark ${count - 1}`,
      `dropped: rule 5 (${JSON.stringify(flexokiRules()[5].scope)}) in ` +
        `light is rule 5 (${JSON.stringify(flexokiRules()[6].scope)}) in dark`,
    ]);
    const uncolored = flexokiWith("uncolored", (rules) => {
      const rule = rules.find((r) => r.settings.foreground);
      assert.ok(rule);
      delete rule.settings.foreground;
    });
    const failures = await checkSyntax(uncolored);
    assert.equal(failures.length, 1, failures.join("\n"));
    assert.match(failures[0], /^uncolored: rule \d+ \(.*\) is colored in light only$/);
    const unknown = { palette: "unknown", light: "no-such-theme", dark: "github-dark" };
    assert.deepEqual(await checkSyntax(unknown as SyntaxTheme), [
      "unknown: light names no-such-theme, a theme Shiki doesn't bundle",
    ]);
  });

  test("refuse to highlight with an entry that fails the check, naming its palette", async () => {
    const dropped = flexokiWith("dropped", (rules) => rules.splice(5, 1));
    await assert.rejects(createSyntax([...builtinSyntax, dropped], []), /\n {2}dropped: light/);
    await assert.rejects(
      createSyntax([...builtinSyntax, builtin("primer")], []),
      /primer: two syntax themes name the palette/,
    );
  });

  test("carry the Flexoki copy as its record holds it", () => {
    assert.deepEqual(checkContent(join(root, "src/syntax/flexoki")), []);
  });

  test("give the flexoki built-in the foundation's green, at hue 142°, not Flexoki's", () => {
    const { light, dark } = builtin("flexoki");
    const text = JSON.stringify([light, dark]).toLowerCase();
    for (const [step, green] of flexokiGreen) {
      assert.ok(!text.includes(step), `carries ${step}`);
      assert.ok(text.includes(green), `lacks ${green}`);
    }
  });

  test("give every token, over the sample tree, its source theme's color and font style", async () => {
    const highlighted = fences(sample).filter((f) => f.lang.toLowerCase() in bundledLanguages);
    assert.ok(highlighted.length >= 10, `the sample tree holds ${highlighted.length} fences`);
    // The page as the build renders it, and the classes its tokens take, every page rendered.
    const { html } = render("README.md", sample, source, syntax.highlight);
    const styles = classes(syntax.stylesheet());
    const blocks = [
      ...html.matchAll(/<pre class="shiki[^"]*"[^>]*><code>([\s\S]*?)<\/code><\/pre>/g),
    ];
    assert.equal(blocks.length, highlighted.length);

    // Each source theme alone, by its own highlighter on the same engine: flexoki's the copy
    // read from disk with the foundation's green, so the built-in's green is held to it.
    const sources: {
      palette: string;
      scheme: "light" | "dark";
      theme: ThemeRegistrationAny | string;
    }[] = builtinSyntax.flatMap(({ palette, light, dark }) =>
      (
        [
          ["light", palette === "flexoki" ? flexokiSource("Light") : light],
          ["dark", palette === "flexoki" ? flexokiSource("Dark") : dark],
        ] as const
      ).map(([scheme, theme]) => ({
        palette,
        scheme,
        theme:
          typeof theme === "string"
            ? theme
            : { ...structuredClone(theme), name: `${palette}-${scheme}` },
      })),
    );
    const alone = await createHighlighter({
      themes: sources.map((s) => s.theme),
      langs: [...new Set(highlighted.map((f) => f.lang.toLowerCase()))],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });

    let compared = 0;
    for (const [i, { code, lang }] of highlighted.entries()) {
      // The merged output's characters, whitespace aside, each with its class.
      const merged: { char: string; properties: Map<string, string> }[] = [];
      for (const [, name, text] of blocks[i][1].matchAll(
        /<span class="([^"]+)">([^<]*)<\/span>/g,
      )) {
        if (name === "line") continue;
        const properties = styles.get(name);
        assert.ok(properties, `class ${name} is in the stylesheet`);
        for (const char of decode(text)) if (/\S/.test(char)) merged.push({ char, properties });
      }
      assert.equal(merged.map((m) => m.char).join(""), code.replace(/\s/g, ""), `fence ${i}`);

      for (const { palette, scheme, theme } of sources) {
        const name = typeof theme === "string" ? theme : (theme.name as string);
        const result = alone.codeToTokens(code, {
          lang: lang.toLowerCase() as BundledLanguage,
          theme: name,
        });
        const want: string[] = [];
        for (const line of result.tokens) {
          for (const token of line) {
            for (const char of token.content) {
              if (/\S/.test(char))
                want.push(look(token.color ?? result.fg ?? "", token.fontStyle ?? 0));
            }
          }
        }
        const got = merged.map(({ properties }) =>
          look(
            inScheme(properties.get(`--shiki-${palette}`) ?? "", scheme),
            fontStyle(properties, palette),
          ),
        );
        assert.deepEqual(got, want, `fence ${i} (${lang}) in ${palette} ${scheme}`);
        compared += got.length;
      }
    }
    assert.ok(compared > 1000, `compared ${compared} characters`);
  });
});
