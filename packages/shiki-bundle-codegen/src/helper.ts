import type { NonArrayObject, ObjectEntry } from "./typing";

type TemplateStringParams = [strings: TemplateStringsArray, ...values: unknown[]];
type TemplateStrings<Return = string> = (...args: TemplateStringParams) => Return;

type ObjectFormatMapFn<T extends object, Return extends string = string> =
  NonArrayObject<T> extends never ? never : (entry: ObjectEntry<T>) => Return;

interface TypeFormatHelpersOption {
  typescript: boolean;
}

interface TypeFormatHelper {
  typeAnnotation: TemplateStrings;
  generic: TemplateStrings;
}

export const templateStrings: TemplateStrings = (strings, ...values) =>
  strings.reduce(
    (acc, str, index) => `${acc}${str}${index < values.length ? values[index] : ""}`,
    "",
  );

export const genStringLiteralType = (strings: Array<string> | ReadonlyArray<string>) =>
  strings.map((key) => `"${key}"`).join(" | ");

export const genObjectLiteral =
  <
    T extends object,
    FormatFn extends ObjectFormatMapFn<T, Return>,
    Return extends string = ReturnType<FormatFn>,
  >({
    typescript,
  }: {
    typescript: boolean;
  }) =>
  (obj: T, format?: FormatFn) => {
    const mappedObject = Object.keys(obj).reduce(
      (acc, key) => {
        return {
          ...acc,
          [key]: format
            ? format({ key: key as keyof T, value: obj[key as keyof T] })
            : `${obj[key as keyof T]}`,
        };
      },
      {} as Record<keyof T, Return>,
    );

    const literal = `{ ${Object.entries(mappedObject)
      .map(([key, value]) => `${/[-+#]/.test(key) ? `"${key}"` : key}: ${value}`)
      .join(", ")} }`;

    return {
      literal,
      as(asType: string) {
        if (typescript) return literal.concat(` as ${asType}`);

        return literal;
      },
    };
  };

export class TypeFormatHelpers implements TypeFormatHelper {
  #options: TypeFormatHelpersOption;

  constructor(options: TypeFormatHelpersOption) {
    this.#options = {
      ...options,
    };
  }

  get typescript() {
    return this.#options.typescript;
  }

  typeAnnotation: TypeFormatHelper["typeAnnotation"] = (strings, ...values) => {
    if (this.typescript) {
      return `: ${templateStrings(strings, ...values)}`;
    }

    return "";
  };

  generic: TypeFormatHelper["generic"] = (strings, ...values) => {
    if (this.typescript) {
      return `<${templateStrings(strings, ...values)}>`;
    }

    return "";
  };
}
