import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts", "./src/hooks/index.ts"],
  format: ["esm"],
  target: "es2023",
  fixedExtension: false,
  dts: true,
  clean: true,
});
