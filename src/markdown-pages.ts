// The Markdown pages: a Vite plugin that renders every Markdown file of one directory, copied
// byte for byte from source repositories at pinned commits, into an HTML page of the build. Each
// page is a virtual .html input: the plugin loads it, the site's shell filled with the file's
// title and its rendered body, and Vite's own HTML build transforms it as it does a page on disk,
// naming its output by its path under the root. Nothing is written to the working tree.
//
// The directory holds one copied tree, from one source, at its root, or several, each from its own
// source at its own commit, in a directory named for its source repository (content.ts's treeDir:
// the name with a leading dot dropped), so standards-lab/.github's profile/README.md builds to
// github/profile/ and standards-lab/org's briefs/orientation.md to org/briefs/orientation.html. The
// trees are one site: one site index lists every page of every tree, and each page's links are
// placed against its own tree's source.
//
// A file's page is its path with .md turned to .html, except a README.md, which is its directory's
// index.html, so a single tree's root README.md is the site's index. A file's leading YAML front
// matter, when it has one, is parsed and never rendered as body text: the page carries it in its
// head, a <meta name="<key>" content="<value>"> for each key, in source order, after its title,
// each key and value escaped, the value as frontMatterText gives it, so nothing of it shows on the
// page. A key keeps its name: one naming a meta the shell already writes, as its viewport, would
// give the page two, so it fails the build, naming the file and the key. The page's title is the
// front matter's name, or, with no name, the text of the file's first h1; a file with neither fails
// the build, naming it. Headings carry GitHub's ids (marked-gfm-heading-id), so a fragment written
// against the source on GitHub resolves here. A relative link to a file copied in the linking
// file's tree is rewritten to that file's page, relative to the linking page, its fragment kept;
// one to a file listed as external, present in the source but not copied, to the file's blob on
// GitHub at the tree's pinned commit; any other relative link, one leaving its tree among them,
// fails the build, naming the page and the link, so no link is left to break. A fragment alone, or
// a URL with a scheme, passes through. A GitHub alert, a blockquote opening [!NOTE], [!TIP],
// [!IMPORTANT], [!WARNING], or [!CAUTION], renders as marked-alert renders it, as GitHub does: a
// div.markdown-alert.markdown-alert-<kind>, its first line a p.markdown-alert-title of the kind's
// octicon and its kind as visible text, "Important", which site.css draws as a callout. Each kind's
// octicon is the icons layer's (icons.ts), in place of marked-alert's own, through its variants:
// info-16 for a note, light-bulb-16 for a tip, report-16 for important, alert-16 for a warning, and
// stop-16 for caution, each an svg 1em square in currentColor, aria-hidden and focusable="false".
//
// Each page's navigation is written as the light-DOM markup the components slot, so with no script
// it renders as the page's own, after main, in two drawers, each an sl-drawer: the section tree,
// an sl-section-tree of the page's h2s, each with its h3s in a nested list, linked by the ids the
// headings carry, in the Contents drawer, or no drawer for a page with neither; then the site
// index, an sl-site-index of every copied page, nested by directory, each linked relative to the
// page, as its body's links are, in the Pages drawer. Each drawer has the id its header button
// controls, contents and pages, and docks from its width in the layout (docks), which site.css's
// media queries write too: a column beside main from there, a closed modal drawer below it. The
// drawers come after main so the reading order, and a keyboard's, is the page's body first. The
// renderer writes no aria-current: the components mark the current section and page at runtime,
// and the site nav, which takes no content, is the shell's to place, with the header's buttons.
// Each page's main opens and closes with a pager, a nav landmark linking the pages before and after
// it in the site index's order, the order its links read top to bottom, which one function gives
// both (indexOrder): the first page has no previous link, the last no next, and nothing wraps. Each
// link shows an arrow glyph, its word, Previous or Next, its page's title, and its key hint, H or
// L, which its data-keys binds, so the foundation's keys module clicks it; the two pagers' links
// bind the same keys, and the module, first in document order, fires and lists the top one's. Each
// pager is named apart from the other, so a landmark list tells them apart. A hand page, in no
// index, has no pager and binds neither key.
// Each body table is wrapped in a div.table-region, a region named by its header cells that a
// keyboard focuses, as Shiki's tabindex makes each code block, which scrolls the table sideways in
// a viewport narrower than it.
//
// Every page the build writes, each rendered page and each of a site's hand pages, has its glyph
// markers filled with their icons at build, by icons.ts's fill, and a marker the icons layer
// doesn't resolve fails the build, naming the page and the icon.
//
// Each fenced block is highlighted at build, so no script reaches the page: marked's own code
// renderer, on the page's Marked instance, renders it through the build's Shiki highlighter
// (syntax.ts), once per build at its start, over the syntax themes the plugin is given, the
// built-ins by default, and the languages the pages' fences label. A fence whose label Shiki
// bundles no grammar for, or with none, renders plain, as marked renders it. The build emits one
// stylesheet of the highlighted tokens' classes, which every page links, after the shell's own.
//
// Nothing here names a site or a source: a site imports the plugin and configures it with its
// content directory and, for its one tree, or for each of several, the source repository's URL,
// its pinned commit, and its external files.
//
// The pages are build inputs the plugin adds; a site's own inputs concatenate with them, as Vite
// merges the arrays, so a site whose index.html is a hand page, with hand pages elsewhere, lists
// each as an input, as absolute paths in an array, and names another file as the shell its
// rendered pages fill: Vite builds index.html only when no input is given, and an input names
// a page whether or not a shell fills it. The build fails on a hand input that is also a copied
// file's page, which the two would each write.
// Adapted from spike-html-hosting-architecture (59b01b2): markdown-pages.ts, imported by a site
// rather than copied into it.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, posix, resolve } from "node:path";

