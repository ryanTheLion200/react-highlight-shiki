import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.spec.?(c|m)[jt]s"],
    typecheck: {
      include: ["tests/**/*.spec-d.?(c|m)[jt]s"],
    },
  },
});
