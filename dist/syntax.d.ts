import type { BundledTheme, ThemeRegistrationAny } from "shiki";
/** A palette's syntax theme: the foundation Color profile's palette name, and the theme its code
 * takes in light and in dark, each a theme Shiki bundles by its name or a theme object. */
export interface SyntaxTheme {
    palette: string;
    light: BundledTheme | ThemeRegistrationAny;
    dark: BundledTheme | ThemeRegistrationAny;
}
/** The SDK's syntax themes, one for each of the foundation's palettes. */
export declare const builtinSyntax: readonly SyntaxTheme[];
/** What keeps the syntax theme from merging into one light-dark() theme, one line each, naming
 * its palette: none when it merges. */
export declare function checkSyntax(theme: SyntaxTheme): Promise<string[]>;
/** The build's highlighter, over its syntax themes and the languages its pages label. */
export interface Syntax {
    /** The fence's code highlighted, under every syntax theme, its language label given: false for a
     * label Shiki bundles no grammar for, which marked then renders plain. */
    highlight(code: string, lang: string): string | false;
    /** The stylesheet of every class the highlighting has given a token so far, and each syntax
     * theme's rule selecting its colors and font styles by its palette. */
    stylesheet(): string;
}
/** The highlighter over the syntax themes, each held to checkSyntax, and the languages, those of
 * them Shiki bundles a grammar for loaded and the rest left plain; throws on a theme that fails the
 * check, naming its palette and each failure, or on a palette two themes name. */
export declare function createSyntax(themes: readonly SyntaxTheme[], langs: Iterable<string>): Promise<Syntax>;
