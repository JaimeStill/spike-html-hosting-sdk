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
// A file's page is its path with .md turned to .html, except a README.md, which is its
// directory's index.html, so a single tree's root README.md is the site's index. A file's
// leading YAML front matter, when it has one, is parsed and never rendered as body text: the page
// shows it in its header, an sl-page-header of spike-html-hosting-components, as a dl of a dt for
// each key and a dd for its value, in source order, escaped. The page's title is the front
// matter's name, or, with no name, the text of the file's first h1; a file with neither fails the
// build, naming it. Headings carry GitHub's ids (marked-gfm-heading-id), so a fragment written
// against the source on GitHub resolves here. A relative link to a file copied in the linking
// file's tree is rewritten to that file's page, relative to the linking page, its fragment kept;
// one to a file listed as external, present in the source but not copied, to the file's blob on
// GitHub at the tree's pinned commit; any other relative link, one leaving its tree among them,
// fails the build, naming the page and the link, so no link is left to break. A fragment alone,
// or a URL with a scheme, passes through. A GitHub alert, a blockquote opening [!NOTE], [!TIP],
// [!IMPORTANT], [!WARNING], or [!CAUTION], renders as marked-alert renders it, as GitHub does: a
// div.markdown-alert.markdown-alert-<kind>, its first line a p.markdown-alert-title of the kind's
// octicon, an svg aria-hidden, and its kind as visible text, "Important", which site.css draws as
// a callout.
//
// Each page's data is written as the light-DOM markup the components slot, so with no script it
// renders as the page's own: the page header, at the top of main, where GitHub shows the front
// matter; the section tree, an sl-section-tree of the page's h2s, each with its h3s in a nested
// list, linked by the ids the headings carry, in a div.section-tree before main, or none for a
// page with neither; and the site index, an sl-site-index of every copied page, nested by
// directory, each linked relative to the page, as its body's links are, in the Pages drawer, an
// sl-drawer labeled "Pages" with the id the shell's Pages button controls, after main. The tree
// comes before main so that, as the bar it is in a narrow viewport, it sticks to the top of the
// viewport from the page's own flow, and so the reading order, and a keyboard's, is the order the
// page shows; the index, after main, is a column beside it or a closed drawer. Each element's dock,
// the width from which it is a column, is the layout's (docks), which site.css's media queries
// write too. The renderer writes no aria-current: the components mark the current section and page
// at runtime, and the site nav, which takes no content, is the shell's to place, with the Pages
// button. Each body table is wrapped in a div.table-region, a region named by its header cells
// that a keyboard focuses, as Shiki's tabindex makes each code block, which scrolls the table
// sideways in a viewport narrower than it.
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
import { Marked, Parser, Renderer } from "marked";
import markedAlert from "marked-alert";
import { getHeadingList, gfmHeadingId } from "marked-gfm-heading-id";
import { normalizePath } from "vite";
import { parse } from "yaml";
import { treeDir } from "./content.js";
import { builtinSyntax, createSyntax } from "./syntax.js";
/**
 * The widths from which the layout docks each side column, as the components' dock attribute
 * takes them, read in the media query (width < dock), so a viewport of exactly dock docks; site.css
 * writes the same lengths in its media queries, and the shell's Pages button's. Each is the width
 * where its columns fit at their 16rem minimum beside main's 80ch, measured in the foundation's
 * default type and regular space, with a scrollbar: the section tree alone in the end column, the
 * start one left empty so main stays as near centered as fits, from 70rem (about 69.3rem needed),
 * and the site index too, in the start column, from 86rem (about 85.3rem needed). Below index, the
 * index is the Pages drawer; below tree, the tree is the sticky bar.
 */
export const docks = { tree: "70rem", index: "86rem" };
/** The copied file at path in source's tree, by its path under the copied root, as a failure
 * names it. */
const named = (path, source) => posix.join(source.dir ?? "", path);
/** The page a copied file builds to, under the root: x.md is x.html, and dir/README.md is
 * dir/index.html. */
export function pageFile(path) {
    if (posix.basename(path) === "README.md")
        return posix.join(posix.dirname(path), "index.html");
    return path.replace(/\.md$/, ".html");
}
/** The URL of the copied file to's page, relative to the page of the copied file from: a
 * directory's index is its directory, with its trailing slash. */
