export type EmptyRecord = Record<never, any>;

export type ExtractRecord<T extends Record<any, any>> = {
  keys: keyof T;
  values: T[keyof T];
};

export type ReadonlyFields<T extends Record<any, any>> = {
  [K in keyof T as T[K] extends any[] ? never : T[K] extends ReadonlyArray<any> ? K : never]: T[K];
};