import alertIcon from "@jaimestill/spike-html-hosting-icons/octicon/alert-16";
import infoIcon from "@jaimestill/spike-html-hosting-icons/octicon/info-16";
import lightBulbIcon from "@jaimestill/spike-html-hosting-icons/octicon/light-bulb-16";
import reportIcon from "@jaimestill/spike-html-hosting-icons/octicon/report-16";
import stopIcon from "@jaimestill/spike-html-hosting-icons/octicon/stop-16";
import { Marked, Parser, Renderer } from "marked";
import type { Tokens } from "marked";
import markedAlert from "marked-alert";
import { getHeadingList, gfmHeadingId } from "marked-gfm-heading-id";
import { normalizePath } from "vite";
import type { Plugin } from "vite";
import { parse } from "yaml";

import { treeDir } from "./content.ts";
import { fillIcons, siteIcons } from "./icons.ts";
import type { LoadIcon } from "./icons.ts";
import { builtinSyntax, createSyntax } from "./syntax.ts";
import type { Syntax, SyntaxTheme } from "./syntax.ts";

/**
 * The widths from which the layout docks each side column, as the components' dock attribute
 * takes them, read in the media query (width < dock), so a viewport of exactly dock docks; site.css
 * writes the same lengths in its media queries, and the shell's Pages button's. Each is the width
 * where its columns fit at their 16rem minimum beside main's 80ch, measured in the foundation's
 * default type and regular space, with a scrollbar: the section tree alone in the end column, the
 * start one left empty so main stays as near centered as fits, from 70rem (about 69.3rem needed),
 * and the site index too, in the start column, from 86rem (about 85.3rem needed). Below index, the
 * index is the closed Pages drawer; below tree, the tree is the closed Contents drawer.
 */
export const docks = { tree: "70rem", index: "86rem" } as const;

/** A copied tree's source, as the plugin is configured. */
export interface TreeOptions {
  /** The source repository's URL, as GitHub serves it: https://github.com/<owner>/<repo>. */
  repository: string;
  /** The full commit the files were copied at, which every blob URL pins. */
  ref: string;
  /** Paths, relative to the copied tree's root, that exist in the source at the commit and aren't
   * copied: a link to one is rewritten to its blob URL. */
  external?: string[];
}

/** The copied trees and their sources, as the plugin is configured: one tree's source, the tree at
 * dir's root, or several, in trees, each under dir in its directory, content.ts's treeDir of its
 * repository's name. */
