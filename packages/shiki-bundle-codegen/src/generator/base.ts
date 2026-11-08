import type { EmptyRecord } from "../typing";
import { Meta } from "./meta";

export type CodeGeneratorConstructParams<T> = [EmptyRecord] extends [T]
  ? [options?: { meta?: T }]
  : [options: { meta: T }];

export type LineContent =
  | string
  // empty
  | boolean;

export type LineRepeatCount = 1 | 2 | 3 | 4;

export type CodeGeneratorFactory<T extends Record<any, any>, Return, P extends any[] = []> = (
  ...args: [meta: T, ...P]
) => Return;

export abstract class CodeGeneratorBase<T extends Record<any, any> = EmptyRecord> {
  protected contents: string[];

  #meta: Meta<T>;

  constructor(...params: CodeGeneratorConstructParams<T>) {
    const [options] = params as [options?: { meta?: T }];

    this.contents = [];
    this.#meta = new Meta(options?.meta ?? ({} as T));
  }

  get meta() {
    return {
      get: this.#meta.get,
      set: (...args: Parameters<Meta<T>["set"]>) => {
        this.#meta.set(...args);

        return this;
      },
      context: {
        ...this.#meta.context,
      },
    };
  }

  get EOL() {
    return "\n";
  }

  line(content: LineContent): this;
  line(content: CodeGeneratorFactory<T, LineContent>): this;
  line(content: LineContent | CodeGeneratorFactory<T, LineContent>): this {
    const lineContent = typeof content === "function" ? content(this.#meta.context) : content;

    if (typeof lineContent === "boolean") return this;

    this.contents.push(lineContent);

    return this;
  }

  lines(contents: (LineContent | CodeGeneratorFactory<T, LineContent>)[]): this {
    for (const content of contents) {
      const lineContent = typeof content === "function" ? content(this.#meta.context) : content;

      if (typeof lineContent === "boolean") continue;

      this.contents.push(lineContent);
    }

    return this;
  }

  newLine(repeat?: LineRepeatCount): this {
    const EOL = this.EOL;

    this.contents.push(...Array.from({ length: repeat || 1 }, () => EOL));

    return this;
  }

  abstract code(): string;
}
