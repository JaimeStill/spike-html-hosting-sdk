// How a site is served to a browser: its build, dist/, by Vite's preview, under the Pages base, on
// a free loopback port. A site's browser tier and its capture file both start it here, given the
// site's root directory, so a capture makes the requests the tier checks, as the deployed site
// does. The base is the one GitHub Pages serves a project site under, /<repository>/, and the
// repository's name is the site's package.json name, the one place a site writes it; the site's
// vite.config.ts builds under the same base.
// Adapted from spike-html-hosting-architecture (a20a1e0): test/browser/support/served.ts, its root
// the site's, given, and its base read from the site's package.json.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { freePort, start } from "@jaimestill/spike-html-apps-tooling/process.js";
import type { Server } from "@jaimestill/spike-html-apps-tooling/server.js";

/** The path Pages serves the site at root under, /<name>/, its name package.json's. */
export function base(root: string): string {
  const { name } = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    name?: unknown;
  };
  if (typeof name !== "string" || !/^[\w.-]+$/.test(name)) {
    throw new Error(`${join(root, "package.json")}'s name isn't a repository's name: ${name}`);
  }
  return `/${name}/`;
}

/** The installed command's path, found as a package manager's exec finds it: in node_modules/.bin
 * of root or of the nearest directory above it that holds it. */
export function command(root: string, name: string): string {
  for (let dir = resolve(root); ; dir = dirname(dir)) {
    const path = join(dir, "node_modules", ".bin", name);
    if (existsSync(path)) return path;
    if (dirname(dir) === dir) throw new Error(`${name} isn't installed at or above ${root}`);
  }
}

/**
 * Starts Vite's preview of the build of the site at root and resolves once the site answers; its
 * origin is the site's URL under the base, http://127.0.0.1:<port>/<repository>/, which every
 * page path resolves against, and stop ends the preview's process group. Vite reads the site's
 * vite.config.ts and dist/ from root; the host and the port are set here, so the site's config
 * needn't name them.
 */
export async function served(root: string): Promise<Server> {
  const port = await freePort();
  const site = `http://127.0.0.1:${port}${base(root)}`;
  const preview = await start(
    command(root, "vite"),
    ["preview", "--host", "127.0.0.1", "--port", `${port}`, "--strictPort"],
    { cwd: root, ready: site },
  );
  return {
    origin: site,
    stop: async () => {
      await preview.stop();
    },
  };
}