export type Options = {
  /** The directory, under the root, holding the copied Markdown files. */
  dir: string;
  /** The shell each page fills, under the root: one <title> and one empty <main></main>;
   * index.html by default. */
  shell?: string;
  /** The syntax themes highlighted code takes, one per palette: builtinSyntax by default, a site's
   * own appended to it, as [...builtinSyntax, theme]. With none, every fence renders plain. */
  syntax?: readonly SyntaxTheme[];
} & (TreeOptions | { trees: readonly TreeOptions[] });

/** A fence's code as highlighted HTML, its language label given, or false to render it plain. */
export type Highlight = (code: string, lang: string) => string | false;

/** What a page's links are placed against: its tree's copied files and its source; dir, the
 * tree's directory under the copied root, names the page in a failure, none for a single tree. */
export interface Source {
  pages: ReadonlySet<string>;
  external: ReadonlySet<string>;
  repository: string;
  ref: string;
  dir?: string;
}

/** The copied file at path in source's tree, by its path under the copied root, as a failure
 * names it. */
const named = (path: string, source: Source): string => posix.join(source.dir ?? "", path);

/** One of a page's h2 and h3 headings, as the section tree lists it: its depth, the id it
 * carries, and its text. */
export interface Heading {
  depth: 2 | 3;
  id: string;
  text: string;
}

/** A rendered file: its front matter, null when it has none, its title, its body's HTML, and its
 * h2 and h3 headings in document order. */
export interface Rendered {
  data: Record<string, unknown> | null;
  title: string;
  html: string;
  headings: Heading[];
}

/** The page a copied file builds to, under the root: x.md is x.html, and dir/README.md is
 * dir/index.html. */
export function pageFile(path: string): string {
  if (posix.basename(path) === "README.md") return posix.join(posix.dirname(path), "index.html");
  return path.replace(/\.md$/, ".html");
}

/** The URL of the copied file to's page, relative to the page of the copied file from: a
 * directory's index is its directory, with its trailing slash. */
export function pageUrl(from: string, to: string): string {
  const file = pageFile(to);
  const dir = posix.relative(posix.dirname(pageFile(from)), posix.dirname(file));
  if (posix.basename(file) === "index.html") return dir === "" ? "./" : `${dir}/`;
  return dir === "" ? posix.basename(file) : `${dir}/${posix.basename(file)}`;
}

/** The link href, written in the copied file path, as the page links it; throws on a relative
 * link the source can't place. */
function place(href: string, path: string, source: Source): string {
  if (href.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(href)) return href;
  const hash = href.indexOf("#");
  const target = hash < 0 ? href : href.slice(0, hash);
  const fragment = hash < 0 ? "" : href.slice(hash);
  const resolved = posix.normalize(posix.join(posix.dirname(path), target));
  if (!href.startsWith("/") && !resolved.startsWith("../")) {
    if (source.pages.has(resolved)) return pageUrl(path, resolved) + fragment;
    if (source.external.has(resolved)) {
      return `${source.repository}/blob/${source.ref}/${resolved}${fragment}`;
    }
  }
  throw new Error(
    `markdown-pages: ${named(path, source)} links ${href}, which is neither a copied file nor a listed ` +
      `external one; copy it, or list it external if the source holds it at ${source.ref}`,
  );
}

/** The file's leading front matter, parsed, null when it has none, and its body after it; throws
 * when the front matter isn't a mapping, or holds a name that isn't a string. */
function frontMatter(
  path: string,
  text: string,
): { data: Record<string, unknown> | null; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) return { data: null, body: text };
  const data: unknown = parse(match[1]) ?? {};
  if (typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`markdown-pages: ${path}'s front matter isn't a mapping of keys to values`);
  }
  const name = (data as { name?: unknown }).name;
  if (name !== undefined && typeof name !== "string") {
    throw new Error(`markdown-pages: ${path}'s front matter name isn't a string`);
  }
  return { data: data as Record<string, unknown>, body: text.slice(match[0].length) };
}

