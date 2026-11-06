import { bundledLanguagesInfo, bundledThemesInfo } from "shiki/bundle/full";

// language

const shikiGrammarLanguages = bundledLanguagesInfo.map(({ id }) => id);
const shikiGrammarLanguageSet = new Set(shikiGrammarLanguages);

export const ensureShikiGrammarLanguages = (langs: string[]) => {
  if (!langs.length) throw new Error(`"langs" must contain at least one language`);

  const langSet = new Set(langs);

  const invalidLangs = [...langSet].filter((lang) => !shikiGrammarLanguageSet.has(lang));

  if (invalidLangs.length) throw new Error(`invalid language(s): ${invalidLangs.join(", ")}`);

  return shikiGrammarLanguages.filter((grammarLang) => langSet.has(grammarLang));
};

export const ensureShikiAliasLanguageMapping = (langs: string[]) => {
  const grammarLangs = ensureShikiGrammarLanguages(langs);
  const grammarLangSet = new Set(grammarLangs);

  const entries = bundledLanguagesInfo
    .filter((info) => grammarLangSet.has(info.id) && info.aliases?.length)
    .flatMap((info) => info.aliases!.map((alias) => [alias, info.id]));

  return Object.fromEntries(entries);
};

export const ensureShikiBundledLanguageMapping = (langs: string[]) => {
  const grammarLangs = ensureShikiGrammarLanguages(langs);
  const grammarLangSet = new Set(grammarLangs);

  const entries = bundledLanguagesInfo
    .filter((info) => grammarLangSet.has(info.id))
    .flatMap((info) => {
      const entries = [[info.id, info.id]];

      if (info.aliases?.length) {
        entries.push(...info.aliases.map((alias) => [alias, info.id]));
      }

      return entries;
    });

  return Object.fromEntries(entries);
};

export const shikiSpecialLanguages = ["text", "ansi"];
export const shikiSpecialLanguageAliasMapping = {
  txt: "text",
  plain: "text",
  ansi: "ansi",
};

// theme

const shikiGrammarThemes = bundledThemesInfo.map((info) => info.id);
const shikiGrammarThemeSet = new Set(shikiGrammarThemes);

export const ensureShikiGrammarThemes = (themes: string[]) => {
  if (!themes.length) throw new Error(`"themes" must contain at least one theme`);

  const themeSet = new Set(themes);

  const invalidThemes = [...themeSet].filter((theme) => !shikiGrammarThemeSet.has(theme));

  if (invalidThemes.length) throw new Error(`invalid theme(s): ${invalidThemes.join(", ")}`);

  return shikiGrammarThemes.filter((grammarTheme) => themeSet.has(grammarTheme));
};

export const shikiSpecialThemes = ["none"];

// engine

const precompileEngines = ["javascript", "javascript-raw"];
const shikiEngines = [...precompileEngines, "oniguruma"];

export const ensureShikiEngine = (engine: string, { precompiled }: { precompiled: boolean }) => {
  if (!engine) throw new Error(`"engine" must be one of [${shikiEngines.join(", ")}]`);

  switch (engine) {
    case "javascript":
    case "javascript-raw": {
      break;
    }

    case "oniguruma": {
      if (precompiled)
        throw new Error(
          `precompiled grammars are only available when using the JavaScript engine(${precompileEngines.join(", ")})`,
        );

      break;
    }

    default: {
      throw new Error(`"engine" must be one of [${shikiEngines.join(", ")}]`);
    }
  }

  return engine;
};
