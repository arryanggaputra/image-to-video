import { defineConfig } from "bun";

export default defineConfig({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  target: "browser",
  minify: true,
  splitting: true,
  sourcemap: "external",
});