/** Each GitHub alert kind's octicon, from the icons layer, as marked-alert's variants take it; the
 * title, the kind's name, is marked-alert's own. */
const alertVariants = [
  { type: "note", icon: infoIcon },
  { type: "tip", icon: lightBulbIcon },
  { type: "important", icon: reportIcon },
  { type: "warning", icon: alertIcon },
  { type: "caution", icon: stopIcon },
];

/** The language label of a fence's info string: its first word, none for an unlabeled fence, as
 * marked's own code renderer reads it. */
const fenceLabel = (lang: string | undefined): string => /^\S*/.exec(lang ?? "")?.[0] ?? "";

/** Renders the copied file at path in source's tree, its path in the source, its text given, with
 * its links placed against source, its fences through highlight, when given, and its alerts as
 * marked-alert's callouts; throws when the file has neither a front matter name nor an h1 to title
 * it. */
export function render(
  path: string,
  text: string,
  source: Source,
  highlight?: Highlight,
): Rendered {
  const { data, body } = frontMatter(named(path, source), text);
  /** Every heading token, in document order. */
  const tokens: Tokens.Heading[] = [];
  // gfmHeadingId resets its slugger in its preprocess hook on every parse, so each page's ids
  // count their duplicates from none, as GitHub's do. walkTokens visits in document order, so the
  // first depth-1 heading it meets is the file's first h1.
  // marked-alert's walkTokens turns an alert's blockquote into its alert token before marked
  // walks the token's children, so a link inside an alert is placed as any other.
  const marked = new Marked(gfmHeadingId(), markedAlert({ variants: alertVariants }), {
    walkTokens(token) {
      if (token.type === "link") token.href = place(token.href, path, source);
      if (token.type === "heading") tokens.push(token as Tokens.Heading);
    },
  });
  // A labeled fence renders highlighted; false falls back to marked's own renderer, so an
  // unlabeled fence, or one highlight leaves plain, renders as marked renders it.
  if (highlight) {
    marked.use({
      renderer: {
        code(token) {
          const lang = fenceLabel(token.lang);
          if (token.codeBlockStyle === "indented" || lang === "") return false;
          const html = highlight(token.text, lang);
          return html === false ? false : `${html}\n`;
        },
      },
    });
  }
  // Each table in its region, named by its header cells' text, as a code block's pre is
  // focusable: a keyboard reaches it and scrolls it sideways.
  marked.use({
    renderer: {
      table(token) {
        const header = token.header
          .map((cell) => this.parser.parseInline(cell.tokens, this.parser.textRenderer).trim())
          .filter((text) => text !== "");
        const label = header.length > 0 ? `Table: ${header.join(", ")}` : "Table";
        const table = Renderer.prototype.table.call(this, token);
        return (
          `<div class="table-region" role="region" aria-label="${attribute(label)}" ` +
          `tabindex="0">\n${table}</div>\n`
        );
      },
    },
  });
  const html = marked.parse(body, { async: false });
  // A heading's inline content as plain text, its emphasis, code, and links reduced to their
  // text, by the parser's own text renderer, which renders nested inline tokens back through it.
  const parser = new Parser();
  const plain = (token: Tokens.Heading): string =>
    parser.parseInline(token.tokens, parser.textRenderer).trim();
  // The ids this parse's heading renderer wrote, read before any other parse resets the list,
  // one a heading token, both in document order; each heading's text is its token's, since the
  // list's own drops what its entities spell.
  const ids = getHeadingList();
  const headings = tokens
    .map((token, i) => ({ depth: token.depth, id: ids[i].id, text: plain(token) }))
    .filter((heading): heading is Heading => heading.depth === 2 || heading.depth === 3);
  const h1 = tokens.find((token) => token.depth === 1);
  const title = (data?.name as string | undefined) ?? (h1 && plain(h1));
  if (!title) {
    throw new Error(
      `markdown-pages: ${named(path, source)} has neither a front matter name nor an h1 to title it`,
    );
  }
  return { data, title, html, headings };
}

