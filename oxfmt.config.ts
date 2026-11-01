import { defineConfig } from "oxfmt";

export default defineConfig({
  sortImports: {
    groups: [
      "type-import",
      ["type-parent", "type-sibling", "type-index", "type-internal"],
      "value-builtin",
      "value-external",
      "value-internal",
      ["value-parent", "value-sibling", "value-index"],
      "side_effect",
      "unknown",
    ],
    newlinesBetween: false,
  },
  overrides: [
    {
      // code blocks in the docs are written by hand to look good
      files: ["**/*.md"],
      options: { embeddedLanguageFormatting: "off" },
    },
  ],
  ignorePatterns: ["LICENSE"],
});
