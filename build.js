import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./runme.ts"],
  bundle: false,
  minify: false,
  sourcemap: true,
  outfile: "out.js",
});