/** Escapes text for an HTML text node. */
const escape = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Escapes text for an HTML attribute's double-quoted value. */
const attribute = (text: string): string => escape(text).replace(/"/g, "&quot;");

/** A front matter value as its meta's content: a sequence its items' text and a mapping its keys
 * and their values' text, each joined by ", ", a mapping's pair as "key: value"; null nothing; any
 * other value its text. */
export function frontMatterText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(frontMatterText).join(", ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${frontMatterText(item)}`)
      .join(", ");
  }
  return String(value);
}

/** The page's front matter as head metadata: a <meta name="<key>" content="<value>"> per key, in
 * source order, the value as frontMatterText gives it, both escaped, each on its own line; nothing
 * with no front matter, or an empty one. */
export function frontMatterMeta(data: Rendered["data"]): string {
  return Object.entries(data ?? {})
    .map(
      ([key, value]) =>
        `<meta name="${attribute(key)}" content="${attribute(frontMatterText(value))}" />\n`,
    )
    .join("");
}

/** The names, lowercased, of the meta elements the shell's markup writes, as <meta name="…">. */
function shellMetaNames(shell: string): Set<string> {
  return new Set(
    [...shell.matchAll(/<meta\b[^>]*?\bname\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi)].map(
      (match) => (match[1] ?? match[2] ?? match[3]).toLowerCase(),
    ),
  );
}

/** The page's section tree in the Contents drawer: an sl-drawer docked from docks.tree, labeled
 * "Contents", its id contents, which the shell's Contents button controls, holding an
 * sl-section-tree slotting a list of the page's h2s, each linking its heading's id,
 * percent-encoded, with the h3s under it in a nested list; an h3 before any h2 stands at the top
 * level. Nothing for a page with neither. */
export function sectionTree(headings: readonly Heading[]): string {
  if (headings.length === 0) return "";
  const link = ({ id, text }: Heading): string =>
    `<a href="#${attribute(encodeURIComponent(id))}">${escape(text)}</a>`;
  const items: string[] = [];
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nested: string[] = [];
    if (heading.depth === 2) {
      while (headings[i + 1]?.depth === 3) nested.push(`<li>${link(headings[++i])}</li>`);
    }
    const list = nested.length > 0 ? `<ul>${nested.join("")}</ul>` : "";
    items.push(`<li>${link(heading)}${list}</li>`);
  }
  return (
    `<sl-drawer id="contents" label="Contents" dock="${docks.tree}">` +
    `<sl-section-tree><ul>${items.join("")}</ul></sl-section-tree></sl-drawer>`
  );
}

/** A directory of the copied root, as the site index nests it: its index page's file, its pages'
 * files, and its directories by name. */
interface Directory {
  index?: string;
  pages: string[];
  dirs: Map<string, Directory>;
}

/** An entry of the site index's lists: a copied file's page, or a directory, labeled by its index
 * page's file or, with none, by its name, its pages and directories nested under it. */
interface IndexEntry {
  file?: string;
  name: string;
  nested: IndexEntry[];
}

/** The site index's top-level list over the copied files: the root's index page first, then the
 * root's pages and directories by name, each directory's in turn by name under it. The one order
 * both the site index and the pager read. */
function indexEntries(files: Iterable<string>): IndexEntry[] {
  const root: Directory = { pages: [], dirs: new Map() };
  for (const file of files) {
    const parts = file.split("/");
    let dir = root;
    for (const name of parts.slice(0, -1)) {
      let child = dir.dirs.get(name);
      if (child === undefined) dir.dirs.set(name, (child = { pages: [], dirs: new Map() }));
      dir = child;
    }
    if (parts.at(-1) === "README.md") dir.index = file;
    else dir.pages.push(file);
  }
  const entries = (dir: Directory): IndexEntry[] =>
    [
      ...dir.pages.map((file) => ({ file, name: posix.basename(file), nested: [] })),
      ...[...dir.dirs].map(([name, child]) => ({
        ...(child.index === undefined ? {} : { file: child.index }),
        name,
        nested: entries(child),
      })),
    ].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return [
    ...(root.index === undefined ? [] : [{ file: root.index, name: "", nested: [] }]),
    ...entries(root),
  ];
}

