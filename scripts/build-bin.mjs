import { build } from "esbuild";

await build({
  entryPoints: ["src/cli.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: "dist-bin/bundle.cjs",
  sourcemap: false,
  logLevel: "info",
});
