import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    {
      input: "ike/src/runtime/ts/",
      outDir: "ike/src/runtime/js/",
      format: "esm",
    },
  ],
  rollup: {
    esbuild: {
      target: "esnext",
      minify: true,
    },
  },
  failOnWarn: false,
  clean: true,
});