/** Every copied file in the site index's order, the order its links read top to bottom: each
 * entry's page, then the pages nested under it. The pager steps through it. */
export function indexOrder(files: Iterable<string>): string[] {
  const flat = (entries: IndexEntry[]): string[] =>
    entries.flatMap(({ file, nested }) => [...(file === undefined ? [] : [file]), ...flat(nested)]);
  return flat(indexEntries(files));
}

/** The page of the copied file from's site index in the Pages drawer: an sl-drawer docked from
 * docks.index, labeled "Pages", its id pages, which the shell's Pages button controls, holding an
 * sl-site-index slotting a list of every page, titles giving each copied file's title, nested by
 * directory: a page an li of its link, its text the page's title; a directory an li of its index
 * page's link, or a span of its name when it has none, then a nested list of its pages and
 * directories, by name. The root's index page is the top-level list's first entry. Each link is
 * relative to from's page, as its body's are, so it resolves under any base. */
export function siteIndex(titles: ReadonlyMap<string, string>, from: string): string {
  const link = (file: string): string =>
    `<a href="${attribute(pageUrl(from, file))}">${escape(titles.get(file) ?? file)}</a>`;
  const items = (entries: IndexEntry[]): string =>
    entries
      .map(({ file, name, nested }) => {
        const label = file === undefined ? `<span>${escape(name)}</span>` : link(file);
        return `<li>${label}${nested.length > 0 ? `<ul>${items(nested)}</ul>` : ""}</li>`;
      })
      .join("");
  return (
    `<sl-drawer class="site-index" label="Pages" id="pages" dock="${docks.index}">` +
    `<sl-site-index><ul>${items(indexEntries(titles.keys()))}</ul></sl-site-index></sl-drawer>`
  );
}

/** The accessible names of a page's two pagers, at the top of its main and at its foot, each a
 * nav landmark, so a landmark list tells them apart. */
export const pagerLabels = {
  top: "Previous and next page",
  bottom: "Previous and next page, end of page",
} as const;

/** One of the copied file from's pagers, where in its main given: a nav, named by pagerLabels,
 * linking from's neighbours in order, the site index's order, the page before it at the inline
 * start and the page after it at the inline end. Each link shows the word Previous or Next, the
 * neighbour's title, from titles, and its key hint, H or L, aria-hidden, with an arrow glyph
 * marker, which the build fills, on its outer side, before a previous link's text and after a
 * next link's hint, so each arrow points off the row's edge; it binds that key by data-keys,
 * which the foundation's keys module clicks. It has no aria-label: its name is its visible text,
 * "Previous <title>" or "Next <title>", the glyph and the hint aria-hidden, so the name holds the
 * words it shows (WCAG 2.5.3, Label in Name), and Help lists it by that text, its kbd left out.
 * Each link is relative to from's page, as the site index's are, and carries rel prev or next.
 * The first page has no previous link and the last no next, and nothing wraps; a page with
 * neither, the only one, has no pager, nor does a file order doesn't list. */
export function pager(
  order: readonly string[],
  titles: ReadonlyMap<string, string>,
  from: string,
  where: keyof typeof pagerLabels,
): string {
  const at = order.indexOf(from);
  if (at < 0) return "";
  const link = (file: string | undefined, rel: "prev" | "next"): string => {
    if (file === undefined) return "";
    const [word, key, icon] =
      rel === "prev" ? ["Previous", "h", "arrow-left-16"] : ["Next", "l", "arrow-right-16"];
    const title = titles.get(file) ?? file;
    const glyph = `<svg data-icon="octicon/${icon}"></svg>`;
    return (
      `<a class="pager-${rel}" href="${attribute(pageUrl(from, file))}" rel="${rel}" ` +
      `data-keys="${key}">` +
      (rel === "prev" ? glyph : "") +
      `<span class="pager-text"><span class="pager-word">${word}</span> ` +
      `<span class="pager-title">${escape(title)}</span></span>` +
      `<span class="pager-key" aria-hidden="true"><kbd>${key.toUpperCase()}</kbd></span>` +
      (rel === "next" ? glyph : "") +
      `</a>`
    );
  };
  const links = link(order[at - 1], "prev") + link(order[at + 1], "next");
  if (links === "") return "";
  return `<nav class="pager" aria-label="${attribute(pagerLabels[where])}">${links}</nav>`;
}