export function pageUrl(from, to) {
    const file = pageFile(to);
    const dir = posix.relative(posix.dirname(pageFile(from)), posix.dirname(file));
    if (posix.basename(file) === "index.html")
        return dir === "" ? "./" : `${dir}/`;
    return dir === "" ? posix.basename(file) : `${dir}/${posix.basename(file)}`;
}
/** The link href, written in the copied file path, as the page links it; throws on a relative
 * link the source can't place. */
function place(href, path, source) {
    if (href.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(href))
        return href;
    const hash = href.indexOf("#");
    const target = hash < 0 ? href : href.slice(0, hash);
    const fragment = hash < 0 ? "" : href.slice(hash);
    const resolved = posix.normalize(posix.join(posix.dirname(path), target));
    if (!href.startsWith("/") && !resolved.startsWith("../")) {
        if (source.pages.has(resolved))
            return pageUrl(path, resolved) + fragment;
        if (source.external.has(resolved)) {
            return `${source.repository}/blob/${source.ref}/${resolved}${fragment}`;
        }
    }
    throw new Error(`markdown-pages: ${named(path, source)} links ${href}, which is neither a copied file nor a listed ` +
        `external one; copy it, or list it external if the source holds it at ${source.ref}`);
}
/** The file's leading front matter, parsed, null when it has none, and its body after it; throws
 * when the front matter isn't a mapping, or holds a name that isn't a string. */
function frontMatter(path, text) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
    if (!match)
        return { data: null, body: text };
    const data = parse(match[1]) ?? {};
    if (typeof data !== "object" || Array.isArray(data)) {
        throw new Error(`markdown-pages: ${path}'s front matter isn't a mapping of keys to values`);
    }
    const name = data.name;
    if (name !== undefined && typeof name !== "string") {
        throw new Error(`markdown-pages: ${path}'s front matter name isn't a string`);
    }
    return { data: data, body: text.slice(match[0].length) };
}
/** The language label of a fence's info string: its first word, none for an unlabeled fence, as
 * marked's own code renderer reads it. */
const fenceLabel = (lang) => /^\S*/.exec(lang ?? "")?.[0] ?? "";
/** Renders the copied file at path in source's tree, its path in the source, its text given, with
 * its links placed against source, its fences through highlight, when given, and its alerts as
 * marked-alert's callouts; throws when the file has neither a front matter name nor an h1 to title
 * it. */
