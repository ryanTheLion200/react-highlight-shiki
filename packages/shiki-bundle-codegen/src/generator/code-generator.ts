import { CodeGeneratorBase, type CodeGeneratorFactory } from "./base";

export interface ShikiBundleCodeGeneratorMeta {
  langs: readonly string[];
  themes: readonly string[];
  engine: string;
  precompiled: boolean;
  typescript: boolean;
  shorthands: boolean;
}

type TypeOnlyNamedImport = string | boolean | { name: string; alias?: string };
type NamedImport = string | boolean | { type?: boolean; name: string; alias?: string };

type ImportSpec =
  | {
      typeOnly: boolean;
      default: string;
      named?: never;
      namespace?: never;
      from: string;
    }
  | {
      typeOnly: false;
      default?: string;
      named: NamedImport[];
      namespace?: never;
      from: string;
    }
  | {
      typeOnly: boolean;
      default?: never;
      named?: never;
      namespace: string;
      from: string;
    }
  | {
      typeOnly: true;
      default?: never;
      named: TypeOnlyNamedImport[];
      namespace?: never;
      from: string;
    }
  // raw
  // import(`M, { type A, fn } from "lib"`)
  // -> `import M, { type A, fn } from "lib"`
  //
  // import(`"./style.css"`)
  // -> `import "./style.css"`
  | string
  // empty
  | boolean;

type TypeOnlyNamedExport = string | boolean | { name: string; alias?: string };
type NamedExport = string | boolean | { type?: boolean; name: string; alias?: string };

type ExportSpec =
  | {
      typeOnly: boolean;
      named?: never;
      namespace?: string;
      from: string;
    }
  | {
      typeOnly: true;
      named: TypeOnlyNamedExport[];
      namespace?: never;
      from?: string;
    }
  | {
      typeOnly: false;
      named: NamedExport[];
      namespace?: never;
      from?: string;
    }
  // raw
  // export(`{ A, type B, C as D } from "lib"`)
  // -> `export { A, type B, C as D } from "lib"`
  //
  // export(`vars`)
  // -> `export vars`
  | string
  // empty
  | boolean;

export class ShikiBundleCodeGenerator extends CodeGeneratorBase<ShikiBundleCodeGeneratorMeta> {
  #importSpecs: ImportSpec[];
  #exportSpecs: ExportSpec[];

  constructor(meta: ShikiBundleCodeGeneratorMeta) {
    super({ meta });

    this.#importSpecs = [];
    this.#exportSpecs = [];
  }

  static get PURE_COMMENT() {
    return `/* @__PURE__ */`;
  }

  import(spec: ImportSpec): this;
  import(spec: CodeGeneratorFactory<ShikiBundleCodeGeneratorMeta, ImportSpec>): this;
  import(spec: ImportSpec | CodeGeneratorFactory<ShikiBundleCodeGeneratorMeta, ImportSpec>): this {
    this.#importSpecs.push(typeof spec === "function" ? spec(this.meta.context) : spec);

    return this;
  }

  imports(
    specs: (ImportSpec | CodeGeneratorFactory<ShikiBundleCodeGeneratorMeta, ImportSpec>)[],
  ): this {
    let metaContext = () => this.meta.context;
    metaContext = metaContext.bind(this);

    this.#importSpecs.push(
      ...specs.map((spec) => (typeof spec === "function" ? spec(metaContext()) : spec)),
    );

