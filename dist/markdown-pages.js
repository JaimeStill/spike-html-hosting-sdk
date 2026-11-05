// The Markdown pages: a Vite plugin that renders every Markdown file of one directory, copied
// byte for byte from a source repository at a pinned commit, into an HTML page of the build. Each
// page is a virtual .html input: the plugin loads it, the site's shell filled with the file's
// title and its rendered body, and Vite's own HTML build transforms it as it does a page on disk,
// naming its output by its path under the root. Nothing is written to the working tree.
//
// A file's page is its path with .md turned to .html, except a README.md, which is its
// directory's index.html, so the copied tree's root README.md is the site's index. A file's
// leading YAML front matter, when it has one, is parsed and never rendered as body text: the page
// shows it, as GitHub does, as a table of its keys and their values, one row a key in source
// order, escaped, ahead of the body. The page's title is the front matter's name, or, with no
// name, the text of the file's first h1; a file with neither fails the build, naming it. Headings
// carry GitHub's ids (marked-gfm-heading-id), so a fragment written against the source on GitHub
// resolves here. A relative link to a copied file is rewritten to that file's page, relative to
// the linking page, its fragment kept; one to a file listed as external, present in the source
// but not copied, to the file's blob on GitHub at the pinned commit; any other relative link fails
// the build, naming the page and the link, so no link is left to break. A fragment alone, or a
// URL with a scheme, passes through.
//
// Each fenced block is highlighted at build, so no script reaches the page: marked's own code
// renderer, on the page's Marked instance, renders it through the build's Shiki highlighter
// (syntax.ts), once per build at its start, over the syntax themes the plugin is given, the
// built-ins by default, and the languages the pages' fences label. A fence whose label Shiki
// bundles no grammar for, or with none, renders plain, as marked renders it. The build emits one
// stylesheet of the highlighted tokens' classes, which every page links, after the shell's own.
//
// Nothing here names a site or a source: a site imports the plugin and configures it with its
// content directory, its source repository's URL and pinned commit, and its external files.
// Adapted from spike-html-hosting-architecture (59b01b2): markdown-pages.ts, imported by a site
// rather than copied into it.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, posix, resolve } from "node:path";
import { Marked, Parser } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { normalizePath } from "vite";
import { parse } from "yaml";
import { builtinSyntax, createSyntax } from "./syntax.js";
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
    throw new Error(`markdown-pages: ${path} links ${href}, which is neither a copied file nor a listed ` +
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
/** Renders the copied file at path, its text given, with its links placed against source and its
 * fences through highlight, when given; throws when the file has neither a front matter name nor
 * an h1 to title it. */
export function render(path, text, source, highlight) {
    const { data, body } = frontMatter(path, text);
    let h1;
    // gfmHeadingId resets its slugger in its preprocess hook on every parse, so each page's ids
    // count their duplicates from none, as GitHub's do. walkTokens visits in document order, so the
    // first depth-1 heading it meets is the file's first h1.
    const marked = new Marked(gfmHeadingId(), {
        walkTokens(token) {
            if (token.type === "link")
                token.href = place(token.href, path, source);
            if (token.type === "heading" && token.depth === 1)
                h1 ??= token;
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
    const html = marked.parse(body, { async: false });
    // The h1's inline content as plain text, its emphasis, code, and links reduced to their text,
    // by the parser's own text renderer, which renders nested inline tokens back through it.
    const parser = new Parser();
    const title = data?.name ??
        (h1 && parser.parseInline(h1.tokens, parser.textRenderer).trim());
    if (!title) {
        throw new Error(`markdown-pages: ${path} has neither a front matter name nor an h1 to title it`);
    }
    return { data, title, html };
}
/** Escapes text for an HTML text node. */
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** A front matter value as table content: a mapping a nested table of its keys and values, a
 * sequence a one-row table of its items, as GitHub nests them; any other value its text, escaped,
 * and null nothing. */
function cell(value) {
    if (value === null || value === undefined)
        return "";
    if (Array.isArray(value)) {
        return `<table><tbody><tr>${value.map((item) => `<td>${cell(item)}</td>`).join("")}</tr></tbody></table>`;
    }
    if (typeof value === "object") {
        return table(value, "");
    }
    return escape(String(value));
}
/** A mapping as a table of its keys and their values, one row each, in source order. */
function table(data, attributes) {
    const rows = Object.entries(data).map(([key, value]) => `<tr><th scope="row">${escape(key)}</th><td>${cell(value)}</td></tr>`);
    return `<table${attributes}><tbody>${rows.join("")}</tbody></table>`;
}
/** The page's front matter as its table, ahead of its body: nothing for a file with none, or with
 * an empty one. */
export function frontMatterTable(data) {
    if (data === null || Object.keys(data).length === 0)
        return "";
    return `${table(data, ' class="front-matter"')}\n`;
}
/** Fills the shell with a rendered page: its title, and its front matter's table and its body in
 * <main>. */
function fill(shell, { data, title, html }) {
    const main = frontMatterTable(data) + html;
    return shell
        .replace(/<title>[^<]*<\/title>/, () => `<title>${escape(title)}</title>`)
        .replace("<main></main>", () => `<main>\n${main}</main>`);
}
/** The plugin: every copied file under options.dir a page of the build, loaded from its id, the
 * page's path under the root. */
export function markdownPages(options) {
    const shellName = options.shell ?? "index.html";
    /** Each page's id, its absolute path under the root, to its copied file's path. */
    const ids = new Map();
    let root = "";
    let source;
    /** Each copied file's page, rendered at the build's start. */
    const rendered = new Map();
    /** The syntax stylesheet's URL, under the base, when the build highlights. */
    let stylesheet;
    let base = "/";
    let assetsDir = "assets";
    return {
        name: "site:markdown-pages",
        apply: "build",
        config(config) {
            root = normalizePath(resolve(config.root ?? process.cwd()));
            const dir = join(root, options.dir);
            const files = readdirSync(dir, { recursive: true, encoding: "utf8" })
                .map((file) => normalizePath(file))
                .filter((file) => file.endsWith(".md"))
                .sort();
            for (const file of files)
                ids.set(`${root}/${pageFile(file)}`, file);
            source = {
                pages: new Set(files),
                external: new Set(options.external),
                repository: options.repository,
                ref: options.ref,
            };
            return { build: { rolldownOptions: { input: [...ids.keys()] } } };
        },
        configResolved(config) {
            base = config.base;
            assetsDir = config.build.assetsDir;
        },
        // Every page renders here, before any loads, so the highlighter, which loads its grammars
        // asynchronously, is made once over every label the pages' fences hold, and the stylesheet,
        // every class the pages' tokens take, is whole before a page links it.
        async buildStart() {
            rendered.clear();
            stylesheet = undefined;
            const texts = new Map([...ids.values()].map((file) => [
                file,
                readFileSync(join(root, options.dir, file), "utf8"),
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
            for (const [file, text] of texts)
                rendered.set(file, render(file, text, source, highlight));
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
            const file = ids.get(id);
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
            return fill(shell, page);
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
