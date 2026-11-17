import { defineConfig } from "tsup";
import { readFile } from "node:fs/promises";
import path from "node:path";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    clean: true,
    external: ["react", "react-dom"],
    esbuildPlugins: [
      {
        name: "component-css",
        setup(build) {
        build.onResolve({ filter: /\.inline$/ }, (args) => ({
            path: path.resolve(args.resolveDir, args.path),
            namespace: "component-css",
          }));
          build.onLoad(
            { filter: /.*/, namespace: "component-css" },
            async (args) => ({
              contents: await readFile(
                args.path.replace(/\.inline$/, ".css"),
                "utf8",
              ),
              loader: "text",
            }),
          );
        },
      },
    ],
    banner: { js: '"use client";' }, // works inside Next.js App Router
  },
  {
    entry: { server: "src/server.ts", vite: "src/vite.ts" },
    format: ["esm"],
    dts: true,
    platform: "node",
    external: ["vite"],
  },
]);
