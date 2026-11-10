import { describe, expect, it } from "vitest";
import { shikiBundleCodegen, type BundleOptions } from "../src";

describe("shikiBundleCodegen", () => {
  const baseOptions = {
    langs: ["javascript", "typescript", "cpp"],
    themes: ["github-light", "github-dark"],
  } satisfies Pick<BundleOptions, "langs" | "themes">;

  it("snapshots", async () => {
    await expect(
      shikiBundleCodegen({
        ...baseOptions,
        engine: "javascript",
      }),
    ).toMatchFileSnapshot("./__snapshots__/javascript.ts");

    await expect(
      shikiBundleCodegen({
        ...baseOptions,
        engine: "oniguruma",
        typescript: false,
      }),
    ).toMatchFileSnapshot("./__snapshots__/oniguruma.js");

    await expect(
      shikiBundleCodegen({
        ...baseOptions,
        engine: "oniguruma",
      }),
    ).toMatchFileSnapshot("./__snapshots__/oniguruma.ts");

    await expect(
      shikiBundleCodegen({
        ...baseOptions,
        engine: "javascript-raw",
        precompiled: true,
        shorthands: false,
      }),
    ).toMatchFileSnapshot("./__snapshots__/precompiled.ts");
  });

  it(`ensure "langs"`, () => {
    expect(() =>
      shikiBundleCodegen({
        ...baseOptions,
        langs: [],
        engine: "javascript",
      }),
    ).toThrow(`"langs" must contain at least one language`);

    expect(() =>
      shikiBundleCodegen({
        ...baseOptions,
        // @ts-expect-error
        langs: ["javascript", "@invalid-lang1", "typescript", "@invalid-lang2"],
        engine: "javascript",
      }),
    ).toThrow(`invalid language(s): @invalid-lang1, @invalid-lang2`);
  });

  it(`ensure "themes"`, () => {
    expect(() =>
      shikiBundleCodegen({
        ...baseOptions,
        themes: [],
        engine: "javascript",
      }),
    ).toThrow(`"themes" must contain at least one theme`);

    expect(() =>
      shikiBundleCodegen({
        ...baseOptions,
        // @ts-expect-error
        themes: ["github-dark", "@invalid-theme1", "vitesse-light", "@invalid-theme2"],
        engine: "javascript",
      }),
    ).toThrow(`invalid theme(s): @invalid-theme1, @invalid-theme2`);
  });

  it(`ensure "engine"`, () => {
    expect(() =>
      shikiBundleCodegen({
        ...baseOptions,
        // @ts-expect-error
        engine: "",
      }),
    ).toThrow(`"engine" must be one of [javascript, javascript-raw, oniguruma]`);

    expect(() =>
      shikiBundleCodegen({
        ...baseOptions,
        // @ts-expect-error
        engine: "invalid-engine",
      }),
    ).toThrow(`"engine" must be one of [javascript, javascript-raw, oniguruma]`);

    expect(() =>
      shikiBundleCodegen({
        ...baseOptions,
        engine: "oniguruma",
        precompiled: true,
      }),
    ).toThrow(
      `precompiled grammars are only available when using the JavaScript engine(javascript, javascript-raw)`,
    );
  });

  it(`custom "header"`, () => {
    const HEADER = `/* custom - header */`;

    const code = shikiBundleCodegen({
      ...baseOptions,
      engine: "javascript",
      header: HEADER,
    });

    expect(code.startsWith(HEADER)).toBe(true);
  });
});
