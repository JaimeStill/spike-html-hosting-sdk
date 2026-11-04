// The fixture site's capture file, as a Markdown site's scripts/screenshots.config.ts reads: the
// SDK's description of its pages, listed from content.json. The SDK's browser tier runs the
// tooling's bin on it (test/browser/screenshots.test.ts).

import { contentPages, description } from "../../../src/screenshots.ts";

const root = import.meta.dirname;

export default description({ root, pages: contentPages(root) });
