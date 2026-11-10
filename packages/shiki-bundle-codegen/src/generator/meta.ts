import type { EmptyRecord, ExtractRecord, ReadonlyFields } from "../typing";

type WritableMetaKey<T extends Record<any, any>> = keyof Omit<T, keyof ReadonlyFields<T>>;

export class Meta<const T extends Record<any, any> = EmptyRecord> {
  #context: T;

  constructor(context: T) {
    this.#context = {
      ...context,
    };
  }

  get context() {
    return {
      ...this.#context,
    };
  }

  get = <K extends ExtractRecord<T>["keys"]>(key: K): T[K] => {
    return this.#context[key];
  };

  set = <K extends WritableMetaKey<T>>(key: K, value: T[K]) => {
    this.#context[key] = value;
  };
}