/** Fills the shell with a rendered page: its title, and its front matter's meta after it; its body
 * in <main>, between its pagers, top and bottom, when it has them; then its section tree, when it
 * has one, in the Contents drawer, and the site index, index, in the Pages drawer. */
function fill(
  shell: string,
  { data, title, html, headings }: Rendered,
  index: string,
  pagers: { top: string; bottom: string },
): string {
  const tree = sectionTree(headings);
  const drawers = `${tree === "" ? "" : `${tree}\n`}${index}`;
  const line = (markup: string): string => (markup === "" ? "" : `${markup}\n`);
  return shell
    .replace(
      /<title>[^<]*<\/title>/,
      () => `<title>${escape(title)}</title>\n${frontMatterMeta(data)}`,
    )
    .replace(
      "<main></main>",
      () => `<main>\n${line(pagers.top)}${html}${line(pagers.bottom)}</main>\n${drawers}`,
    );
}

/** A copied file the plugin builds: its path under the copied root, its path in its tree's source,
 * and the source its links are placed against. */
interface Copied {
  file: string;
  path: string;
  source: Source;
}

/** The plugin: every copied file under options.dir a page of the build, loaded from its id, the
 * page's path under the root. */
export function markdownPages(options: Options): Plugin {
  const shellName = options.shell ?? "index.html";
  /** Each tree configured, with its directory under options.dir: "" for the one tree of a single
   * source, and each of several trees' its repository's, as content.ts's treeDir names it. */
  const trees: { dir: string; tree: TreeOptions }[] =
    "trees" in options
      ? options.trees.map((tree) => ({ dir: treeDir(posix.basename(tree.repository)), tree }))
      : [{ dir: "", tree: options }];
  /** Each page's id, its absolute path under the root, to its copied file. */
  const ids = new Map<string, Copied>();
  let root = "";
  /** Each copied file's page, rendered at the build's start, and its title, which every page's
   * site index lists. */
  const rendered = new Map<string, Rendered>();
  const titles = new Map<string, string>();
  /** Every copied file in the site index's order, which each page's pagers step through. */
  let order: string[] = [];
  /** The syntax stylesheet's URL, under the base, when the build highlights. */
  let stylesheet: string | undefined;
  let base = "/";
  let assetsDir = "assets";
  /** The icons layer as the site resolves it, which fills every page's glyph markers. */
  let icons: LoadIcon | undefined;

  return {
    name: "site:markdown-pages",
    apply: "build",
    config(config) {
      root = normalizePath(resolve(config.root ?? process.cwd()));
      icons = siteIcons(root);
      ids.clear();
      const dirs = new Set<string>();
      for (const { dir, tree } of trees) {
        if (dirs.has(dir)) {
          throw new Error(
            `markdown-pages: two trees share the directory ${dir}, ${tree.repository}'s`,
          );
        }
        dirs.add(dir);
        const paths = readdirSync(join(root, options.dir, dir), {
          recursive: true,
          encoding: "utf8",
        })
          .map((path) => normalizePath(path))
          .filter((path) => path.endsWith(".md"))
          .sort();
        const source: Source = {
          pages: new Set(paths),
          external: new Set(tree.external),
          repository: tree.repository,
          ref: tree.ref,
          ...(dir === "" ? {} : { dir }),
        };
        for (const path of paths) {
          const file = posix.join(dir, path);
          ids.set(`${root}/${pageFile(file)}`, { file, path, source });
        }
      }
      return { build: { rolldownOptions: { input: [...ids.keys()] } } };
    },
    configResolved(config) {
      // A site's own inputs, its hand pages, concatenate with the pages' ids, each of which is
      // an input once; a hand input that names a copied file's page makes it twice, and the two
      // would build to one file.
      const input = config.build.rolldownOptions.input ?? [];
      const inputs = typeof input === "string" ? [input] : Object.values(input);
      const seen = new Set<string>();
      for (const name of inputs) {
        const id = normalizePath(resolve(root, name));
        const copied = ids.get(id);
        if (copied !== undefined && seen.has(id)) {
          throw new Error(
            `markdown-pages: the input ${name} is also ${copied.file}'s page; a hand page can't ` +
              `take a copied file's path`,
          );
        }
        seen.add(id);
      }
      base = config.base;
      assetsDir = config.build.assetsDir;
    },
    // Every page renders here, before any loads, so the highlighter, which loads its grammars
    // asynchronously, is made once over every label the pages' fences hold, and the stylesheet,
    // every class the pages' tokens take, is whole before a page links it.
    async buildStart() {
      rendered.clear();
      titles.clear();
      stylesheet = undefined;
      const texts = new Map(
        [...ids.values()].map((copied) => [
          copied,
          readFileSync(join(root, options.dir, copied.file), "utf8"),
        ]),
      );
      const themes = options.syntax ?? builtinSyntax;
      let highlight: Highlight | undefined;
      let syntax: Syntax | undefined;
      if (themes.length > 0) {
        const langs = new Set<string>();
        for (const text of texts.values()) {
          const marked = new Marked();
          marked.walkTokens(marked.lexer(text), (token) => {
            if (token.type === "code") langs.add(fenceLabel((token as Tokens.Code).lang));
          });
        }
        syntax = await createSyntax(themes, langs);
        highlight = syntax.highlight;
      }
      for (const [{ file, path, source }, text] of texts) {
        const page = render(path, text, source, highlight);
        rendered.set(file, page);
        titles.set(file, page.title);
      }
      order = indexOrder(titles.keys());
      if (syntax) {
        const css = syntax.stylesheet();
        const hash = createHash("sha256").update(css).digest("base64url").slice(0, 8);
        const fileName = posix.join(assetsDir, `syntax-${hash}.css`);
        this.emitFile({ type: "asset", fileName, source: css });
        stylesheet = base + fileName;
      }
    },
    resolveId(id) {
      return ids.has(id) ? id : null;
    },
    load(id) {
      const file = ids.get(id)?.file;
      if (file === undefined) return null;
      const shell = readFileSync(join(root, shellName), "utf8");
      for (const [pattern, want] of [
        [/<title>[^<]*<\/title>/g, "one <title>"],
        [/<main><\/main>/g, "one empty <main></main>"],
      ] as const) {
        const found = shell.match(pattern)?.length ?? 0;
        if (found !== 1)
          throw new Error(`markdown-pages: want ${want} in ${shellName}, found ${found}`);
      }
      const page = rendered.get(file);
      if (page === undefined)
        throw new Error(`markdown-pages: ${file} loads before the build starts`);
      // A front matter key keeps its name as its meta's, so one the shell's own meta has, its
      // viewport, would give the page two of it.
      const metas = shellMetaNames(shell);
      for (const key of Object.keys(page.data ?? {})) {
        if (metas.has(key.toLowerCase())) {
          throw new Error(
            `markdown-pages: ${file}'s front matter key ${key} names a meta ${shellName} ` +
              `already writes`,
          );
        }
      }
      return fill(shell, page, siteIndex(titles, file), {
        top: pager(order, titles, file, "top"),
        bottom: pager(order, titles, file, "bottom"),
      });
    },
    // After Vite's own transform of the page, so the link, to an asset the build emits, is
    // written as it is and never resolved as a source. Every page the build writes passes here,
    // a hand page as a rendered one, so each has its glyph markers filled.
    transformIndexHtml: {
      order: "post",
      async handler(page, ctx) {
        if (icons === undefined) throw new Error("markdown-pages: a page transforms before config");
        const html = await fillIcons(page, ctx.path, icons);
        if (stylesheet === undefined || !ids.has(normalizePath(ctx.filename))) return html;
        return {
          html,
          tags: [{ tag: "link", attrs: { rel: "stylesheet", href: stylesheet }, injectTo: "head" }],
        };
      },
    },
  };
}