    return this;
  }

  #importFormat(spec: ImportSpec): string {
    const format = (() => {
      if (typeof spec === "boolean") return "";
      if (typeof spec === "string") return `import ${spec}`;

      const { typeOnly, default: _default, named, namespace, from } = spec;

      if (typeOnly) {
        const declaration = (() => {
          if (_default) return `type ${_default} from "${from}"`;
          if (namespace) return `type * as ${namespace} from "${from}"`;

          const namedImport = named?.length
            ? named
                .map((item) => {
                  if (typeof item === "boolean") return "";
                  if (typeof item === "string") return item;

                  return [item.name, item.alias && `as ${item.alias}`].filter(Boolean).join(" ");
                })
                .filter(Boolean)
                .join(", ")
            : "";

          return `type { ${namedImport} } from "${from}"`;
        })();

        return `import ${declaration}`;
      }

      const declaration = (() => {
        if (namespace) return `* as ${namespace} from "${from}"`;

        if (!named?.length) return _default ? `${_default} from "${from}"` : `"${from}"`;

        const namedImport = `${named
          .map((item) => {
            if (typeof item === "boolean") return "";
            if (typeof item === "string") return item;

            return [item.type && "type", item.name, item.alias && `as ${item.alias}`]
              .filter(Boolean)
              .join(" ");
          })
          .filter(Boolean)
          .join(", ")}`;

        if (!namedImport) return _default ? `${_default} from "${from}"` : `"${from}"`;

        return `${[_default, `{ ${namedImport} }`].filter(Boolean).join(", ")} from "${from}"`;
      })();

      return `import ${declaration}`;
    })();

    return format;
  }

  export(spec: ExportSpec): this;
  export(spec: CodeGeneratorFactory<ShikiBundleCodeGeneratorMeta, ExportSpec>): this;
  export(spec: ExportSpec | CodeGeneratorFactory<ShikiBundleCodeGeneratorMeta, ExportSpec>): this {
    this.#exportSpecs.push(typeof spec === "function" ? spec(this.meta.context) : spec);

    return this;
  }

  exports(
    specs: (ExportSpec | CodeGeneratorFactory<ShikiBundleCodeGeneratorMeta, ExportSpec>)[],
  ): this {
    let metaContext = () => this.meta.context;
    metaContext = metaContext.bind(this);

    this.#exportSpecs.push(
      ...specs.map((spec) => (typeof spec === "function" ? spec(metaContext()) : spec)),
    );

    return this;
  }

  #exportFormat(spec: ExportSpec): string {
    const format = (() => {
      if (typeof spec === "boolean") return "";
      if (typeof spec === "string") return `export ${spec}`;

      const { typeOnly, named, namespace, from } = spec;

      if (typeOnly) {
        const namedExport = (named ?? [])
          .map((item) => {
            if (typeof item === "boolean") return "";
            if (typeof item === "string") return item;

            return [item.name, item.alias && `as ${item.alias}`].filter(Boolean).join(" ");
          })
          .filter(Boolean);

        return [
          "export type",
          named ? `{ ${namedExport.join(", ")} }` : namespace ? `* as ${namespace}` : "*",
          from && `from "${from}"`,
        ]
          .filter(Boolean)
          .join(" ");
      }

      const namedExport = (named ?? [])
        .map((item) => {
          if (typeof item === "boolean") return "";
          if (typeof item === "string") return item;

          return [item.type && "type", item.name, item.alias && `as ${item.alias}`]
            .filter(Boolean)
            .join(" ");
        })
        .filter(Boolean);

      return [
        "export",
        named ? `{ ${namedExport.join(", ")} }` : namespace ? `* as ${namespace}` : "*",
        from && `from "${from}"`,
      ]
        .filter(Boolean)
        .join(" ");
    })();

    return format;
  }

  code(): string {
    const EOL = this.EOL;

    const _imports = (() => {
      const importList = this.#importSpecs.map((spec) => this.#importFormat(spec));

      return [...new Set(importList)].filter((format) => format.trim() !== "").join(EOL);
    })();

    const EOL_Regex = new RegExp(`${EOL}$`);
    const _contents = this.contents
      .map((line) => /* prevent duplicate EOL */ line.replace(EOL_Regex, ""))
      .join(EOL);

    const _exports = (() => {
      const exportList = this.#exportSpecs.map((spec) => this.#exportFormat(spec));

      return [...new Set(exportList)].filter((format) => format.trim() !== "").join(EOL);
    })();

    return [_imports, _contents, _exports]
      .filter((format) => format !== "")
      .flatMap((format, index, arr) => [format, index === arr.length - 1 ? EOL : EOL.repeat(2)])
      .join("");
  }
}