export function render(path, text, source, highlight) {
    const { data, body } = frontMatter(named(path, source), text);
    /** Every heading token, in document order. */
    const tokens = [];
    // gfmHeadingId resets its slugger in its preprocess hook on every parse, so each page's ids
    // count their duplicates from none, as GitHub's do. walkTokens visits in document order, so the
    // first depth-1 heading it meets is the file's first h1.
    // marked-alert's walkTokens turns an alert's blockquote into its alert token before marked
    // walks the token's children, so a link inside an alert is placed as any other.
    const marked = new Marked(gfmHeadingId(), markedAlert(), {
        walkTokens(token) {
            if (token.type === "link")
                token.href = place(token.href, path, source);
            if (token.type === "heading")
                tokens.push(token);
        },
    });
    // A labeled fence renders highlighted; false falls back to marked's own renderer, so an
    // unlabeled fence, or one highlight leaves plain, renders as marked renders it.
    if (highlight) {
        marked.use({
            renderer: {
                code(token) {
                    const lang = fenceLabel(token.lang);
                    if (token.codeBlockStyle === "indented" || lang === "")
                        return false;
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
                return (`<div class="table-region" role="region" aria-label="${attribute(label)}" ` +
                    `tabindex="0">\n${table}</div>\n`);
            },
        },
    });
    const html = marked.parse(body, { async: false });
    // A heading's inline content as plain text, its emphasis, code, and links reduced to their
    // text, by the parser's own text renderer, which renders nested inline tokens back through it.
    const parser = new Parser();
    const plain = (token) => parser.parseInline(token.tokens, parser.textRenderer).trim();
    // The ids this parse's heading renderer wrote, read before any other parse resets the list,
    // one a heading token, both in document order; each heading's text is its token's, since the
    // list's own drops what its entities spell.
    const ids = getHeadingList();
    const headings = tokens
        .map((token, i) => ({ depth: token.depth, id: ids[i].id, text: plain(token) }))
        .filter((heading) => heading.depth === 2 || heading.depth === 3);
    const h1 = tokens.find((token) => token.depth === 1);
    const title = data?.name ?? (h1 && plain(h1));
    if (!title) {
        throw new Error(`markdown-pages: ${named(path, source)} has neither a front matter name nor an h1 to title it`);
    }
    return { data, title, html, headings };
}
/** Escapes text for an HTML text node. */
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Escapes text for an HTML attribute's double-quoted value. */
const attribute = (text) => escape(text).replace(/"/g, "&quot;");
/** A front matter value as its dd's text: a sequence its items' text and a mapping its keys and
 * their values' text, each joined by ", ", a mapping's pair as "key: value"; null nothing; any
 * other value its text. */
export function frontMatterText(value) {
    if (value === null || value === undefined)
        return "";
    if (Array.isArray(value))
        return value.map(frontMatterText).join(", ");
    if (typeof value === "object") {
        return Object.entries(value)
            .map(([key, item]) => `${key}: ${frontMatterText(item)}`)
            .join(", ");
    }
    return String(value);
}
/** The page's header, an sl-page-header slotting a dl of its front matter, a dt for each key and a
 * dd for its value, in source order, escaped; with no front matter, or an empty one, the element
 * holds nothing, and takes no space. */
export function pageHeader(data) {
    const entries = Object.entries(data ?? {});
    if (entries.length === 0)
        return "<sl-page-header></sl-page-header>\n";
    const fields = entries.map(([key, value]) => `<dt>${escape(key)}</dt><dd>${escape(frontMatterText(value))}</dd>`);
    return `<sl-page-header><dl>${fields.join("")}</dl></sl-page-header>\n`;
}
/** The page's section tree, an sl-section-tree docked from docks.tree, slotting a list of its h2s,
 * each linking its heading's id, percent-encoded, with the h3s under it in a nested list; an h3
 * before any h2 stands at the top level. Nothing for a page with neither. */
export function sectionTree(headings) {
    if (headings.length === 0)
        return "";
    const link = ({ id, text }) => `<a href="#${attribute(encodeURIComponent(id))}">${escape(text)}</a>`;
    const items = [];
    for (let i = 0; i < headings.length; i++) {
        const heading = headings[i];
        const nested = [];
        if (heading.depth === 2) {
            while (headings[i + 1]?.depth === 3)
                nested.push(`<li>${link(headings[++i])}</li>`);
        }
        const list = nested.length > 0 ? `<ul>${nested.join("")}</ul>` : "";
        items.push(`<li>${link(heading)}${list}</li>`);
    }
    return `<sl-section-tree dock="${docks.tree}"><ul>${items.join("")}</ul></sl-section-tree>`;
}
/** The page of the copied file from's site index in the Pages drawer: an sl-drawer docked from
 * docks.index, labeled "Pages", its id pages, which the shell's Pages button controls, holding an
 * sl-site-index slotting a list of every page, titles giving each copied file's title, nested by
 * directory: a page an li of its link, its text the page's title; a directory an li of its index
 * page's link, or a span of its name when it has none, then a nested list of its pages and
 * directories, by name. The root's index page is the top-level list's first entry. Each link is
 * relative to from's page, as its body's are, so it resolves under any base. */
export function siteIndex(titles, from) {
    const root = { pages: [], dirs: new Map() };
    for (const file of titles.keys()) {
        const parts = file.split("/");
        let dir = root;
        for (const name of parts.slice(0, -1)) {
            let child = dir.dirs.get(name);
            if (child === undefined)
                dir.dirs.set(name, (child = { pages: [], dirs: new Map() }));
            dir = child;
        }
        if (parts.at(-1) === "README.md")
            dir.index = file;
        else
            dir.pages.push(file);
    }
    const link = (file) => `<a href="${attribute(pageUrl(from, file))}">${escape(titles.get(file) ?? file)}</a>`;
    const entries = (dir) => [
        ...dir.pages.map((file) => [posix.basename(file), `<li>${link(file)}</li>`]),
        ...[...dir.dirs].map(([name, child]) => {
            const label = child.index === undefined ? `<span>${escape(name)}</span>` : link(child.index);
            const nested = entries(child);
            return [name, `<li>${label}${nested.length > 0 ? `<ul>${nested.join("")}</ul>` : ""}</li>`];
        }),
    ]
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([, item]) => item);
    const top = [
        ...(root.index === undefined ? [] : [`<li>${link(root.index)}</li>`]),
        ...entries(root),
    ];
    return (`<sl-drawer class="site-index" label="Pages" id="pages" dock="${docks.index}">` +
        `<sl-site-index><ul>${top.join("")}</ul></sl-site-index></sl-drawer>`);
}
/** Fills the shell with a rendered page: its title; its section tree, when it has one, in its div;
 * its header and its body in <main>; then the site index, index, in its drawer. */
function fill(shell, { data, title, html, headings }, index) {
    const tree = sectionTree(headings);
    const before = tree === "" ? "" : `<div class="section-tree">\n${tree}\n</div>\n`;
    return shell
        .replace(/<title>[^<]*<\/title>/, () => `<title>${escape(title)}</title>`)
        .replace("<main></main>", () => `${before}<main>\n${pageHeader(data)}${html}</main>\n${index}`);
}
/** The plugin: every copied file under options.dir a page of the build, loaded from its id, the
 * page's path under the root. */
export function markdownPages(options) {
    const shellName = options.shell ?? "index.html";
    /** Each tree configured, with its directory under options.dir: "" for the one tree of a single
     * source, and each of several trees' its repository's, as content.ts's treeDir names it. */
    const trees = "trees" in options
        ? options.trees.map((tree) => ({ dir: treeDir(posix.basename(tree.repository)), tree }))
        : [{ dir: "", tree: options }];
    /** Each page's id, its absolute path under the root, to its copied file. */
    const ids = new Map();
    let root = "";
    /** Each copied file's page, rendered at the build's start, and its title, which every page's
     * site index lists. */
    const rendered = new Map();
    const titles = new Map();
    /** The syntax stylesheet's URL, under the base, when the build highlights. */
    let stylesheet;
    let base = "/";
    let assetsDir = "assets";
    return {
        name: "site:markdown-pages",
        apply: "build",
        config(config) {
            root = normalizePath(resolve(config.root ?? process.cwd()));
            ids.clear();
            const dirs = new Set();
            for (const { dir, tree } of trees) {
                if (dirs.has(dir)) {
                    throw new Error(`markdown-pages: two trees share the directory ${dir}, ${tree.repository}'s`);
                }
                dirs.add(dir);
                const paths = readdirSync(join(root, options.dir, dir), {
                    recursive: true,
                    encoding: "utf8",
                })
                    .map((path) => normalizePath(path))
                    .filter((path) => path.endsWith(".md"))
                    .sort();
                const source = {
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
            const seen = new Set();
            for (const name of inputs) {
                const id = normalizePath(resolve(root, name));
                const copied = ids.get(id);
                if (copied !== undefined && seen.has(id)) {
                    throw new Error(`markdown-pages: the input ${name} is also ${copied.file}'s page; a hand page can't ` +
                        `take a copied file's path`);
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
            const texts = new Map([...ids.values()].map((copied) => [
                copied,
                readFileSync(join(root, options.dir, copied.file), "utf8"),
            ]));
            const themes = options.syntax ?? builtinSyntax;
            let highlight;
            let syntax;
            if (themes.length > 0) {
                const langs = new Set();
                for (const text of texts.values()) {
                    const marked = new Marked();
                    marked.walkTokens(marked.lexer(text), (token) => {
                        if (token.type === "code")
                            langs.add(fenceLabel(token.lang));
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
            if (file === undefined)
                return null;
            const shell = readFileSync(join(root, shellName), "utf8");
            for (const [pattern, want] of [
                [/<title>[^<]*<\/title>/g, "one <title>"],
                [/<main><\/main>/g, "one empty <main></main>"],
            ]) {
                const found = shell.match(pattern)?.length ?? 0;
                if (found !== 1)
                    throw new Error(`markdown-pages: want ${want} in ${shellName}, found ${found}`);
            }
            const page = rendered.get(file);
            if (page === undefined)
                throw new Error(`markdown-pages: ${file} loads before the build starts`);
            return fill(shell, page, siteIndex(titles, file));
        },
        // After Vite's own transform of the page, so the link, to an asset the build emits, is
        // written as it is and never resolved as a source.
        transformIndexHtml: {
            order: "post",
            handler(_html, ctx) {
                if (stylesheet === undefined || !ids.has(normalizePath(ctx.filename)))
                    return;
                return [{ tag: "link", attrs: { rel: "stylesheet", href: stylesheet }, injectTo: "head" }];
            },
        },
    };
}
