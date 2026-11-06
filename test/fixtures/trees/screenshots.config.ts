// The trees fixture's capture file, as a root-style site's scripts/screenshots.config.ts reads:
// the SDK's description of its pages, the hand pages, its index and briefs/orientation.html,
// before every tree's copied pages, listed from content.json.

import { contentPages, description } from "../../../src/screenshots.ts";

const root = import.meta.dirname;

export default description({
  root,
  pages: ["index.html", "briefs/orientation.html", ...contentPages(root)],
});
