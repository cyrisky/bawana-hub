// Minimal ESM resolve hook so plain `node --experimental-strip-types` can run
// scripts that import app source using TypeScript's "bundler" module
// resolution style (extensionless relative imports, e.g. "./prepare-rows"),
// same as tsconfig.json's moduleResolution: "bundler" — which is what
// Next.js/webpack use to build the actual app. Node's own ESM resolver
// requires explicit extensions, so without this, importing unmodified
// app source from a script fails with ERR_MODULE_NOT_FOUND.
//
// Only touches relative specifiers with no extension; everything else
// (bare imports like "@supabase/supabase-js", node:*, already-extensioned
// paths) defers to the default resolver untouched.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, extname, resolve as resolvePath } from "node:path";

const CANDIDATE_EXTENSIONS = [".ts", ".tsx", ".mts", ".js"];

export async function resolve(specifier, context, nextResolve) {
  const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
  if (isRelative && extname(specifier) === "") {
    const baseDir = dirname(fileURLToPath(context.parentURL));
    const absolute = resolvePath(baseDir, specifier);
    for (const ext of CANDIDATE_EXTENSIONS) {
      if (existsSync(absolute + ext)) {
        return nextResolve(pathToFileURL(absolute + ext).href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
